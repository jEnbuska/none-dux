import Legacy from './Legacy';

const { defineProperty, } = Object;
const bindables = [ 'transaction', 'getId', 'remove', 'getIdentity', 'setState', 'clearState', ];

export default class SagaLegacyBranch extends Legacy {

  constructor(identity, dispatched, state) {
    super(identity, dispatched, state);
    for (let i = 0; i<bindables.length; i++) {
      defineProperty(this, bindables[i], { value: this[bindables[i]].bind(this), enumerable: false, writable: true, configurable: true, });
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
}