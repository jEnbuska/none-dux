import Legacy from './Legacy';
import { branchPrivates, } from '../common';

const { dispatcher, } = branchPrivates;

export default class BranchLegacy extends Legacy {

  setState(value) {
    this[dispatcher].dispatch(super.setState(value));
    return this;
  }

  clearState(value) {
    this[dispatcher].dispatch(super.clearState(value));
    return this;
  }

  remove(...keys) {
    if (keys[0] instanceof Array) {
      keys = keys[0];
    }
    this[dispatcher].dispatch(super.remove(keys));
    return this;
  }
}