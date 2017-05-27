const { keys, } = Object;
export const SET_STATE = Symbol.for('SET_STATE');
export const RESET_STATE = Symbol.for('RESET_STATE');
export const REMOVE = Symbol.for('REMOVE');

export default class SimpleSubStore {

  static lastInteraction;
  _id;
  _identity;
  state;
  prevState = {};

  constructor(initialValue, key, parent, depth = 0) {
    if (depth > 100) { SimpleSubStore.__kill(); }
    this._depth = depth;
    this._id = key;
    this._parent = parent;
    this._setInitialState(initialValue);
  }

  _setInitialState(initialValue) {
    if (initialValue instanceof Object) {
      for (const k in initialValue) {
        this[k] = new SimpleSubStore(initialValue[k], k, this, this._depth + 1);
      }
    }
    this.state = initialValue;
    this._identity = SimpleSubStore.identityOf(this).reverse();
  }

  setState(value) {
    if (this._parent) {
      const { state: prevState, _parent, } = this;
      if (value instanceof Object && prevState instanceof Object) {
        this.state = this._merge(value, prevState);
      } else {
        this._reset(value, prevState);
      }
      this.prevState = prevState;
      SimpleSubStore.lastInteraction = { func: SET_STATE, target: this._identity, param: value, };
      _parent._notifyUp(this);
      return this;
    }
    throw new Error('detached SubStore action: setState', JSON.stringify(this._identity));
  }

  clearState(newValue) {
    if (this._parent) {
      const prevState = this.state;
      this._reset(newValue, prevState);
      this.prevState = prevState;
      SimpleSubStore.lastInteraction = { func: RESET_STATE, target: this._identity, param: newValue, };
      this._parent._notifyUp(this);
      return this;
    }
    throw new Error('detached SubStore action: clearState', JSON.stringify(this._identity));
  }

  remove(...ids) {
    if (this._parent) {
      if (ids.length) {
        this.prevState = this.state;
        if (!(this.state instanceof Object)) {
          throw new Error('Remove error:', `${JSON.stringify(this._identity)}. Has no children, was given,${JSON.stringify(ids)} when state: ${this.state}`);
        }
        const nextState = { ...this.state, };
        for (const id of ids) {
          if (nextState[id]) {
            delete nextState[id];
            const targetChild = this[id];
            targetChild._onDetach();
            delete this[id];
          } else {
            throw new Error('Remove error:', JSON.stringify(this._identity), `Has no such child as ${id} when state: ${JSON.stringify(this.state, null, 1)}`);
          }
        }
        this.state = nextState;
        SimpleSubStore.lastInteraction = { target: this._identity, func: REMOVE, param: ids, };
        this._parent._notifyUp(this);
      } else {
        this._parent.remove(this._id);
      }
      return this;
    }
    throw new Error('detached SubStore action: remove', JSON.stringify(this._identity));
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
        this[k] = new SimpleSubStore(obj[k], k, this, this._depth + 1);
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
            this[k] = new SimpleSubStore(nextState[k], k, this, this._depth + 1);
          }
        }
      } else {
        for (const k in nextState) {
          this[k] = new SimpleSubStore(nextState[k], k, this, this._depth + 1);
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
  _getChildrenRecursively() {
    return this.children()
      .reduce((acc, child) => {
        acc.push(child);
        return [ ...acc, ...child._getChildrenRecursively(), ];
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

  static identityOf(subject, acc = []) {
    acc.push(subject._id);
    if (subject._parent._id !== '__ground__') {
      SimpleSubStore.identityOf(subject._parent, acc);
    }
    return acc;
  }

  static __kill() { /* redefined by StoreCreator*/ }
}