import ProxyStateMapper from './ProxyStateMapper';
import { stateMapperPrivates, knotTree, TARGET, SET_STATE, CLEAR_STATE, REMOVE, PARAM, PUBLISH_NOW, } from '../common';

const { role, depth, dispatcher, } = stateMapperPrivates;
const { createChild, } = knotTree;

export default class NodeSaga extends ProxyStateMapper {

  transaction() {
    throw new Error('Cannot do transaction with Saga');
  }

  setState(value) {
    const identity = this.getIdentity();
    if (!identity) {
      throw new Error('Cannot call setState to removed Node. Got:', `${value}. Id: "${this.getId()}"`);
    }
    return { type: SET_STATE, [TARGET]: identity, [PARAM]: value, [PUBLISH_NOW]: !this[dispatcher].onGoingTransaction, };
  }

  clearState(value) {
    const identity = this.getIdentity();
    if (!identity) {
      throw new Error('Cannot call clearState to removed Node. Got:', `${value}. Id: "${this.getId()}"`);
    }
    return { type: CLEAR_STATE, [TARGET]: identity, [PARAM]: value, [PUBLISH_NOW]: !this[dispatcher].onGoingTransaction, };
  }

  remove(...keys) {
    const identity = this.getIdentity();
    if (!identity) {
      throw new Error('Cannot call remove to removed Node. Got:', `${keys}. Id: "${this.getId()}"`);
    } else if (keys[0] instanceof Array) {
      keys = keys[0];
    }
    return { type: REMOVE, [TARGET]: identity, [PARAM]: keys, [PUBLISH_NOW]: !this[dispatcher].onGoingTransaction, };
  }

  removeSelf() {
    const identity = this.getIdentity();
    if (!identity) {
      throw new Error('Cannot call removeSelf to removed Node. Id:'+this.getId());
    }
    const [ _, ...parentIdentity ]= identity;
    return { type: REMOVE, [TARGET]: parentIdentity, [PARAM]: [ this.getId(), ], [PUBLISH_NOW]: !this[dispatcher].onGoingTransaction, };
  }

  _createChild(k, childRole = this[role][createChild](k)) {
    const child = new NodeSaga(this[depth] + 1, childRole, this[dispatcher]);
    return child._createProxy();
  }

}