import { stringify, SUB_REDUCER, SET_STATE, CLEAR_STATE, REMOVE, GET_STATE, GET_PREV_STATE, PARAM, } from '../common';

const { getPrototypeOf, } = Object;

export default class AutoReducer {

  static __kill(target) {
    console.trace();
    throw new Error('AutoReducer maximum depth '+AutoReducer.maxDepth+' exceeded by "'+target.__autoreducer_identity__.join(', ')+'"');
  }

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

  __autoreducer_id__;
  __autoreducer_identity__;
  __autoreducer_dispatcher__;

  constructor(state, id, depth, identity, dispatcher) {
    this.__autoreducer_identity__ = identity;
    if (depth>AutoReducer.maxDepth) { AutoReducer.__kill(this); }
    this.__autoreducer_depth__ = depth;
    this.__autoreducer_id__ = id;
    this.__autoreducer_dispatcher__ = dispatcher;
    for (const k in state) {
      if (AutoReducer.couldBeParent(state[k])) {
        this._createAutoReducer(state[k], k,);
      }
    }
  }

  get state() {
    return this.__autoreducer_dispatcher__.dispatch({ type: GET_STATE, [SUB_REDUCER]: this.__autoreducer_identity__, });
  }

  get prevState() {
    return this.__autoreducer_dispatcher__.dispatch({ type: GET_PREV_STATE, [SUB_REDUCER]: this.__autoreducer_identity__, });
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
    } else if (!AutoReducer.couldBeParent(value)) {
      throw new Error('AutoReducer does not take other leafs as setState parameters. Got:', `${value}. Identity: "${this.__autoreducer_identity__.join(', ')}"`);
    }
    this.__autoreducer_dispatcher__.dispatch({ type: SET_STATE, [SUB_REDUCER]: this.__autoreducer_identity__, [PARAM]: value, });
    return this;
  }

  clearState(value) {
    if (value instanceof AutoReducer) {
      throw new Error('AutoReducer does not take other AutoReducers as resetState parameters. Got:', `${value}. Identity: "${this.__autoreducer_identity__.join(', ')}"`);
    }
    this.__autoreducer_dispatcher__.dispatch({ type: CLEAR_STATE, [SUB_REDUCER]: this.__autoreducer_identity__, [PARAM]: value, });
    return this;
  }

  remove(...keys) {
    if (keys[0] instanceof Array) {
      keys = keys[0];
    }
    this.__autoreducer_dispatcher__.dispatch({ type: REMOVE, [SUB_REDUCER]: this.__autoreducer_identity__, [PARAM]: keys, });
    return this;
  }

  removeSelf() {
    const [ _, ...parentIdentityReversed ] = [ ...this.__autoreducer_identity__, ].reverse();
    this.__autoreducer_dispatcher__.dispatch({ type: REMOVE, [SUB_REDUCER]: parentIdentityReversed.reverse(), [PARAM]: [ this.__autoreducer_id__, ], });
    return this;
  }

  __applySetState(newState, prevState) {
    if (newState instanceof Array || prevState instanceof Array) {
      this.__applyClearState(newState, prevState);
      return newState;
    }
    for (const k in newState) {
      const child = this[k];
      const subState = newState[k];
      if (child) {
        if (subState !== prevState[k]) {
          if (AutoReducer.couldBeParent(subState)) {
            child.__applyClearState(subState,
                prevState[k]);
          } else {
            delete this[k];
          }
        }
      } else if (AutoReducer.couldBeParent(subState)) {
        this._createAutoReducer(subState, k);
      }
    }
    return { ...prevState, ...newState, };
  }

  __applyClearState(newState, prevState) {
    const merge = { ...prevState, ...newState, };
    for (const k in merge) {
      const child = this[k];
      const next = newState[k];
      if (child) {
        if (newState.hasOwnProperty(k)) {
          if (next !== prevState[k]) {
            if (AutoReducer.couldBeParent(next)) {
              child.__applyClearState(next, prevState[k]);
            } else {
              delete this[k];
            }
          }
        } else {
          delete this[k];
        }
      } else if (AutoReducer.couldBeParent(next)) {
        this._createAutoReducer(next, k);
      }
    }
  }

  __applyRemove(keys = [], state) {
    if (state instanceof Array) {
      return this._removeFromArrayState(keys, state);
    }
    return this._removeFromObjectState(keys, state);
  }

  _removeFromArrayState(indexes, state) {
    const toBeRemoved = indexes.reduce(function (acc, i) { acc[i] = true; return acc; }, {});
    const nextState = [];
    const stateLength = state.length;
    for (let i = 0; i<stateLength; i++) {
      const { length, } = nextState;
      if (toBeRemoved[i]) {
        if (this[i]) {
          delete this[i];
        }
      } else {
        if (i !== length && this[i]) {
          const target = this[i];
          this[length] = target;
          delete this[i];
          target.__autoreducer_identity__[target.__autoreducer_identity__.length - 1] = length;
          target.__autoreducer_id__ = length;
        }
        nextState.push(state[i]);
      }
    }
    return nextState;
  }

  _removeFromObjectState(keys, state) {
    const nextState = { ...state, };
    for (const k of keys) {
      delete nextState[k];
      if (this[k]) {
        delete this[k];
      }
    }
    return nextState;
  }

  getChildrenRecursively() {
    return this.getChildren().reduce(onReduceChildren, []);
  }

  getChildren() {
    return Object.values(this).filter(v => v && v instanceof AutoReducer);
  }

  _createAutoReducer(initialState, k) {
    this[k] = new AutoReducer(initialState, k, this.__autoreducer_depth__ + 1, [ ...this.__autoreducer_identity__, k, ], this.__autoreducer_dispatcher__);
  }

  static couldBeParent(value) {
    return value && value instanceof Object && !AutoReducer.invalidAutoReducers[getPrototypeOf(value).constructor.name];
  }
}

function onReduceChildren(acc, child) {
  return [ ...acc, child, ...child.getChildrenRecursively(), ];
}