import Legacy from './Legacy';
import Branch from './Branch';

import { branchPrivates, knotTree, } from '../common';

const { identity, dispatcher, children, } = branchPrivates;
const { createChild, resolve, } = knotTree;

const { defineProperty, keys, } = Object;

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

  removeSelf() {
    this[dispatcher].dispatch(super.removeSelf());
  }

  _createChild(k, childRole = this[identity][createChild](k)) {
    defineProperty(this, k, {
      configurable: true,
      enumerable: true,
      get: () => this[children][k] || (this[children][k] = new BranchLegacy(childRole, this[dispatcher])),
      set: (child) => {
        this[children][k] = child;
      },
    });
  }

  _getChildren() {
    return keys(this[identity]).map(k => this[k]);
  }

  _getChildrenRecursively() {
    return keys(this[identity]).map(k => this[k]).reduce(Branch._onReduceChildren, []);
  }

}