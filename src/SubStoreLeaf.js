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
    assign(this, arr);
    freeze(this);
    seal(this);
  }

  get length() {
    return values(this).length;
  }

  map(func) {
    return values(this).map(func);
  }

  filter(arg) {
    return values(this).filter(arg);
  }

  concat() {
    onThrow('concat');
  }
  copyWithin() {
    onThrow('copyWithin');
  }
  every(arg) {
    return values(this).every(arg);
  }
  fill() {
    onThrow('fill');
  }
  find(arg) {
    return values(this).find(arg);
  }
  findIndex(arg) {
    return values(this).findIndex(arg);
  }
  forEach(arg) {
    return values(this).forEach(arg);
  }
  indexOf(arg) {
    return values(this).indexOf(arg);
  }
  isArray() {
    onThrow('isArray');
  }
  join(arg) {
    return values(this).join(arg);
  }
  lastIndexOf(arg) {
    return values(this).lastIndexOf(arg);
  }
  pop() {
    onThrow('pop');
  }
  push() {
    onThrow('push');
  }
  reduce(arg, seed) {
    return values(this).reduce(arg, seed);
  }
  reduceRight(arg, seed) {
    return values(this).reduceRight(arg, seed);
  }
  reverse() {
    onThrow('reverse');
  }
  shift() {
    onThrow('shift');
  }
  slice(arg1, arg2) {
    return values(this).slice(arg1, arg2);
  }
  some(arg) {
    return values(this).some(arg);
  }
  sort() {
    onThrow('sort');
  }
  splice() {
    onThrow('splice');
  }
  toString()	{
    return values(this).toString();
  }
  unshift() {
    onThrow('unshift');
  }
  valueOf() {
    return values(this).valueOf();
  }

}

