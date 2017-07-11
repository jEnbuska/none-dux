import { reducerPrivates, knotTree, SUB_REDUCER, SET_STATE, CLEAR_STATE, REMOVE, GET_STATE, GET_PREV_STATE, PARAM, } from '../common';

const { onSetState, onClearState, onRemove, role, depth, dispatcher, onRemoveChild, } = reducerPrivates;
const { createChild, removeChild, renameSelf, resolveIdentity, } = knotTree;
const onRemoveFromArray = Symbol('onRemoveFromArray');
const onRemoveFromObject = Symbol('onRemoveFromObject');
const createChildReferences = Symbol('createChildReferences');

const { getPrototypeOf, } = Object;

export default class AutoReducer {

  static __kill(target) {
    console.trace();
    throw new Error('AutoReducer maximum depth '+AutoReducer.maxDepth+' exceeded by "'+target[resolveIdentity].join(', ')+'"');
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

  constructor(state, ownDepth, ownRole, ownDispatcher) {
    this[role] = ownRole;
    if (ownDepth>AutoReducer.maxDepth) { AutoReducer.__kill(this); }
    this[depth] = ownDepth;
    this[dispatcher] = ownDispatcher;
    for (const k in state) {
      if (AutoReducer.couldBeParent(state[k])) {
        this[createChildReferences](state[k], k,);
      }
    }
  }

  get state() {
    const identity = this.getIdentity();
    if (identity) {
      return this[dispatcher].dispatch({ type: GET_STATE, [SUB_REDUCER]: identity, });
    }
    return AutoReducer.onAccessingRemovedNode(this.getId(), 'state');
  }

  get prevState() {
    const identity = this.getIdentity();
    if (identity) {
      return this[dispatcher].dispatch({ type: GET_PREV_STATE, [SUB_REDUCER]: identity, });
    }
    return AutoReducer.onAccessingRemovedNode(this.getId(), 'prevState');
  }

  getId() {
    return this[role].getId();
  }

  getIdentity() {
    return this[role][resolveIdentity]();
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
    this[dispatcher].dispatch({ type: SET_STATE, [SUB_REDUCER]: identity, [PARAM]: value, });
    return this;
  }

  clearState(value) {
    const identity = this.getIdentity();
    if (!identity) {
      throw new Error('Cannot call clearState to removed Node. Got:', `${value}. Id: "${this.getId()}"`);
    } else if (value instanceof AutoReducer) {
      throw new Error('AutoReducer does not take other AutoReducers as resetState parameters. Got:', `${value}. Identity: "${this.getIdentity().join(', ')}"`);
    }
    this[dispatcher].dispatch({ type: CLEAR_STATE, [SUB_REDUCER]: identity, [PARAM]: value, });
    return this;
  }

  remove(...keys) {
    const identity = this.getIdentity();
    if (!identity) {
      throw new Error('Cannot call remove to removed Node. Got:', `${keys}. Id: "${this.getId()}"`);
    } else if (keys[0] instanceof Array) {
      keys = keys[0];
    }
    this[dispatcher].dispatch({ type: REMOVE, [SUB_REDUCER]: identity, [PARAM]: keys, });
    return this;
  }

  removeSelf() {
    const identity = this.getIdentity();
    if (!identity) {
      throw new Error('Cannot call removeSelf to removed Node. Id:'+this.getId());
    }
    const [ _, ...parentIdentity ]= identity;
    this[dispatcher].dispatch({ type: REMOVE, [SUB_REDUCER]: parentIdentity, [PARAM]: [ this.getId(), ], });
    return this;
  }

  // TODO rename onSetState (Symbol)
  [onSetState](newState, prevState) {
    if (newState instanceof Array || prevState instanceof Array) {
      this[onClearState](newState, prevState);
      return newState;
    }
    for (const k in newState) {
      const child = this[k];
      const subState = newState[k];
      if (child) {
        if (subState !== prevState[k]) {
          if (AutoReducer.couldBeParent(subState)) {
            child[onClearState](subState, prevState[k]);
          } else {
            this[onRemoveChild](k);
          }
        }
      } else if (AutoReducer.couldBeParent(subState)) {
        this[createChildReferences](subState, k);
      }
    }
    return { ...prevState, ...newState, };
  }

  // TODO rename onClearState (Symbol)
  [onClearState](newState, prevState) {
    const merge = { ...prevState, ...newState, };
    for (const k in merge) {
      const child = this[k];
      const next = newState[k];
      if (child) {
        if (newState.hasOwnProperty(k)) {
          if (next !== prevState[k]) {
            if (AutoReducer.couldBeParent(next)) {
              child[onClearState](next, prevState[k]);
            } else {
              this[onRemoveChild](k);
            }
          }
        } else {
          this[onRemoveChild](k);
        }
      } else if (AutoReducer.couldBeParent(next)) {
        this[createChildReferences](next, k);
      }
    }
  }

  // TODO rename onRemove (Symbol)
  [onRemove](keys = [], state) {
    if (state instanceof Array) {
      return this[onRemoveFromArray](keys, state);
    }
    return this[onRemoveFromObject](keys, state);
  }

  // TODO rename onRemoveFromArray (Symbol)
  [onRemoveFromArray](indexes, state) {
    const toBeRemoved = indexes.reduce(function (acc, i) { acc[i] = true; return acc; }, {});
    const nextState = [];
    const stateLength = state.length;
    for (let i = 0; i<stateLength; i++) {
      const { length, } = nextState;
      if (toBeRemoved[i]) {
        if (this[i]) {
          this[onRemoveChild](i);
        }
      } else {
        if (i !== length && this[i]) {
          const target = this[i];
          this[length] = target;
          this[role][i][renameSelf](length);
          delete this[i];
        }
        nextState.push(state[i]);
      }
    }
    return nextState;
  }

  // TODO rename onRemoveFromObject (Symbol)
  [onRemoveFromObject](keys, state) {
    const nextState = { ...state, };
    for (const k of keys) {
      delete nextState[k];
      if (this[k]) {
        this[onRemoveChild](k);
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
  [onRemoveChild](k) {
    delete this[k];
    this[role][removeChild](k);
  }

  // TODO rename createChildReference (Symbol)
  [createChildReferences](initialState, k) {
    this[k] = new AutoReducer(initialState, this[depth] + 1, this[role][createChild](k), this[dispatcher]);
  }

  static onAccessingRemovedNode(id, property) {
    console.error('Accessing '+property+' of remove node '+id+' will always return undefined');
  }

  static couldBeParent(value) {
    return value && value instanceof Object && !AutoReducer.invalidAutoReducers[getPrototypeOf(value).constructor.name];
  }
}

function onReduceChildren(acc, child) {
  return [ ...acc, child, ...child.getChildrenRecursively(), ];
}