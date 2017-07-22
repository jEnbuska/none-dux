import { branchPrivates, identityPrivates, GET_STATE, TARGET, } from '../common';
import Legacy from './Legacy';
import Branch from './Branch';

const { identity, dispatcher, children, } = branchPrivates;
const { push, resolve, } = identityPrivates;

const { defineProperty, defineProperties, } = Object;
const bindables = [ 'transaction', 'getId', 'remove', 'getIdentity', 'setState', 'clearState', ];

export default class SagaBranchLegacy extends Legacy {

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