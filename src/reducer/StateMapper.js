import { stateMapperPrivates, knotTree, TARGET, SET_STATE, CLEAR_STATE, REMOVE, GET_STATE, PARAM, PUBLISH_CHANGES, PUBLISH_NOW, ROLLBACK, } from '../common';
import createLeaf from './leafs';

const { onSetState, onClearState, onRemove, role, depth, dispatcher, onRemoveChild, children, } = stateMapperPrivates;
const { createChild, removeChild, renameSelf, resolveIdentity, } = knotTree;
const onRemoveFromArray = Symbol('onRemoveFromArray');
const onRemoveFromObject = Symbol('onRemoveFromObject');

const { getPrototypeOf, defineProperty, keys, } = Object;
let getChildrenWarned;
let getChildrenRecursiveWarned;

export default class StateMapper {

  static __kill(target) {
    console.trace();
    throw new Error('StateMapper maximum depth '+StateMapper.maxDepth+' exceeded by "'+target[role][resolveIdentity].join(', ')+'"');
  }

  static maxDepth = 45;
  static invalidStateMappers = {
    ObjectLeaf: true,
    ArrayLeaf: true,
    StateMapperSaga: true,
    StateMapper: true,
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
        this._createChild(state[k], k+'',);
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
    for (let k in newState) {
      k = '' + k;
      const child = this[children][k];
      const newSubState = newState[k];
      if (child) {
        if (newSubState !== prevState[k]) {
          if (StateMapper.couldBeParent(newSubState)) {
            if (child.ref) {
              child.ref[onClearState](newSubState, prevState[k]);
            } else {
              delete this[k];
              this._createChild(newSubState, k);
            }
          } else {
            this[onRemoveChild](k);
          }
        }
      } else if (StateMapper.couldBeParent(newSubState)) {
        this._createChild(newSubState, k);
      }
    }
    return { ...prevState, ...newState, };
  }

  [onClearState](newState, prevState = {}) {
    const merge = { ...prevState, ...newState, };
    for (let k in merge) {
      k = '' + k;
      if (this[children][k]) {
        if (newState[k]) {
          if (newState[k] !== prevState[k]) {
            if (StateMapper.couldBeParent(newState[k])) {
              if (this[children][k].ref) {
                this[children][k].ref[onClearState](newState[k], prevState[k]);
              } else {
                delete this[k];
                this._createChild(newState[k], k);
              }
            } else {
              this[onRemoveChild](k);
            }
          }
        } else {
          this[onRemoveChild](k);
        }
      } else if (StateMapper.couldBeParent(newState[k])) {
        this._createChild(newState[k], k);
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
    const toBeRemoved = poorSet(indexes);
    const nextState = [];
    const stateLength = state.length;
    for (let i = 0; i<stateLength; i++) {
      i = '' + i;
      const { length, } = nextState;
      if (toBeRemoved[i]) {
        if (this[children][i]) {
          this[onRemoveChild](i);
        }
      } else {
        if (i !== length && this[children][i]) {
          const child = this[children][i];
          if (child.ref) {
            this[role][i][renameSelf](length+'');
          }
          delete this[i];
          this[children][length] = this[children][i];
          delete this[children][i];
          this._createChild(state[i], length+'', child.ref);
        }
        nextState.push(state[i]);
      }
    }
    return nextState;
  }

  [onRemoveFromObject](toBeRemoved, state = {}) {
    const set = poorSet(toBeRemoved);
    const nextState = {};
    for (let k in state) {
      k += '';
      if (set[k]) {
        this[onRemoveChild](k);
      } else {
        nextState[k] = state[k];
      }
    }
    return nextState;
  }

  getChildrenRecursively() {
    if (getChildrenRecursiveWarned) {
      console.warn('getChildrenRecursively, force initializes the children and can be extremely heavy on big objects.\nUse this for debugging purposes only');
      getChildrenRecursiveWarned = true;
    }
    return keys(this[children]).map(k => this[k]).reduce(onReduceChildren, []);
  }

  getChildren() {
    if (getChildrenWarned) {
      console.warn('getChildren is deprecated, it force initializes the children.\nYou need to perform this, you can achieve the same result with Object spread + Object+values');
      getChildrenWarned = true;
    }
    return keys(this[children]).map(k => this[k]);
  }

  [onRemoveChild](k) {
    delete this[children][k];
    delete this[k];
    if (this[role][k]) {
      this[role][removeChild](k);
    }
  }

  _createChild(initialState, k, predefinedRef) {
    const child = this[children][k] = { ref: predefinedRef, };
    defineProperty(this, k, {
      configurable: true,
      enumerable: true,
      get: () => {
        if (child.ref) {
          return child.ref;
        }
        child.ref = new StateMapper(initialState, this[depth] + 1, this[role][createChild](k), this[dispatcher]);
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

function poorSet(arr) {
  return arr.reduce(poorSetMapper, {});
}
function poorSetMapper(acc, k) {
  acc[k+''] = true;
  return acc;
}

function onReduceChildren(acc, child) {
  return [ ...acc, child, ...child.getChildrenRecursively(), ];
}