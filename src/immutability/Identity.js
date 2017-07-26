import { identityPrivates, } from '../common';

const key = Symbol('IDENTITY:key')
const parent = 'IDENTITY::parent';

const { push, resolve, } = identityPrivates;

export default class Identity {

  constructor(_key, _parent) {
    this[key] = _key;
    this[parent] = _parent;
  }

  [push](key) {
    return new Identity(key, this);
  }

  [resolve](acc = []) {
    if (this[key]) {
      acc.push(this[key]);
      return this[parent][resolve](acc);
    }
    return acc;
  }

  getId() {
    return this[key];
  }

}
