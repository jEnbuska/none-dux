const { assign, freeze, seal, } = Object;

// If you have an object that you be an SubStore
/*
* const judgeStaticData = {....}
* */
// target.setState({resources: new SubStoreLeaf(judgeStaticData)})

export default class SubStoreLeaf {

  constructor(value) {
    assign(this, value);
    freeze(this);
    seal(this);
  }

}
