const { freeze, seal, entries, } = Object;

// If you have an object that you be an SubStore
/*
* const startTime = moment().startOf('day');
* const endTime = moment().add(1, 'day').startOf('day');
* */
//target.setState({appointment: new SubStoreLeaf({startTime, endTime}})

export default class SubStoreLeaf {

  constructor(value) {
    entries(value).forEach(([ k, v, ]) => { this[k]=v; });
    freeze(this);
    seal(this);
  }

}
