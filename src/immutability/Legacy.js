import Branch from './Branch';

import { branchPrivates, identityPrivates, TARGET, GET_STATE, poorSet, } from '../common';

const { onSetState, onClearState, onRemove, identity, onRemoveChild, handleChange, children, dispatcher, } = branchPrivates;
const { removeChild, renameSelf, resolve, push, } = identityPrivates;
const onRemoveFromArray = Symbol('onRemoveFromArray');
const onRemoveFromObject = Symbol('onRemoveFromObject');

const { keys, defineProperties, defineProperty} = Object;

export default class Legacy extends Branch {
  constructor(identity, dispatcher, state) {
    super(identity, dispatcher);
    state = state || dispatcher.dispatch({ type: GET_STATE, [TARGET]: identity[resolve](), });
    this[children] = {};
    const properties = {};
    for (const k in state) {
      if (Branch.canBeBranch(state[k])) {
        const childRole = identity[push](k);
        properties[k] = {
          configurable: true,
          enumerable: false,
          get: () => this[children][k] || (this[children][k] = new this.constructor(childRole, dispatcher)),
          set() {},
        };
      }
    }
    defineProperties(this, properties);
  }
  [onSetState](newState, prevState) {
    this[handleChange](newState, prevState, newState);
  }

  [onClearState](newState, prevState) {
    this[handleChange](newState, prevState);
  }

  [handleChange](newState, prevState = {}, iterable = { ...prevState, ...newState, }) {
    const newProperties = {};
    for (let k in iterable) {
      k += '';
      const next = newState[k];
      if (next !== prevState[k]) {
        if (this[identity][k]) {
          if (Branch.canBeBranch(next)) {
            const child = this[children][k];
            if (child) {
              child[handleChange](next, prevState[k]);
            }
          } else {
            this[onRemoveChild](k);
          }
        } else if (Branch.canBeBranch(next)) {
          const childRole = this[identity][push](k);
          newProperties[k] = {
            configurable: true,
            enumerable: false,
            get: () => this[children][k] || (this[children][k] = new this.constructor(childRole, this[dispatcher])),
            set() {},
          };
        }
      }
    }
    defineProperties(this, newProperties);
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
      const role = this[identity][i];
      const { length, } = nextState;
      if (toBeRemoved[i]) {
        if (this[identity][i]) {
          this[onRemoveChild](i);
        }
      } else {
        if (Branch.canBeBranch(state[i]) && i !== length && role) {
          const child = this[children][i];
          if (child) {
            role[renameSelf](length+'');
            if (this[children][length]) {
              delete this[length];
            }
            this[length] = this[children][length] = child;
          } else {
            this._createChild(length+'');
          }
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
    delete this[children][k];
    this[identity][removeChild](k);
    delete this[k];
  }

  getChildren() {
    return keys(this[identity]).reduce((acc, k) => {
      acc[k] = this[k];
      return acc;
    }, {});
  }

  _createChild(k, childRole = this[identity][push](k)) {
    defineProperty(this, k, {
      configurable: true,
      enumerable: false,
      get: () => this[children][k] || (this[children][k] = new this.constructor(childRole, this[dispatcher])),
      set() {},
    });
  }

  _getChildrenRecursively() {
    return keys(this[identity]).map(k => this[k]).reduce(Branch._onGetChildrenRecursively, []);
  }

}