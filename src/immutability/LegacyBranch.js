import Legacy from './Legacy';

import { branchPrivates, identityPrivates, } from '../common';

const { identity, dispatcher, children, } = branchPrivates;
const { push, } = identityPrivates;

const { defineProperty, } = Object;
export default class BranchLegacy extends Legacy {

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