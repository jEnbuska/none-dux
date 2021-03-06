import { identityPrivates, bra, } from '../common';

const { defineProperties, } = Object;
const id = 'IDENTITY:id';
const removed = 'IDENTITY::removed';
const parent = 'IDENTITY::parent';

const onChildResolveAfterRetired = function () {
  throw new Error("Invoking detached child.\n" +
    "You are probably invoking an instance inside a Promise\n" +
    "Fix the issue by retuning the Promise from the action function, or use async await");
};

const { push, removeChild, renameSelf, resolve, branch, clearReferences, } = identityPrivates;

export default class Identity {

  constructor(key, prev) {
    defineProperties(this, {
      [id]: { value: key, writable: true, configurable: true, },
      [parent]: { value: prev, writable: true, configurable: true, },
      [branch]: { value: undefined, writable: true, configurable: true, },
    });
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

  [clearReferences]() {
    for (const child in this) {
      this[child][resolve] = onChildResolveAfterRetired;
      delete this[child];
    }
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
