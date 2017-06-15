const { keys, } = Object;
export const SET_STATE = 'SET_STATE';
export const CLEAR_STATE = 'CLEAR_STATE';
export const REMOVE = 'REMOVE';

export default class SubStore {

  static lastInteraction;
  static _maxDepth = 100;
  _id;
  _identity;
  state;
  prevState = {};

  constructor(initialValue, key, parent, depth, shape) {
    if (depth>SubStore._maxDepth) { SubStore.__kill(); }
    this.shape= shape;
    this._depth = depth;
    this._id = key;
    this._parent = parent;
    this._identity = [ ...parent._identity, key, ];
    if (initialValue instanceof Object) {
      for (const k in initialValue) {
        this._createSubStore(initialValue[k], k, this, depth + 1, shape);
      }
    }
    this.state = initialValue;
  }

  singleUpdate(callBack) {
    const { _parent, state, _identity, } = this;
    this._parent = { _notifyUp() {}, };
    callBack(this);
    this._parent = _parent;
    if (this.state!==state) {
      SubStore.lastInteraction = { func: CLEAR_STATE, target: _identity, param: this.state, };
      this._parent._notifyUp(this);
    }
    return this;
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
      this._merge(value, prevState);
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
          delete this[id]._parent;
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
        this._createSubStore(obj[k], k, this, this._depth + 1);
      }
    }
    this.state = nextState;
  }

  _reset(nextState, prevState) {
    if (nextState instanceof Object) {
      const { shape, _depth, } = this;
      if (prevState instanceof Object) {
        const merge = { ...prevState, ...nextState, };

        for (const k in merge) {
          if (this[k]) {
            if (nextState.hasOwnProperty(k)) {
              this[k]._reset(nextState[k], prevState[k]);
            } else {
              delete this[k]._parent;
              delete this[k];
            }
          } else {
            this._createSubStore(nextState[k], k, this, _depth + 1, shape);
          }
        }
      } else {
        for (const k in nextState) {
          this._createSubStore(nextState[k], k, this, _depth + 1, shape);
        }
      }
    } else if (prevState instanceof Object) {
      for (const k in prevState) {
        delete this[k]._parent;
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
    if (this._parent) {
      this._parent._notifyUp(this);
    } else {
      throw new Error('Child of detached SubStore cannot be modified:', JSON.stringify(this._identity));
    }
  }

  getChildrenRecursively() {
    return this.getChildren()
      .reduce((acc, child) => {
        acc.push(child);
        return [ ...acc, ...child.getChildrenRecursively(), ];
      }, []);
  }

  getChildren() {
    return this.state instanceof Object
      ? keys(this.state)
      .map(k => this[k])
      : [];
  }

  _createSubStore(initialState, key, parent, depth) {
    this[key] = new SubStore(initialState, key, parent, depth);
  }

  static __kill() { /* redefined by StoreCreator*/ }
}