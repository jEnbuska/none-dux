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
  __autoreducer_identity__;
  __autoreducer_dispatcher__;

  constructor(state, id, depth, identity, dispatcher) {
    this.__autoreducer_identity__ = identity;
    if (depth>AutoReducer.maxDepth) { AutoReducer.__kill(this); }
    this.__autoreducer_depth__ = depth;
    this.__autoreducer_dispatcher__ = dispatcher;
    for (const k in state) {
      if (AutoReducer.couldBeParent(state[k])) {
        this._createAutoReducer(state[k], k,);
      }
    }
  }

  get state() {
    const identity = this.getIdentity();
    if (identity) {
      return this.__autoreducer_dispatcher__.dispatch({ type: GET_STATE, [SUB_REDUCER]: identity, });
    }
    return AutoReducer.onAccessingRemovedNode(this.getId(), 'state');
  }

  get prevState() {
    const identity = this.getIdentity();
    if (identity) {
      return this.__autoreducer_dispatcher__.dispatch({ type: GET_PREV_STATE, [SUB_REDUCER]: identity, });
    }
    AutoReducer.onAccessingRemovedNode(this.getId(), 'prevState')
  }

  getId() {
    return this.__autoreducer_identity__.getId();
  }

  getIdentity() {
    return this.__autoreducer_identity__._knotlist_path();
  }

  setState(value) {
    const identity = this.getIdentity();
    if (!identity) {
      throw new Error('Cannot call setState to removed Node. Got:', `${value}. Id: "${this.getId()}"`);
    } else if (value instanceof AutoReducer) {
      throw new Error('AutoReducer does not take other AutoReducers as setState parameters. Got:', `${value}. Identity: "${this.getIdentity().join(', ')}"`);
    } else if (!AutoReducer.couldBeParent(value)) {
      throw new Error('AutoReducer does not take other leafs as setState parameters. Got:', `${value}. Identity: "${this.getIdentity().join(', ')}"`);
    }
    this.__autoreducer_dispatcher__.dispatch({ type: SET_STATE, [SUB_REDUCER]: identity, [PARAM]: value, });
    return this;
  }

  clearState(value) {
    const identity = this.getIdentity();
    if (!identity) {
      throw new Error('Cannot call clearState to removed Node. Got:', `${value}. Id: "${this.getId()}"`);
    } else if (value instanceof AutoReducer) {
      throw new Error('AutoReducer does not take other AutoReducers as resetState parameters. Got:', `${value}. Identity: "${this.getIdentity().join(', ')}"`);
    }
    this.__autoreducer_dispatcher__.dispatch({ type: CLEAR_STATE, [SUB_REDUCER]: identity, [PARAM]: value, });
    return this;
  }

  remove(...keys) {
    const identity = this.getIdentity();
    if (!identity) {
      throw new Error('Cannot call remove to removed Node. Got:', `${keys}. Id: "${this.getId()}"`);
    } else if (keys[0] instanceof Array) {
      keys = keys[0];
    }
    this.__autoreducer_dispatcher__.dispatch({ type: REMOVE, [SUB_REDUCER]: identity, [PARAM]: keys, });
    return this;
  }

  removeSelf() {
    const identity = this.getIdentity();
    if (!identity) {
      throw new Error('Cannot call removeSelf to removed Node. Id:'+this.getId());
    }
    const [ _, ...parentIdentity ]= identity.reverse();
    this.__autoreducer_dispatcher__.dispatch({ type: REMOVE, [SUB_REDUCER]: parentIdentity.reverse(), [PARAM]: [ this.getId(), ], });
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
            child.__applyClearState(subState, prevState[k]);
          } else {
            this._onRemoveChild(k);
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
              this._onRemoveChild(k);
            }
          }
        } else {
          this._onRemoveChild(k);
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
          this._onRemoveChild(i);
        }
      } else {
        if (i !== length && this[i]) {
          const target = this[i];
          this[length] = target;
          this.__autoreducer_identity__[i]._knotlist_replace_key(length);
          delete this[i];
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
        this._onRemoveChild(k)
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
  _onRemoveChild(k) {
    delete this[k];
    this.__autoreducer_identity__._knotlist_remove(k);
  }

  _createAutoReducer(initialState, k) {
    this[k] = new AutoReducer(initialState, k, this.__autoreducer_depth__ + 1, this.__autoreducer_identity__._knotlist_add(k), this.__autoreducer_dispatcher__);
  }

  static onAccessingRemovedNode(id, property) {
    console.error('Accessing '+property+' of remove node '+id);
  }

  static couldBeParent(value) {
    return value && value instanceof Object && !AutoReducer.invalidAutoReducers[getPrototypeOf(value).constructor.name];
  }
}

function onReduceChildren(acc, child) {
  return [ ...acc, child, ...child.getChildrenRecursively(), ];
}