const { keys, } = Object;
export const SET_STATE = 'SET_STATE';
export const CLEAR_STATE = 'CLEAR_STATE';
export const REMOVE = 'REMOVE';

export default class SubStore {

  static lastInteraction;
  _id;
  _identity;
  state;
  prevState = {};

  constructor(initialValue, key, parent, depth = 0) {
    if (depth > 100) { SubStore.__kill(); }
    this._depth = depth;
    this._id = key;
    this._parent = parent;
    this._identity = [ ...parent._identity, key, ];
    this._setInitialState(initialValue);
  }

  _setInitialState(initialValue) {
    if (initialValue instanceof Object) {
      for (const k in initialValue) {
        this[k] = new SubStore(initialValue[k], k, this, this._depth + 1);
      }
    }
    this.state = initialValue;
  }

  singleUpdate(callBack) {
    const { _parent, } = this;
    this._parent = { _notifyUp() {}, };
    const result = callBack(this);
    this._parent = _parent;
    return result;
  }

  getParent() {
    return this._parent;
  }

  getId() {
    return this._id;
  }

  setState(value) {
    if (value instanceof SubStore) {
      throw new Error('SubStore does not take other SubStores as setState parameters. Got:', `${value}. Identity:`, JSON.stringify(this._identity));
    } else if (!this._parent) {
      throw new Error('detached SubStore action: setState', JSON.stringify(this._identity));
    }
    const { state: prevState, _parent, } = this;
    if (value instanceof Object && prevState instanceof Object) {
      this.state = this._merge(value,
            prevState);
    } else {
      this._reset(value,
            prevState);
    }
    this.prevState = prevState;
    SubStore.lastInteraction = { func: SET_STATE, target: this._identity, param: value, };
    _parent._notifyUp(this);
    return this;
  }

  clearState(value) {
    if (!this._parent) {
      throw new Error('detached SubStore action: clearState', JSON.stringify(this._identity));
    } else if (value instanceof SubStore) {
      throw new Error('SubStore does not take other SubStores as resetState parameters. Got:', `${value}. Identity:`, JSON.stringify(this._identity));
    }
    const prevState = this.state;
    this._reset(value, prevState);
    this.prevState = prevState;
    SubStore.lastInteraction = { func: CLEAR_STATE, target: this._identity, param: value, };
    this._parent._notifyUp(this);
    return this;
  }

  remove(...ids) {
    if (!this._parent) {
      throw new Error('detached SubStore action: remove', JSON.stringify(this._identity));
    }
    if (ids.length) {
      this.prevState = this.state;
      if (!(this.state instanceof Object)) {
        throw new Error('Remove error:', `${JSON.stringify(this._identity)}. Has no children, was given,${JSON.stringify(ids)} when state: ${this.state}`);
      }
      const nextState = { ...this.state, };
      for (const id of ids) {
        if (this[id] && this[id] instanceof SubStore) {
          delete nextState[id];
          const targetChild = this[id];
          targetChild._onDetach();
          delete this[id];
        } else {
          throw new Error('Remove error:', JSON.stringify(this._identity), `Has no such child as ${id} when state: ${JSON.stringify(this.state, null, 1)}`);
        }
      }
      this.state = nextState;
      SubStore.lastInteraction = { target: this._identity, func: REMOVE, param: ids, };
      this._parent._notifyUp(this);
    } else {
      this._parent.remove(this._id);
    }
    return this;
  }

  _merge(obj, prevState) {
    const nextState = { ...prevState, ...obj, };
    for (const k in nextState) {
      const child = this[k];
      if (child) {
        if (obj.hasOwnProperty(k)) {
          child._reset(obj[k], prevState[k]);
        }
      } else {
        this[k] = new SubStore(obj[k], k, this, this._depth + 1);
      }
    }
    return nextState;
  }

  _reset(nextState, prevState) {
    if (nextState instanceof Object) {
      if (prevState instanceof Object) {
        const merge = { ...prevState, ...nextState, };
        for (const k in merge) {
          if (this[k]) {
            if (nextState.hasOwnProperty(k)) {
              this[k]._reset(nextState[k], prevState[k]);
            } else {
              this[k]._onDetach();
              delete this[k];
            }
          } else {
            this[k] = new SubStore(nextState[k], k, this, this._depth + 1);
          }
        }
      } else {
        for (const k in nextState) {
          this[k] = new SubStore(nextState[k], k, this, this._depth + 1);
        }
      }
    } else if (prevState instanceof Object) {
      for (const k in prevState) {
        this[k]._onDetach();
        delete this[k];
      }
    }
    this.state = nextState;
  }

  _notifyUp(child) {
    const { _id, state, } = child;
    const prevState = this.state;
    this.state = { ...prevState, [_id]: state, };
    this.prevState = prevState;
    this._parent._notifyUp(this);
  }

  /* for testing and debug*/
  getChildrenRecursively() {
    return this.children()
      .reduce((acc, child) => {
        acc.push(child);
        return [ ...acc, ...child.getChildrenRecursively(), ];
      }, []);
  }

  _onDetach() {
    const ownChildren = this.children();
    delete this._parent;
    this.prevState = this.state;
    delete this.state;
    for (const child of ownChildren) {
      child._onDetach();
    }
  }

  children() {
    return this.state instanceof Object
      ? keys(this.state)
      .map(k => this[k])
      : [];
  }

  static __kill() { /* redefined by StoreCreator*/ }
}