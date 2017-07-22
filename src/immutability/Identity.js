import { identityPrivates, } from '../common';

const id = Symbol('id');
const removed = Symbol('removed');
const parent = Symbol('parent');

const { push, removeChild, renameSelf, resolve, } = identityPrivates;

export default class Identity {

  constructor(key, prev) {
    this[parent]= prev;
    this[id] = key;
  }

  [push](key) {
    return (this[key] = new Identity(key, this));
  }

  [renameSelf](key) {
    if (this[parent]) {
      delete this[parent][this[id]];
      this[parent][key] = this;
    }
    this[id] = key;
  }

  [removeChild](key) {
    this[key][removed]= true;
    delete this[key][parent];
    delete this[key];
  }

  [resolve](acc = []) {
    if (this[removed]) {
      return false;
    }
    if (this[id]) {
      acc.push(this[id]);
      return this[parent][resolve](acc);
    }
    return acc;
  }

  getId() {
    return this[id];
  }

}
