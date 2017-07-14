import { stateMapperPrivates, knotTree, TARGET, SET_STATE, CLEAR_STATE, REMOVE, GET_STATE, PARAM, PUBLISH_CHANGES, PUBLISH_NOW, ROLLBACK, } from '../common';

const { onSetState, onClearState, onRemove, role, depth, dispatcher, onRemoveChild, } = stateMapperPrivates;
const { createChild, removeChild, renameSelf, resolveIdentity, } = knotTree;
const onRemoveFromArray = Symbol('onRemoveFromArray');
const onRemoveFromObject = Symbol('onRemoveFromObject');
const createChildReferences = Symbol('createChildReferences');
const children = Symbol('children');

const { getPrototypeOf, defineProperty, keys, } = Object;

export default class StateMapper {

  static __kill(target) {
    console.trace();
    throw new Error('StateMapper maximum depth '+StateMapper.maxDepth+' exceeded by "'+target[resolveIdentity].join(', ')+'"');
  }

  static maxDepth = 45;
  static onGoingTransaction = false;
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
    this[children] = {};
    for (const k in state) {
      if (StateMapper.couldBeParent(state[k])) {
        this[createChildReferences](state[k], k,);
      }
    }
  }

  transaction(callBack) {
    const publishAfterDone = !this[dispatcher].onGoingTransaction;
    const stateBefore = this[dispatcher].dispatch({ type: GET_STATE, [TARGET]: [], });
    try {
      this[dispatcher].onGoingTransaction = true;
      callBack(this);
      if (publishAfterDone) {
        this[dispatcher].dispatch({ type: PUBLISH_CHANGES, });
      }
    } catch (Exception) {
      this[dispatcher].dispatch({ type: ROLLBACK, [PARAM]: stateBefore, });
      throw Exception;
    } finally {
      if (publishAfterDone) {
        this[dispatcher].onGoingTransaction = false;
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

  get prevState() {
    console.warn('prevState is deprecated and will always return undefined');
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
    this[dispatcher].dispatch({ type: SET_STATE, [TARGET]: identity, [PARAM]: value, [PUBLISH_NOW]: !this[dispatcher].onGoingTransaction, });
    return this;
  }

  clearState(value) {
    const identity = this.getIdentity();
    if (!identity) {
      throw new Error('Cannot call clearState to removed Node. Got:', `${value}. Id: "${this.getId()}"`);
    } else if (value instanceof StateMapper) {
      throw new Error('StateMapper does not take other StateMappers as resetState parameters. Got:', `${value}. Identity: "${this.getIdentity().join(', ')}"`);
    }
    this[dispatcher].dispatch({ type: CLEAR_STATE, [TARGET]: identity, [PARAM]: value, [PUBLISH_NOW]: !this[dispatcher].onGoingTransaction, });
    return this;
  }

  remove(...keys) {
    const identity = this.getIdentity();
    if (!identity) {
      throw new Error('Cannot call remove to removed Node. Got:', `${keys}. Id: "${this.getId()}"`);
    } else if (keys[0] instanceof Array) {
      keys = keys[0];
    }
    this[dispatcher].dispatch({ type: REMOVE, [TARGET]: identity, [PARAM]: keys, [PUBLISH_NOW]: !this[dispatcher].onGoingTransaction, });
    return this;
  }

  removeSelf() {
    const identity = this.getIdentity();
    if (!identity) {
      throw new Error('Cannot call removeSelf to removed Node. Id:'+this.getId());
    }
    const [ _, ...parentIdentity ]= identity;
    this[dispatcher].dispatch({ type: REMOVE, [TARGET]: parentIdentity, [PARAM]: [ this.getId(), ], [PUBLISH_NOW]: !this[dispatcher].onGoingTransaction, });
    return this;
  }

  [onSetState](newState, prevState) {
    if (newState instanceof Array || prevState instanceof Array) {
      this[onClearState](newState, prevState);
      return newState;
    }
    for (const k in newState) {
      const child = this[children][k];
      const subState = newState[k];
      if (child) {
        if (subState !== prevState[k]) {
          if (StateMapper.couldBeParent(subState)) {
            if (child.ref) {
              child.ref[onClearState](subState, prevState[k]);
            } else {
              delete this[k];
              this[createChildReferences](subState, k);
            }
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

  [onClearState](newState, prevState = {}) {
    const merge = { ...prevState, ...newState, };
    for (const k in merge) {
      const child = this[children][k];
      const next = newState[k];
      if (child) {
        if (newState.hasOwnProperty(k)) {
          if (next !== prevState[k]) {
            if (StateMapper.couldBeParent(next)) {
              if (child.ref) {
                child.ref[onClearState](next, prevState[k]);
              } else {
                delete this[k];
                this[createChildReferences](next, k);
              }
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
        if (this[children][i]) {
          this[onRemoveChild](i);
        }
      } else {
        if (i !== length && this[children][i]) {
          const child = this[children][i];
          if (child.ref) {
            this[role][i][renameSelf](length);
          }
          delete this[i];
          this[createChildReferences](state[i], length, child.ref);
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
    return keys(this[children]).map(k => this[k]).reduce(onReduceChildren, []);
  }

  getChildren() {
    return keys(this[children]).map(k => this[k]);
  }

  [onRemoveChild](k) {
    delete this[children][k];
    delete this[k];
    this[role][removeChild](k);
  }

  [createChildReferences](initialState, k, predefinedRef) {
    const child = this[children][k] = { ref: predefinedRef, };
    const childRole = this[role][createChild](k);
    defineProperty(this, k, {
      configurable: true,
      enumerable: true,
      get: () => {
        if (child.ref) {
          return child.ref;
        }
        child.ref = new StateMapper(initialState, this[depth] + 1, childRole, this[dispatcher]);
        return child.ref;
      },
    });
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