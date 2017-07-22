import Branch from './Branch';

import { branchPrivates, identityPrivates, SUBJECT, GET_STATE, poorSet, } from '../common';
const { onSetState, onClearState, onRemove, identity, onRemoveChild, handleChange, dispatcher, } = branchPrivates;
const { removeChild, renameSelf, resolve, push, branch, } = identityPrivates;
const onRemoveFromArray = Symbol('onRemoveFromArray');
const onRemoveFromObject = Symbol('onRemoveFromObject');

const { keys, defineProperties, defineProperty, } = Object;

export default class Legacy extends Branch {
  constructor(identity, dispatcher, state) {
    super(identity, dispatcher);
    state = state || dispatcher.dispatch({ type: GET_STATE, [SUBJECT]: identity[resolve](), });
    const properties = {};
    for (const k in state) {
      if (Branch.valueCanBeBranch(state[k])) {
        const childIdentity = identity[push](k);
        properties[k] = {
          configurable: true,
          enumerable: false,
          get: () => childIdentity[branch] || (childIdentity[branch] = new this.constructor(childIdentity, dispatcher)),
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
        const childIdentity = this[identity][k];
        if (childIdentity) {
          if (Branch.valueCanBeBranch(next)) {
            if (childIdentity[branch]) {
              childIdentity[branch][handleChange](next, prevState[k]);
            }
          } else {
            this[onRemoveChild](k);
          }
        } else if (Branch.valueCanBeBranch(next)) {
          const childIdentity = this[identity][push](k);
          newProperties[k] = {
            configurable: true,
            enumerable: false,
            get: () => childIdentity[branch] || (childIdentity[branch] = new this.constructor(childIdentity, this[dispatcher])),
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
      const length = nextState.length + '';
      if (toBeRemoved[i]) {
        if (this[identity][i]) {
          this[onRemoveChild](i);
        }
      } else {
        const childIdentity = this[identity][i];
        if (Branch.valueCanBeBranch(state[i]) && i !== length && childIdentity) {
          if (childIdentity[branch]) {
            delete this[length];
            childIdentity[renameSelf](length);
            this[length] = childIdentity[branch];
          } else {
            this._createChild(length);
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
      get: () => childRole[branch] || (childRole[branch] = new this.constructor(childRole, this[dispatcher])),
      set() {},
    });
  }

  _getChildrenRecursively() {
    return keys(this[identity]).map(k => this[k]).reduce(Branch._onGetChildrenRecursively, []);
  }

}