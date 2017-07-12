import { stateMapperPrivates, knotTree, TARGET, SET_STATE, CLEAR_STATE, REMOVE, GET_STATE, PARAM, APPLY_MANY, PUBLISH_CHANGES, ROLLBACK, } from '../common';

const { onSetState, onClearState, onRemove, role, depth, dispatcher, onRemoveChild, propPrevState, } = stateMapperPrivates;
const { createChild, removeChild, renameSelf, resolveIdentity, } = knotTree;
const onRemoveFromArray = Symbol('onRemoveFromArray');
const onRemoveFromObject = Symbol('onRemoveFromObject');
const createChildReferences = Symbol('createChildReferences');

const { getPrototypeOf, values, } = Object;

export default class StateMapper {

  static __kill(target) {
    console.trace();
    throw new Error('StateMapper maximum depth '+StateMapper.maxDepth+' exceeded by "'+target[resolveIdentity].join(', ')+'"');
  }

  static maxDepth = 45;
  static applyingMany = false;
  static invalidStateMappers = {
    StateMapperArrayLeaf: true,
    StateMapperObjectLeaf: true,
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
    if (ownDepth>StateMapper.maxDepth) { StateMapper.__kill(this); }
    this[depth] = ownDepth;
    this[dispatcher] = ownDispatcher;
    for (const k in state) {
      if (StateMapper.couldBeParent(state[k])) {
        this[createChildReferences](state[k], k,);
      }
    }
    this[propPrevState] = state;
  }

  transaction(callBack) {
    const publishAfterCall = !this[dispatcher].applyingMany;
    const stateBefore = this[dispatcher].dispatch({ type: GET_STATE, [TARGET]: [], });
    try {
      this[dispatcher].applyingMany = true;
      callBack(this);
      if (publishAfterCall) {
        this[dispatcher].dispatch({ type: PUBLISH_CHANGES, });
      }
    } catch (Exception) {
      this[dispatcher].dispatch({ type: ROLLBACK, [PARAM]: stateBefore, [APPLY_MANY]: !publishAfterCall, });
      throw Exception;
    } finally {
      if (publishAfterCall) {
        this[dispatcher].applyingMany = false;
      }
    }
  }

  get state() {
    const identity = this.getIdentity();
    if (identity) {
      return this[dispatcher].dispatch({ type: GET_STATE, [TARGET]: identity, });
    }
    return StateMapper.onAccessingRemovedNode(this.getId(), 'state');
  }

  // prevState is StateMapper specific prevState not application state prevState. It is available even after StateMapper instance has been removed
  get prevState() {
    return this[propPrevState];
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
    } else if (value instanceof StateMapper) {
      throw new Error('StateMapper does not take other StateMappers as setState parameters. Got:', `${value}. Identity: "${this.getIdentity().join(', ')}"`);
    } else if (!StateMapper.couldBeParent(value)) {
      throw new Error('StateMapper does not take other leafs as setState parameters. Got:', `${value}. Identity: "${this.getIdentity().join(', ')}"`);
    }
    this[dispatcher].dispatch({ type: SET_STATE, [TARGET]: identity, [PARAM]: value, [APPLY_MANY]: this[dispatcher].applyingMany, });
    return this;
  }

  clearState(value) {
    const identity = this.getIdentity();
    if (!identity) {
      throw new Error('Cannot call clearState to removed Node. Got:', `${value}. Id: "${this.getId()}"`);
    } else if (value instanceof StateMapper) {
      throw new Error('StateMapper does not take other StateMappers as resetState parameters. Got:', `${value}. Identity: "${this.getIdentity().join(', ')}"`);
    }
    this[dispatcher].dispatch({ type: CLEAR_STATE, [TARGET]: identity, [PARAM]: value, [APPLY_MANY]: this[dispatcher].applyingMany, });
    return this;
  }

  remove(...keys) {
    const identity = this.getIdentity();
    if (!identity) {
      throw new Error('Cannot call remove to removed Node. Got:', `${keys}. Id: "${this.getId()}"`);
    } else if (keys[0] instanceof Array) {
      keys = keys[0];
    }
    this[dispatcher].dispatch({ type: REMOVE, [TARGET]: identity, [PARAM]: keys, [APPLY_MANY]: this[dispatcher].applyingMany, });
    return this;
  }

  removeSelf() {
    const identity = this.getIdentity();
    if (!identity) {
      throw new Error('Cannot call removeSelf to removed Node. Id:'+this.getId());
    }
    const [ _, ...parentIdentity ]= identity;
    this[dispatcher].dispatch({ type: REMOVE, [TARGET]: parentIdentity, [PARAM]: [ this.getId(), ], [APPLY_MANY]: this[dispatcher].applyingMany, });
    return this;
  }

  [onSetState](newState, prevState) {
    this[propPrevState] = prevState;
    if (newState instanceof Array || prevState instanceof Array) {
      this[onClearState](newState, prevState);
      return newState;
    }
    for (const k in newState) {
      const child = this[k];
      const subState = newState[k];
      if (child) {
        if (subState !== prevState[k]) {
          if (StateMapper.couldBeParent(subState)) {
            child[onClearState](subState, prevState[k]);
          } else {
            this[onRemoveChild](k);
          }
        }
      } else if (StateMapper.couldBeParent(subState)) {
        this[createChildReferences](subState, k);
      }
    }
    return { ...prevState, ...newState, };
  }

  [onClearState](newState, prevState) {
    this[propPrevState] = prevState;
    const merge = { ...prevState, ...newState, };
    for (const k in merge) {
      const child = this[k];
      const next = newState[k];
      if (child) {
        if (newState.hasOwnProperty(k)) {
          if (next !== prevState[k]) {
            if (StateMapper.couldBeParent(next)) {
              child[onClearState](next, prevState[k]);
            } else {
              this[onRemoveChild](k);
            }
          }
        } else {
          this[onRemoveChild](k);
        }
      } else if (StateMapper.couldBeParent(next)) {
        this[createChildReferences](next, k);
      }
    }
  }

  [onRemove](keys = [], state) {
    if (state instanceof Array) {
      return this[onRemoveFromArray](keys, state);
    }
    return this[onRemoveFromObject](keys, state);
  }

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

  [onRemoveFromObject](keys, state) {
    const nextState = { ...state, };
    for (const k of keys) {
      if (this[k]) {
        this[onRemoveChild](k);
      }
      delete nextState[k];
    }
    return nextState;
  }

  getChildrenRecursively() {
    return values(this).reduce(onReduceChildren, []);
  }

  getChildren() {
    return values(this);
  }

  [onRemoveChild](k) {
    this[role][removeChild](k);
    delete this[k];
  }

  // TODO rename createChildReference (Symbol)
  [createChildReferences](initialState, k) {
    this[k] = new StateMapper(initialState, this[depth] + 1, this[role][createChild](k), this[dispatcher]);
  }

  static onAccessingRemovedNode(id, property) {
    console.error('Accessing '+property+' of remove node '+id+' will always return undefined');
  }

  static couldBeParent(value) {
    return value && value instanceof Object && !StateMapper.invalidStateMappers[getPrototypeOf(value).constructor.name];
  }
}

function onReduceChildren(acc, child) {
  return [ ...acc, child, ...child.getChildrenRecursively(), ];
}