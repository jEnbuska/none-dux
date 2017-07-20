import { stateMapperPrivates, knotTree, TARGET, SET_STATE, CLEAR_STATE, REMOVE, GET_STATE, PARAM, PUBLISH_CHANGES, PUBLISH_NOW, ROLLBACK, invalidParents, poorSet} from '../common';

const { onSetState, onClearState, onRemove, role, depth, dispatcher, onRemoveChild, children, handleChange, } = stateMapperPrivates;
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

  constructor(state, _depth, _role, _dispatcher) {
    this[role] = _role;
    if (_depth>StateMapper.maxDepth) { StateMapper.__kill(this); }
    this[depth] = _depth;
    this[dispatcher] = _dispatcher;
    this[children] = {};
    state = state || _dispatcher.dispatch({ type: GET_STATE, [TARGET]: _role[resolveIdentity](), });
    for (const k in state) {
      if (StateMapper.couldBeParent(state[k])) {
        this._createChild(k+'',);
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
    const identity = this[role][resolveIdentity]();
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
      this[handleChange](newState, prevState);
      return newState;
    }
    this[handleChange](newState, prevState, newState);
    return { ...prevState, ...newState, };
  }

  [onClearState](newState, prevState) {
    this[handleChange](newState, prevState);
  }

  [handleChange](newState, prevState = {}, iterable = { ...prevState, ...newState, }) {
    for (let k in iterable) {
      k += '';
      const next = newState[k];
      if (this[role][k]) {
        if (StateMapper.couldBeParent(next)) {
          if (this[children][k] && next !== prevState[k]) {
            this[children][k][handleChange](next, prevState[k]);
          }
        } else {
          this[onRemoveChild](k);
        }
      } else if (StateMapper.couldBeParent(next)) {
        this._createChild(k);
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
      i += '';
      const { length, } = nextState;
      if (toBeRemoved[i]) {
        if (this[role][i]) {
          this[onRemoveChild](i);
        }
      } else {
        if (StateMapper.couldBeParent(state[i]) && i !== length && this[role][i]) {
          const child = this[children][i];
          if (child) {
            child[role][renameSelf](length+'');
            this[length] = child;
          } else {
            this[children][length] = this[children][i];
            this._createChild(length+'');
          }
          this[children][i] = undefined;
          delete this[i];
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
        if (this[role][k]) {
          this[onRemoveChild](k);
        }
      } else {
        nextState[k] = state[k];
      }
    }
    return nextState;
  }

  [onRemoveChild](k) {
    this[role][removeChild](k);
    if (this[children][k]) {
      delete this[children][k];
    }
    delete this[k];
  }

  static onAccessingRemovedNode(id, property) {
    console.error('Accessing '+property+' of remove node '+id+' will always return undefined');
  }

  _createChild(k, childRole = this[role][createChild](k)) {
    defineProperty(this, k, {
      configurable: true,
      enumerable: true,
      get: () => this[children][k] || (this[children][k] = new StateMapper(undefined, this[depth] + 1, childRole, this[dispatcher])),
      set: (child) => {
        this[children][k] = child;
      },
    });
  }

  _getChildren() {
    return keys(this[role]).map(k => this[k]);
  }

  _getChildrenRecursively() {
    return keys(this[role]).map(k => this[k]).reduce(StateMapper._onReduceChildren, []);
  }

  static _onReduceChildren(acc, child){
    return [ ...acc, child, ...child._getChildrenRecursively(), ];
  }
  static couldBeParent(value) {
    return value && value instanceof Object && !invalidParents[getPrototypeOf(value).constructor.name];
  }
}