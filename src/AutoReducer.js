import { stringify, SET_STATE, CLEAR_STATE, REMOVE, GET_STATE, GET_PREV_STATE, } from './common';

const { getPrototypeOf, values, } = Object;

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

  __autoreducer_state__;
  __autoreducer_state__ = {};
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
        initialState[k] = this._createAutoReducer(initialState[k], k, this, depth + 1).__autoreducer_state__;
      }
    }
    this.__autoreducer_state__ = initialState;
  }

  getParent() {
    return this.__autoreducer_parent__;
  }

  get state() {
    let state;
    this.__autoreducer_dispatcher__.dispatch({ type: GET_STATE, target: this.__autoreducer_identity__, callback: (value) => { state = value; }, });
    return state;
  }

  get prevState() {
    let prevState;
    this.__autoreducer_dispatcher__.dispatch({ type: GET_PREV_STATE, target: this.__autoreducer_identity__, callback: (value) => { prevState = value; }, });
    return prevState;
  }

  getId() {
    return this.__autoreducer_id__;
  }

  getIdentity() {
    return this.__autoreducer_identity__;
  }

  setState(value) {
    if (value instanceof AutoReducer) {
      throw new Error('AutoReducer does not take other AutoReducers as setState parameters. Got:', `${value}. Identity: "${this.__autoreducer_identity__.join(', ')}"`);
    } else if (!this.__autoreducer_parent__) {
      throw new Error('detached AutoReducer action: setState', stringify(this.__autoreducer_identity__));
    }
    this.__autoreducer_dispatcher__.dispatch({ type: SET_STATE, target: this.__autoreducer_identity__, param: value, });
    return this;
  }

  __applySetState(value) {
    if (AutoReducer.couldBeParent(value)) {
      const { __autoreducer_state__: __autoreducer_prevState__, __autoreducer_parent__, } = this;
      if (!(value instanceof Array || __autoreducer_prevState__ instanceof Array)) {
        this._merge(value, __autoreducer_prevState__);
      } else {
        this._reset(value, __autoreducer_prevState__);
      }
      this.__autoreducer_prevState__ = __autoreducer_prevState__;
      __autoreducer_parent__._notifyUp(this);
      return this;
    }
    throw new Error(`"${this.__autoreducer_identity__.join(', ')}". Expected setState parameter to be an Object or Array, but got ${value}.`);
  }

  clearState(value) {
    if (value instanceof AutoReducer) {
      throw new Error('AutoReducer does not take other AutoReducers as resetState parameters. Got:', `${value}. Identity: "${this.__autoreducer_identity__.join(', ')}"`);
    }
    this.__autoreducer_dispatcher__.dispatch({ type: CLEAR_STATE, target: this.__autoreducer_identity__, param: value, });
    return this;
  }

  __applyClearState(value) {
    const { __autoreducer_parent__, } = this;
    if (AutoReducer.couldBeParent(value)) {
      if (value instanceof AutoReducer) {
        throw new Error('AutoReducer does not take other AutoReducers as resetState parameters. Got:',
          `${value}. Identity:
          "${this.__autoreducer_identity__.join(', ')}"`);
      }
      const __autoreducer_prevState__ = this.__autoreducer_state__;
      this._reset(value, __autoreducer_prevState__);
      __autoreducer_parent__._notifyUp(this);
      return this;
    }
    throw new Error(`"${this.__autoreducer_identity__.join(', ')}". Expected clearState parameter to be an Object or Array, but got ${value}.`);
  }

  remove(...keys) {
    if (keys[0] instanceof Array) {
      keys = keys[0];
    }
    this.__autoreducer_dispatcher__.dispatch({ type: REMOVE, target: this.__autoreducer_identity__, param: keys, });
    return this;
  }

  __applyRemove(keys = []) {
    const { __autoreducer_state__, } = this;
    this.__autoreducer_prevState__ = __autoreducer_state__;
    if (AutoReducer.couldBeParent(__autoreducer_state__)) {
      let nextState;
      if (__autoreducer_state__ instanceof Array) {
        nextState = this._removeFromArrayState(keys);
      } else {
        nextState = this._removeFromObjectState(keys);
      }
      this.__autoreducer_state__ = nextState;
      this.__autoreducer_parent__._notifyUp(this);
    } else {
      console.error('Remove error:', `${this.__autoreducer_identity__.join(', ')}. Has no children, was given,${JSON.stringify(keys)} when state: ${__autoreducer_state__}`);
    }
  }

  removeSelf() {
    if (!this.__autoreducer_parent__) {
      throw new Error('detached AutoReducer action: remove "'+ this.__autoreducer_identity__.join(', ')+'"');
    }
    this.__autoreducer_dispatcher__.dispatch({ type: REMOVE, target: this.__autoreducer_parent__.__autoreducer_identity__, param: [ this.__autoreducer_id__, ], });
    return this;
  }

  _removeFromArrayState(indexes) {
    const set = indexes.reduce(function (acc, i) { acc[i] = true; return acc; }, {});
    const nextState = [];
    const { __autoreducer_state__, } = this;
    const stateLength = __autoreducer_state__.length;
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
        nextState.push(__autoreducer_state__[i]);
      } else if (AutoReducer.couldBeParent(__autoreducer_state__[i])) {
        delete this[i];
      }
    }
    return nextState;
  }

  _removeFromObjectState(keys) {
    const nextState = { ...this.__autoreducer_state__, };
    for (const k of keys) {
      delete nextState[k];
      if (this[k]) {
        delete this[k];
      }
    }
    return nextState;
  }

  _merge(obj, __autoreducer_prevState__) {
    const nextState = {};
    for (const k in obj) {
      const child = this[k];
      const next = obj[k];
      if (child) {
        if (next!==__autoreducer_prevState__[k]) {
          if (AutoReducer.couldBeParent(next)) {
            nextState[k] = child._reset(next, __autoreducer_prevState__[k]).__autoreducer_state__;
          } else {
            delete this[k];
            nextState[k] = next;
          }
        }
      } else if (AutoReducer.couldBeParent(next)) {
        nextState[k] = this._createAutoReducer(next, k, this, this.__autoreducer_depth__ + 1).__autoreducer_state__;
      } else {
        nextState[k] = next;
      }
    }
    this.__autoreducer_state__ = { ...__autoreducer_prevState__, ...nextState, };
    return this;
  }

  _reset(value, __autoreducer_prevState__) {
    this.__autoreducer_prevState__ = __autoreducer_prevState__;
    const merge = { ...__autoreducer_prevState__, ...value, };
    const nextState = {};
    for (const k in merge) {
      const child = this[k];
      const next = value[k];
      if (child) {
        if (value.hasOwnProperty(k)) {
          if (next !== __autoreducer_prevState__[k]) {
            if (AutoReducer.couldBeParent(next)) {
              nextState[k] = child._reset(next, __autoreducer_prevState__[k]).__autoreducer_state__;
            } else {
              delete this[k];
              nextState[k] = next;
            }
          } else {
            nextState[k] = next;
          }
        } else {
          delete this[k];
        }
      } else if (AutoReducer.couldBeParent(next)) {
        nextState[k] = this._createAutoReducer(next, k, this).__autoreducer_state__;
      } else if (value.hasOwnProperty(k)) {
        nextState[k] = next;
      }
    }
    this.__autoreducer_state__ = value instanceof Array ? values(nextState) : nextState;
    return this;
  }

  _notifyUp(child) {
    const { __autoreducer_id__, __autoreducer_state__, } = child;
    const __autoreducer_prevState__ = this.__autoreducer_state__;
    if (__autoreducer_prevState__ instanceof Array) {
      this.__autoreducer_state__ = [ ...__autoreducer_prevState__.slice(0, __autoreducer_id__), __autoreducer_state__, ...__autoreducer_prevState__.slice(Number(__autoreducer_id__)+1, __autoreducer_prevState__.length), ];
    } else {
      this.__autoreducer_state__ = { ...__autoreducer_prevState__, [__autoreducer_id__]: __autoreducer_state__, };
    }
    this.__autoreducer_prevState__ = __autoreducer_prevState__;
    if (this.__autoreducer_parent__) {
      this.__autoreducer_parent__._notifyUp(this);
    } else {
      throw new Error('Detached Child AutoReducer cannot be modified: "', this.__autoreducer_identity__.join(', ')+'"');
    }
  }

  getChildrenRecursively() {
    const onReduceChildren = function (acc, child) {
      return [ ...acc, child, ...child.getChildrenRecursively(), ];
    };
    return this.getChildren().reduce(onReduceChildren, []);
  }

  getChildren() {
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