import { knotTree, } from '../common';

const _key = Symbol('_knotset_key');
const _removed = Symbol('_knotset_removed');
const _prev = Symbol('_knotset_prev');
const { createChild, removeChild, renameSelf, resolveIdentity, } = knotTree;

export default class KnotTree {
  constructor(key, prev) {
    this[_prev]= prev;
    this[_key] = key;
  }

  [createChild](key) {
    this[key] = new KnotTree(key, this);
    return this[key];
  }

  [renameSelf](key) {
    if (this[_prev]) {
      delete this[_prev][this[_key]];
      this[_prev][key] = this;
    }
    this[_key] = key;
  }

  [removeChild](key) {
    this[key][_removed]= true;
    delete this[key][_prev];
    delete this[key];
  }

  [resolveIdentity](acc = []) {
    if (this[_removed]) {
      return false;
    }
    if (this[_key]) {
      acc.push(this[_key]);
      return this[_prev][resolveIdentity](acc);
    }
    return acc;
  }

  getId() {
    return this[_key];
  }

}
