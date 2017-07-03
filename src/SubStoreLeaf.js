const { assign, freeze, seal, values, } = Object;

// If you have an object that you be an SubStore
/*
* const judgeStaticData = {....}
* */
// target.setState({resources: new SubStoreLeaf(judgeStaticData)})
export default function createLeaf(obj) {
  if (obj instanceof Object) {
    if (obj instanceof Array) {
      return new SubStoreArrayLeaf(obj);
    }
    return new SubStoreObjectLeaf(obj);
  }
  throw new Error('createLeaf expected to receive on object as parameter but received '+obj);
}

export class SubStoreObjectLeaf {

  constructor(obj) {
    assign(this, obj);
    freeze(this);
    seal(this);
  }
}

function onThrow(func) {
  throw new Error('SubStoreArrayLeaf does not implement "'+ func+'"');
}

export class SubStoreArrayLeaf {
  constructor(arr = []) {
    this.length = arr.length;
    assign(this, arr);
    freeze(this);
    seal(this);
  }

  values() {
    const { length, ...rest } = this;
    return Object.values(rest);
  }

  map(func) {
    return this.values().map(func);
  }

  filter(arg) {
    return this.values().filter(arg);
  }

  concat() {
    onThrow('concat');
  }
  copyWithin() {
    onThrow('copyWithin');
  }
  every(arg) {
    return this.values().every(arg);
  }
  fill() {
    onThrow('fill');
  }
  find(arg) {
    return this.values().find(arg);
  }
  findIndex(arg) {
    return this.values().findIndex(arg);
  }
  forEach(arg) {
    return this.values().forEach(arg);
  }
  indexOf(arg) {
    return this.values().indexOf(arg);
  }
  isArray() {
    onThrow('isArray');
  }
  join(arg) {
    return this.values().join(arg);
  }
  lastIndexOf(arg) {
    return this.values().lastIndexOf(arg);
  }
  pop() {
    onThrow('pop');
  }
  push() {
    onThrow('push');
  }
  reduce(arg, seed) {
    return this.values().reduce(arg, seed);
  }
  reduceRight(arg, seed) {
    return this.values().reduceRight(arg, seed);
  }
  reverse() {
    onThrow('reverse');
  }
  shift() {
    onThrow('shift');
  }
  slice(arg1, arg2) {
    return this.values().slice(arg1, arg2);
  }
  some(arg) {
    return this.values().some(arg);
  }
  sort() {
    onThrow('sort');
  }
  splice() {
    onThrow('splice');
  }
  toString()	{
    return this.values().toString();
  }
  unshift() {
    onThrow('unshift');
  }
  valueOf() {
    return this.values().valueOf();
  }
}
