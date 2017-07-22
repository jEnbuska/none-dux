import Legacy from './Legacy';
import Branch from './Branch';
import { branchPrivates, identityPrivates, GET_STATE, TARGET, } from '../common';

const { identity, dispatcher, children, } = branchPrivates;
const { push, resolve, } = identityPrivates;

const { defineProperty, defineProperties, } = Object;
export default class BranchLegacy extends Legacy {

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
          get: () => this[children][k] || (this[children][k] = new BranchLegacy(childRole, dispatcher)),
          set() {},
        };
      }
    }
    defineProperties(this, properties)
  }

  setState(value) {
    this[dispatcher].dispatch(super.setState(value));
    return this;
  }

  clearState(value) {
    this[dispatcher].dispatch(super.clearState(value));
    return this;
  }

  remove(...keys) {
    if (keys[0] instanceof Array) {
      keys = keys[0];
    }
    this[dispatcher].dispatch(super.remove(keys));
    return this;
  }

  _createChild(k, childRole = this[identity][push](k)) {
    defineProperty(this, k, {
      configurable: true,
      enumerable: false,
      get: () => this[children][k] || (this[children][k] = new BranchLegacy(childRole, this[dispatcher])),
      set() {},
    });
  }
}