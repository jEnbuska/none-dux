import { branchPrivates, knotTree, } from '../common';
import Legacy from './Legacy';

const { identity, dispatcher, children, } = branchPrivates;
const { createChild, } = knotTree;

const { defineProperty, } = Object;
const bindables = [ 'transaction', 'getId', 'remove', 'removeSelf', 'getIdentity', 'setState', 'clearState', ];

export default class SagaBranchLegacy extends Legacy {

  constructor(identity, dispatched, state) {
    super(identity, dispatched, state);
    for (let i = 0; i<bindables.length; i++) {
      defineProperty(this, bindables[i], { value: this[bindables[i]].bind(this), enumerable: false, });
    }
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

  _createChild(k, childRole = this[identity][createChild](k)) {
    defineProperty(this, k, {
      configurable: true,
      enumerable: false,
      get: () => this[children][k] || (this[children][k] = new SagaBranchLegacy(childRole, this[dispatcher])),
      set: (child) => {
        this[children][k] = child;
      },
    });
  }
}