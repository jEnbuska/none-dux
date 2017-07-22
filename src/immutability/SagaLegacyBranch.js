import { branchPrivates, identityPrivates, GET_STATE, TARGET, } from '../common';
import Legacy from './Legacy';
import Branch from './Branch';

const { identity, dispatcher, children, } = branchPrivates;
const { push, resolve, } = identityPrivates;

const { defineProperty, defineProperties, } = Object;
const bindables = [ 'transaction', 'getId', 'remove', 'getIdentity', 'setState', 'clearState', ];

export default class SagaBranchLegacy extends Legacy {
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
          get: () => this[children][k] || (this[children][k] = new SagaBranchLegacy(childRole, dispatcher)),
          set() {},
        };
      }
    }
    defineProperties(this, properties)
  }

  transaction() {
    throw new Error('Can\'t do transaction witch Saga none-dux');
  }

  remove(...keys) {
    if (keys[0] instanceof Array) {
      keys = keys[0];
    }
    return super.remove(keys);
  }

  _createChild(k, childRole = this[identity][push](k)) {
    defineProperty(this, k, {
      configurable: true,
      enumerable: false,
      get: () => this[children][k] || (this[children][k] = new SagaBranchLegacy(childRole, this[dispatcher])),
      set() {},
    });
  }
}