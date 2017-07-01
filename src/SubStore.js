import { SET_STATE, CLEAR_STATE, REMOVE, stringify, exists, valueCouldBeSubStore, } from './common';

const { assign, values, keys, } = Object;

export default class SubStore {

  static lastChange;
  static _maxDepth = 100;

  state;
  prevState = {};

  __substore_id__;
  __substore_identity__;
  __substore_parent__;

  constructor(initialValue, id, parent, depth, shape) {
    if (depth>SubStore._maxDepth) { SubStore.__kill(); }
    this.__substore_shape__= shape;
    this.__substore_depth__ = depth;
    this.__substore_id__ = id;
    this.__substore_parent__ = parent;
    this.__substore_identity__ = [ ...parent.__substore_identity__, id, ];
    let initialState;
    if (initialValue instanceof Array) {
      initialState = [ ...initialValue, ];
    } else {
      initialState= { ...initialValue, };
    }
    for (const k in initialState) {
      if (valueCouldBeSubStore(initialState[k])) {
        initialState[k] = this._createSubStore(initialState[k], k, this, depth + 1, shape).state;
      }
    }
    this.state = initialState;
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

  setState(value) {
    if (valueCouldBeSubStore(value)) {
      const { state: prevState, __substore_parent__, } = this;
      if (value instanceof SubStore) {
        throw new Error('SubStore does not take other SubStores as setState parameters. Got:', `${value}. Identity:`, JSON.stringify(this.__substore_identity__));
      } else if (!__substore_parent__) {
        throw new Error('detached SubStore action: setState', JSON.stringify(this.__substore_identity__));
      }
      SubStore.lastChange = { func: SET_STATE, target: this.__substore_identity__, param: value, };
      if (!(value instanceof Array || prevState instanceof Array)) {
        this._merge(value, prevState);
      } else {
        this._reset(value, prevState);
      }
      this.prevState = prevState;

      __substore_parent__._notifyUp(this);
      return this;
    }
    throw new Error(`${JSON.stringify(this.__substore_identity__)}. Expected setState parameter to be an Object or Array, but got ${value}.`);
  }

  getChildrenRecursively() {
    const onReduceChildren = function (acc, child) {
      return [ ...acc, child, ...child.getChildrenRecursively(), ];
    };
    return this.getChildren().reduce(onReduceChildren, []);
  }

  getChildren() {
    return keys(this.state)
      .map(k => this[k])
      .filter(exists);
  }

  clearState(value) {
    const { __substore_parent__, } = this;
    if (valueCouldBeSubStore(value)) {
      if (!__substore_parent__) {
        throw new Error('detached SubStore action: clearState',
          JSON.stringify(this.__substore_identity__));
      } else if (value instanceof SubStore) {
        throw new Error('SubStore does not take other SubStores as resetState parameters. Got:',
          `${value}. Identity:`,
          JSON.stringify(this.__substore_identity__));
      }
      const prevState = this.state;
      SubStore.lastChange = { func: CLEAR_STATE, target: this.__substore_identity__, param: value, };
      this._reset(value, prevState);
      __substore_parent__._notifyUp(this);
      return this;
    }
    throw new Error(`${JSON.stringify(this.__substore_identity__)}. Expected clearState parameter to be an Object or Array, but got ${value}.`);
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

  remove(...keys) {
    if (!this.__substore_parent__) {
      throw new Error('detached SubStore action: remove', JSON.stringify(this.__substore_identity__));
    }
    SubStore.lastChange = { func: REMOVE, target: this.__substore_identity__, param: keys, };
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
    if (valueCouldBeSubStore(state)) {
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
      console.error('Remove error:', `${JSON.stringify(this.__substore_identity__)}. Has no children, was given,${JSON.stringify(keys)} when state: ${stringify(state)}`);
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
      } else if (valueCouldBeSubStore(state[i])) {
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
    const nextState = {};
    for (const k in obj) {
      const child = this[k];
      const next = obj[k];
      if (child) {
        if (next!==prevState[k]) {
          if (valueCouldBeSubStore(next)) {
            nextState[k] = child._reset(next, prevState[k]).state;
          } else {
            this._removeChild(k);
            nextState[k] = next;
          }
        }
      } else if (valueCouldBeSubStore(next)) {
        nextState[k] = this._createSubStore(next, k, this, this.__substore_depth__ + 1, this.__substore_shape__).state;
      } else {
        nextState[k] = next;
      }
    }
    this.state = { ...prevState, ...nextState, };
    return this;
  }

  _reset(value, prevState) {
    this.prevState = prevState;
    const merge = { ...prevState, ...value, };
    const nextState = {};
    for (const k in merge) {
      const child = this[k];
      const next = value[k];
      if (child) {
        if (value.hasOwnProperty(k)) {
          if (next !== prevState[k]) {
            if (valueCouldBeSubStore(next)) {
              nextState[k] = child._reset(next, prevState[k]).state;
            } else {
              this._removeChild(k);
              nextState[k] = next;
            }
          } else {
            nextState[k] = next;
          }
        } else {
          this._removeChild(k);
        }
      } else if (valueCouldBeSubStore(next)) {
        nextState[k] = this._createSubStore(next, k, this).state;
      } else if (value.hasOwnProperty(k)) {
        nextState[k] = next;
      }
    }
    this.state = value instanceof Array ? values(nextState) : nextState;
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
    if (valueCouldBeSubStore(state)) {
      for (const key in state) {
        if (target[key]) {
          target._removeChild(key);
        }
      }
    }
    assign(target, { __substore_parent__: undefined, __substore_shape__: undefined, state: undefined, prevState: state, });
    delete this[k];
  }

  _createSubStore(initialState, k, parent) {
    this[k] = new SubStore(initialState, k, parent, this.__substore_depth__ + 1);
    return this[k];
  }

  static __kill() { /* redefined by StoreCreator*/ }
}