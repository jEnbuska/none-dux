const { keys, values, } = Object;
export const SET_STATE = 'SET_STATE';
export const CLEAR_STATE = 'CLEAR_STATE';
export const REMOVE = 'REMOVE';

export function couldHaveChildren(value) {
  return value && value instanceof Object && !(value instanceof Function) && !(value instanceof RegExp);
}

export default class SubStore {

  static lastChange;
  static _maxDepth = 100;
  _id;
  _identity;
  state;
  prevState = {};

  constructor(initialValue, key, parent, depth, _shape) {
    if (depth>SubStore._maxDepth) { SubStore.__kill(); }
    this._shape= _shape;
    this._depth = depth;
    this._id = key;
    this._parent = parent;
    this._identity = [ ...parent._identity, key, ];
    if (couldHaveChildren(initialValue)) {
      for (const k in initialValue) {
        this._createSubStore(initialValue[k], k, this, depth + 1, _shape);
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
      SubStore.lastChange = { func: CLEAR_STATE, target: _identity, param: this.state, };
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
    if (couldHaveChildren(value) && couldHaveChildren(prevState) && !(value instanceof Array || prevState instanceof Array)) {
      this._merge(value, prevState);
    } else {
      this._reset(value, prevState);
    }
    this.prevState = prevState;
    SubStore.lastChange = { func: SET_STATE, target: this._identity, param: value, };
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
    SubStore.lastChange = { func: CLEAR_STATE, target: this._identity, param: value, };
    this._parent._notifyUp(this);
    return this;
  }

  remove(...ids) {
    if (!this._parent) {
      throw new Error('detached SubStore action: remove', JSON.stringify(this._identity));
    }
    const { state, } = this;
    if (ids.length) {
      this.prevState = state;
      if (!(couldHaveChildren(state))) {
        throw new Error('Remove error:', `${JSON.stringify(this._identity)}. Has no children, was given,${JSON.stringify(ids)} when state: ${state}`);
      }
      let nextState;
      if (state instanceof Array) {
        const set = ids.reduce(function (acc, i) { acc[i] = true; return acc; }, {});
        nextState = state.reduce((acc, next, i) => {
          const { length, } = acc;
          if (!set[i]) {
            if (i !== length) {
              const target = this[i];
              this[length] = target;
              delete this[i];
              target._id = length;
            }
            acc.push(next);
          } else {
            delete this[i]._parent;
            delete this[i];
          }
          return acc;
        }, []);
      } else {
        nextState = { ...state, };
        for (const id of ids) {
          if (this[id] && this[id] instanceof SubStore) {
            delete nextState[id];
            delete this[id]._parent;
            delete this[id];
          } else {
            throw new Error('Remove error:',
              JSON.stringify(this._identity),
              `Has no such child as ${id} when state: ${JSON.stringify(this.state, null, 1)}`);
          }
        }
      }
      this.state = nextState;
      SubStore.lastChange = { target: this._identity, func: REMOVE, param: ids, };
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
        if (obj.hasOwnProperty(k) && obj[k]!==prevState[k]) {
          child._reset(obj[k], prevState[k]);
        }
      } else {
        this._createSubStore(obj[k], k, this, this._depth + 1, this._shape);
      }
    }
    this.state = nextState;
  }

  _reset(nextState, prevState) {
    if (couldHaveChildren(nextState)) {
      const { _shape, _depth, } = this;
      if (couldHaveChildren(prevState)) {
        const merge = { ...prevState, ...nextState, };
        for (const k in merge) {
          if (this[k]) {
            if (nextState.hasOwnProperty(k)) {
              if (nextState[k] !== prevState[k]) {
                this[k]._reset(nextState[k], prevState[k]);
              }
            } else {
              delete this[k]._parent;
              delete this[k];
            }
          } else {
            this._createSubStore(nextState[k], k, this, _depth + 1, _shape);
          }
        }
      } else {
        for (const k in nextState) {
          this._createSubStore(nextState[k], k, this, _depth + 1, _shape);
        }
      }
    } else if (couldHaveChildren(prevState)) {
      for (const k in prevState) {
        delete this[k]._parent;
        delete this[k];
      }
    }
    this.state = nextState instanceof Array ? values(nextState) : nextState;
  }

  _notifyUp(child) {
    const { _id, state, } = child;
    const prevState = this.state;
    if (prevState instanceof Array) {
      this.state = [ ...prevState.slice(0, _id), state, ...prevState.slice(_id+1, prevState.length), ];
    } else {
      this.state = { ...prevState, [_id]: state, };
    }
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
    const { state, } = this;
    return couldHaveChildren(state)
      ? keys(state)
      .map(k => this[k])
      : [];
  }

  _createSubStore(initialState, key, parent, depth) {
    this[key] = new SubStore(initialState, key, parent, depth);
  }

  static __kill() { /* redefined by StoreCreator*/ }
}