export const SET_STATE = 'SET_STATE';
export const CLEAR_STATE = 'CLEAR_STATE';
export const REMOVE = 'REMOVE';

const { getPrototypeOf, assign, values, keys, } = Object;

const leafs= {
  Number: true,
  String: true,
  RegExp: true,
  Boolean: true,
};

export default class SubStore {

  static lastChange;
  static _maxDepth = 100;
  __substore_id__;
  __substore_identity__;
  state;
  prevState = {};
  __substore_parent__;

  constructor(initialValue, id, parent, depth, shape) {
    if (depth>SubStore._maxDepth) { SubStore.__kill(); }
    this.__substore_shape__= shape;
    this._depth = depth;
    this.__substore_id__ = id;
    this.__substore_parent__ = parent;
    this.__substore_identity__ = [ ...parent.__substore_identity__, id, ];
    for (const k in initialValue) {
      if (SubStore.couldBeParent(initialValue[k])) {
        initialValue[k] = this._createSubStore(initialValue[k], k, this, depth + 1, shape).state;
      }
    }
    this.state = initialValue;
  }

  singleUpdate(callBack) {
    const { __substore_parent__, state, __substore_identity__, } = this;
    this.__substore_parent__ = { _notifyUp() {}, };
    callBack(this);
    this.__substore_parent__ = __substore_parent__;
    if (this.state!==state) {
      SubStore.lastChange = { func: CLEAR_STATE, target: __substore_identity__, param: this.state, };
      this.__substore_parent__._notifyUp(this);
    }
    return this;
  }

  getParent() {
    return this.__substore_parent__;
  }

  getId() {
    return this.__substore_id__;
  }

  getIdentity() {
    return this.__substore_identity__;
  }

  stillAttatched() {
    return !!this.__substore_parent__
  }

  setState(value) {
    const { state: prevState, __substore_parent__, } = this;
    if (value instanceof SubStore) {
      throw new Error('SubStore does not take other SubStores as setState parameters. Got:', `${value}. Identity:`, JSON.stringify(this.__substore_identity__));
    } else if (!__substore_parent__) {
      throw new Error('detached SubStore action: setState', JSON.stringify(this.__substore_identity__));
    }
    if (SubStore.couldBeParent(value) && SubStore.couldBeParent(prevState) && !(value instanceof Array || prevState instanceof Array)) {
      this._merge(value, prevState);
    } else {
      this._reset(value, prevState);
    }
    this.prevState = prevState;
    SubStore.lastChange = { func: SET_STATE, target: this.__substore_identity__, param: value, };
    __substore_parent__._notifyUp(this);
    return this;
  }

  clearState(value) {
    if (!this.__substore_parent__) {
      throw new Error('detached SubStore action: clearState', JSON.stringify(this.__substore_identity__));
    } else if (value instanceof SubStore) {
      throw new Error('SubStore does not take other SubStores as resetState parameters. Got:', `${value}. Identity:`, JSON.stringify(this.__substore_identity__));
    }
    const prevState = this.state;
    this._reset(value, prevState);
    SubStore.lastChange = { func: CLEAR_STATE, target: this.__substore_identity__, param: value, };
    this.__substore_parent__._notifyUp(this);
    return this;
  }

  remove(...keys) {
    if (!this.__substore_parent__) {
      throw new Error('detached SubStore action: remove', JSON.stringify(this.__substore_identity__));
    }
    this._remove(keys);
    return this;
  }

  removeSelf() {
    if (!this.__substore_parent__) {
      throw new Error('detached SubStore action: remove', JSON.stringify(this.__substore_identity__));
    }
    this.__substore_parent__._remove([ this.__substore_id__, ]);
  }

  _remove(keys) {
    const { state, } = this;
    this.prevState = state;
    if (SubStore.couldBeParent(state)) {
      let nextState;
      if (state instanceof Array) {
        nextState = this._removeFromArrayState(keys);
      } else {
        nextState = this._removeFromObjectState(keys);
      }
      this.state = nextState;
      SubStore.lastChange = { func: REMOVE, target: this.__substore_identity__, param: keys, };
      this.__substore_parent__._notifyUp(this);
    } else {
      console.error('Remove error:', `${JSON.stringify(this.__substore_identity__)}. Has no children, was given,${JSON.stringify(keys)} when state: ${state}`);
    }
  }

  _removeFromArrayState(indexes) {
    const set = indexes.reduce(function (acc, i) { acc[i] = true; return acc; }, {});
    const nextState = [];
    const { state, } = this;
    const stateLength = state.length;
    for (let i = 0; i<stateLength; i++) {
      const { length, } = nextState;
      if (!set[i]) {
        if (i !== length && this[i]) {
          const target = this[i];
          this[length] = target;
          delete this[i];
          target.__substore_identity__[target.__substore_identity__.length-1] = length;
          target.__substore_id__ = length;
        }
        nextState.push(state[i]);
      } else if (SubStore.couldBeParent(state[i])) {
        this._removeChild(i);
      }
    }
    return nextState;
  }

  _removeFromObjectState(keys) {
    const nextState = { ...this.state, };
    for (const k of keys) {
      delete nextState[k];
      if (this[k]) {
        this._removeChild(k);
      }
    }
    return nextState;
  }

  _merge(obj, prevState) {
    const nextState = { ...prevState, ...obj, };
    for (const k in nextState) {
      const child = this[k];
      if (child) {
        if (obj.hasOwnProperty(k) && obj[k]!==prevState[k]) {
          if (SubStore.couldBeParent(obj[k])) {
            nextState[k] = child._reset(obj[k], prevState[k]).state;
          } else {
            this._removeChild(k);
          }
        }
      } else if (SubStore.couldBeParent(obj[k])) {
        nextState[k] = this._createSubStore(obj[k], k, this, this._depth + 1, this.__substore_shape__).state;
      }
    }
    this.state = nextState;
    return this;
  }

  _reset(nextState, prevState) {
    this.prevState = prevState;
    if (SubStore.couldBeParent(nextState)) {
      const { __substore_shape__, _depth, } = this;
      if (SubStore.couldBeParent(prevState)) {
        const merge = { ...prevState, ...nextState, };
        for (const k in merge) {
          const child = this[k];
          const next = nextState[k];
          if (child) {
            if (nextState.hasOwnProperty(k)) {
              if (next !== prevState[k] && SubStore.couldBeParent(next)) {
                nextState[k] = child._reset(next, prevState[k]).state;
              }
            } else {
              this._removeChild(k);
            }
          } else if (SubStore.couldBeParent(next)) {
            nextState[k] = this._createSubStore(next, k, this, _depth + 1, __substore_shape__).state;
          }
        }
      } else {
        for (const k in nextState) {
          if (SubStore.couldBeParent(nextState[k])) {
            nextState[k] = this._createSubStore(nextState[k], k, this, _depth + 1, __substore_shape__).state;
          }
        }
      }
    } else if (SubStore.couldBeParent(prevState)) {
      for (const k in prevState) {
        if (SubStore.couldBeParent(prevState[k])) {
          this._removeChild(k);
        }
      }
    }
    this.state = nextState instanceof Array ? values(nextState) : nextState;
    return this;
  }

  _notifyUp(child) {
    const { __substore_id__, state, } = child;
    const prevState = this.state;
    if (prevState instanceof Array) {
      this.state = [ ...prevState.slice(0, __substore_id__), state, ...prevState.slice(Number(__substore_id__)+1, prevState.length), ];
    } else {
      this.state = { ...prevState, [__substore_id__]: state, };
    }
    this.prevState = prevState;
    if (this.__substore_parent__) {
      this.__substore_parent__._notifyUp(this);
    } else {
      throw new Error('Detached Child SubStore cannot be modified:', JSON.stringify(this.__substore_identity__));
    }
  }

  _removeChild(k) {
    const target = this[k];
    const { state, } = target;
    if (SubStore.couldBeParent(state)) {
      for (const key in state) {
        if (target[key]) {
          target._removeChild(key);
        }
      }
    }
    assign(target, { __substore_parent__: undefined, __substore_shape__: undefined, state: undefined, prevState: state, });
    delete this[k];
  }

  getChildrenRecursively() {
    const onReduceChildren = function (acc, child) {
      return [ ...acc, child, ...child.getChildrenRecursively(), ];
    };
    return this.getChildren().reduce(onReduceChildren, []);
  }

  getChildren() {
    // refactor
    return values(this).filter(v => v instanceof SubStore && v!==this.__substore_parent__);
  }

  _createSubStore(initialState, k, parent, depth) {
    return this[k] = new SubStore(initialState, k, parent, depth);
  }

  static __kill() { /* redefined by StoreCreator*/ }

  static couldBeParent(value) {
    return value && value instanceof Object && !leafs[getPrototypeOf(value).constructor.name];
  }
}