import { SET_STATE, CLEAR_STATE, REMOVE, } from './common';

const { getPrototypeOf, assign, values, } = Object;

export default class AutoReducer {

  static __kill(target) {
    console.trace();
    throw new Error('AutoReducer maximum depth '+AutoReducer.maxDepth+' exceeded by "'+target.__autoreducer_identity__.join(', ')+'"');
  }

  static dispatcher;
  static maxDepth = 45;
  static invalidAutoReducers = {
    AutoReducerArrayLeaf: true,
    AutoReducerObjectLeaf: true,
    Number: true,
    String: true,
    RegExp: true,
    Boolean: true,
    Function: true,
    Date: true,
    Error: true,
  };

  state;
  prevState = {};
  __autoreducer_id__;
  __autoreducer_identity__;
  __autoreducer_parent__;
  __autoreducer_dispatcher__;

  constructor(initialValue, id, parent, depth, identity, dispatcher) {
    this.__autoreducer_identity__ = identity;
    if (depth>AutoReducer.maxDepth) { AutoReducer.__kill(this); }
    this.__autoreducer_depth__ = depth;
    this.__autoreducer_id__ = id;
    this.__autoreducer_parent__ = parent;
    this.__autoreducer_dispatcher__ = dispatcher;
    let initialState;
    if (initialValue instanceof Array) {
      initialState = [ ...initialValue, ];
    } else {
      initialState= { ...initialValue, };
    }
    for (const k in initialState) {
      if (AutoReducer.couldBeParent(initialState[k])) {
        initialState[k] = this._createAutoReducer(initialState[k], k, this, depth + 1).state;
      }
    }
    this.state = initialState;
  }

  getParent() {
    return this.__autoreducer_parent__;
  }

  getId() {
    return this.__autoreducer_id__;
  }

  getIdentity() {
    return this.__autoreducer_identity__;
  }

  setState(value) {
    if (value instanceof AutoReducer) {
      throw new Error('AutoReducer does not take other AutoReducers as setState parameters. Got:', `${value}. Identity:`, JSON.stringify(this.__autoreducer_identity__));
    } else if (!this.__autoreducer_parent__) {
      throw new Error('detached AutoReducer action: setState', JSON.stringify(this.__autoreducer_identity__));
    }
    this.__autoreducer_dispatcher__.dispatch({ type: SET_STATE, target: this.__autoreducer_identity__, param: value, });
    return this;
  }

  _onSetState(value) {
    if (AutoReducer.couldBeParent(value)) {
      const { state: prevState, __autoreducer_parent__, } = this;
      if (!(value instanceof Array || prevState instanceof Array)) {
        this._merge(value, prevState);
      } else {
        this._reset(value, prevState);
      }
      this.prevState = prevState;
      __autoreducer_parent__._notifyUp(this);
      return this;
    }
    throw new Error(`${JSON.stringify(this.__autoreducer_identity__)}. Expected setState parameter to be an Object or Array, but got ${value}.`);
  }

  clearState(value) {
    if (AutoReducer.couldBeParent(value)) {
      if (!this.__autoreducer_parent__) {
        throw new Error('detached AutoReducer action: clearState', JSON.stringify(this.__autoreducer_identity__));
      } else if (value instanceof AutoReducer) {
        throw new Error('AutoReducer does not take other AutoReducers as resetState parameters. Got:', `${value}. Identity:`, JSON.stringify(this.__autoreducer_identity__));
      }
      this.__autoreducer_dispatcher__.dispatch({ type: CLEAR_STATE, target: this.__autoreducer_identity__, param: value, });
      return this;
    }
    throw new Error(`${JSON.stringify(this.__autoreducer_identity__)}. Expected clearState parameter to be an Object or Array, but got ${value}.`);
  }

  _onClearState(value) {
    const { __autoreducer_parent__, } = this;
    if (AutoReducer.couldBeParent(value)) {
      if (!__autoreducer_parent__) {
        throw new Error('detached AutoReducer action: clearState',
          JSON.stringify(this.__autoreducer_identity__));
      } else if (value instanceof AutoReducer) {
        throw new Error('AutoReducer does not take other AutoReducers as resetState parameters. Got:',
          `${value}. Identity:`,
          JSON.stringify(this.__autoreducer_identity__));
      }
      const prevState = this.state;
      this._reset(value, prevState);
      __autoreducer_parent__._notifyUp(this);
      return this;
    }
    throw new Error(`${JSON.stringify(this.__autoreducer_identity__)}. Expected clearState parameter to be an Object or Array, but got ${value}.`);
  }

  remove(...keys) {
    if (!this.__autoreducer_parent__) {
      throw new Error('detached AutoReducer action: remove', JSON.stringify(this.__autoreducer_identity__));
    }
    if (keys[0] instanceof Array) {
      keys = keys[0];
    }
    this.__autoreducer_dispatcher__.dispatch({ type: REMOVE, target: this.__autoreducer_identity__, param: keys, });
    return this;
  }

  _onRemove(keys) {
    this._remove(keys);
    return this;
  }

  removeSelf() {
    if (!this.__autoreducer_parent__) {
      throw new Error('detached AutoReducer action: remove', JSON.stringify(this.__autoreducer_identity__));
    }
    this.__autoreducer_dispatcher__.dispatch({ type: REMOVE, target: this.__autoreducer_parent__.__autoreducer_identity__, param: [ this.__autoreducer_id__, ], });
    return this;
  }

  _remove(keys = []) {
    const { state, } = this;
    this.prevState = state;
    if (AutoReducer.couldBeParent(state)) {
      let nextState;
      if (state instanceof Array) {
        nextState = this._removeFromArrayState(keys);
      } else {
        nextState = this._removeFromObjectState(keys);
      }
      this.state = nextState;
      this.__autoreducer_parent__._notifyUp(this);
    } else {
      console.error('Remove error:', `${JSON.stringify(this.__autoreducer_identity__)}. Has no children, was given,${JSON.stringify(keys)} when state: ${state}`);
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
          target.__autoreducer_identity__[target.__autoreducer_identity__.length-1] = length;
          target.__autoreducer_id__ = length;
        }
        nextState.push(state[i]);
      } else if (AutoReducer.couldBeParent(state[i])) {
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
          if (AutoReducer.couldBeParent(next)) {
            nextState[k] = child._reset(next, prevState[k]).state;
          } else {
            this._removeChild(k);
            nextState[k] = next;
          }
        }
      } else if (AutoReducer.couldBeParent(next)) {
        nextState[k] = this._createAutoReducer(next, k, this, this.__autoreducer_depth__ + 1).state;
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
            if (AutoReducer.couldBeParent(next)) {
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
      } else if (AutoReducer.couldBeParent(next)) {
        nextState[k] = this._createAutoReducer(next, k, this).state;
      } else if (value.hasOwnProperty(k)) {
        nextState[k] = next;
      }
    }
    this.state = value instanceof Array ? values(nextState) : nextState;
    return this;
  }

  _notifyUp(child) {
    const { __autoreducer_id__, state, } = child;
    const prevState = this.state;
    if (prevState instanceof Array) {
      this.state = [ ...prevState.slice(0, __autoreducer_id__), state, ...prevState.slice(Number(__autoreducer_id__)+1, prevState.length), ];
    } else {
      this.state = { ...prevState, [__autoreducer_id__]: state, };
    }
    this.prevState = prevState;
    if (this.__autoreducer_parent__) {
      this.__autoreducer_parent__._notifyUp(this);
    } else {
      throw new Error('Detached Child AutoReducer cannot be modified:', JSON.stringify(this.__autoreducer_identity__));
    }
  }

  _removeChild(k) {
    const target = this[k];
    const { state, } = target;
    if (AutoReducer.couldBeParent(state)) {
      for (const key in state) {
        if (target[key]) {
          target._removeChild(key);
        }
      }
    }
    assign(target, { __autoreducer_parent__: undefined, state: undefined, prevState: state, });
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
    return values(this).filter(v => v instanceof AutoReducer && v!==this.__autoreducer_parent__);
  }

  _createAutoReducer(initialState, k, parent) {
    this[k] = new AutoReducer(initialState, k, parent, this.__autoreducer_depth__ + 1, [ ...this.__autoreducer_identity__, k, ], this.__autoreducer_dispatcher__);
    return this[k];
  }

  static couldBeParent(value) {
    return value && value instanceof Object && !AutoReducer.invalidAutoReducers[getPrototypeOf(value).constructor.name];
  }
}