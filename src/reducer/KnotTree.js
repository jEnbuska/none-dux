import { knotTree, } from '../common';

const _key = Symbol('_knotlist_key');
const _removed = Symbol('_knotlist_removed');
const _prev = Symbol('_knotlist_prev');
const { createChild, removeChild, renameSelf, resolveIdentity, } = knotTree;

// TODO rename to KnotTree
export default class KnotList {
  constructor(key, prev) {
    this[_prev]= prev;
    this[_key] = key;
    this[_removed] = false;
  }

  [createChild](key) {
    key +='';
    this[key] = new KnotList(key, this);
    return this[key];
  }

  [renameSelf](key) {
    key +='';
    if (this[_prev]) {
      delete this[_prev][this[_key]];
      this[_prev][key] = this;
    }
    this[_key] = key;
  }

  [removeChild](key) {
    key +='';
    if (this[key]) {
      this[key][_removed]= true;
      delete this[key][_prev];
      delete this[key];
    } else {
      throw new Error('removing invalid key'+key);
    }
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
