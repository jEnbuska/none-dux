const { assign, freeze, seal, } = Object;

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

export class SubStoreArrayLeaf extends Array {
  constructor(arr) {
    super(...arr);
    freeze(this);
    seal(this);
  }
}
