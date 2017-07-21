import Branch from './Branch';

import { branchPrivates, knotTree, TARGET, GET_STATE, poorSet, } from '../common';

const { onSetState, onClearState, onRemove, identity, onRemoveChild, children, handleChange, } = branchPrivates;
const { removeChild, renameSelf, resolve, } = knotTree;
const onRemoveFromArray = Symbol('onRemoveFromArray');
const onRemoveFromObject = Symbol('onRemoveFromObject');

const { keys, } = Object;

export default class Legacy extends Branch {

  constructor(identity, dispatcher, state) {
    super(identity, dispatcher);
    this[children] = {};
    state = state || dispatcher.dispatch({ type: GET_STATE, [TARGET]: identity[resolve](), });
    for (const k in state) {
      if (Branch.couldBeParent(state[k])) {
        this._createChild(k+'',);
      }
    }
  }

  [onSetState](newState, prevState) {
    this[handleChange](newState, prevState, newState);
  }

  [onClearState](newState, prevState) {
    this[handleChange](newState, prevState);
  }

  [handleChange](newState, prevState = {}, iterable = { ...prevState, ...newState, }) {
    for (let k in iterable) {
      k += '';
      const next = newState[k];
      if (this[identity][k]) {
        if (Branch.couldBeParent(next)) {
          if (this[children][k] && next !== prevState[k]) {
            this[children][k][handleChange](next, prevState[k]);
          }
        } else {
          this[onRemoveChild](k);
        }
      } else if (Branch.couldBeParent(next)) {
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
        if (this[identity][i]) {
          this[onRemoveChild](i);
        }
      } else {
        if (Branch.couldBeParent(state[i]) && i !== length && this[identity][i]) {
          const child = this[children][i];
          if (child) {
            child[identity][renameSelf](length+'');
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
        if (this[identity][k]) {
          this[onRemoveChild](k);
        }
      } else {
        nextState[k] = state[k];
      }
    }
    return nextState;
  }

  [onRemoveChild](k) {
    this[identity][removeChild](k);
    if (this[children][k]) {
      delete this[children][k];
    }
    delete this[k];
  }

  getChildren() {
    return keys(this[identity]).map(k => this[k]);
  }

  _getChildrenRecursively() {
    return keys(this[identity]).map(k => this[k]).reduce(Branch._onReduceChildren, []);
  }

}