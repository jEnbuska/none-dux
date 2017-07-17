import { stateMapperPrivates, TARGET, SET_STATE, CLEAR_STATE, REMOVE, GET_STATE, PARAM, PUBLISH_NOW, } from '../common';
import StateMapper from './StateMapper';

const { role, depth, dispatcher, children, } = stateMapperPrivates;

const { defineProperty, } = Object;
const bindables = [ 'transaction', 'getId', 'remove', 'removeSelf', 'getIdentity', 'setState', 'clearState', ];

// Saga state mapper does not dispatch its own actions, instead it should be used like:
// yield put(target.setState, {a:1,b: {}})
export default class StateMapperSaga extends StateMapper {

  constructor(state, ownDepth, ownRole, dispatched) {
    super(state, ownDepth, ownRole, dispatched);
    for (let i = 0; i<bindables.length; i++) {
      defineProperty(this, bindables[i], { value: this[bindables[i]].bind(this), enumerable: false, });
    }
  }

  transaction() {
    throw new Error('Cannot do transaction witch StateMapperSaga');
  }

  setState(value) {
    const identity = this.getIdentity();
    if (!identity) {
      throw new Error('Cannot call setState to removed Node. Got:', `${value}. Id: "${this.getId()}"`);
    } else if (!StateMapper.couldBeParent(value)) {
      throw new Error('StateMapper does not take other leafs as setState parameters. Got:', `${value}. Identity: "${this.getIdentity().join(', ')}"`);
    }
    return { type: SET_STATE, [TARGET]: identity, [PARAM]: value, [PUBLISH_NOW]: true, };
  }

  clearState(value) {
    const identity = this.getIdentity();
    if (!identity) {
      throw new Error('Cannot call clearState to removed Node. Got:', `${value}. Id: "${this.getId()}"`);
    }
    return { type: CLEAR_STATE, [TARGET]: identity, [PARAM]: value, [PUBLISH_NOW]: true, };
  }

  remove(...keys) {
    const identity = this.getIdentity();
    if (!identity) {
      throw new Error('Cannot call remove to removed Node. Got:', `${keys}. Id: "${this.getId()}"`);
    } else if (keys[0] instanceof Array) {
      return { type: REMOVE, [TARGET]: identity, [PARAM]: keys, [PUBLISH_NOW]: true, };
    }
    return { type: REMOVE, [TARGET]: identity, [PARAM]: keys, [PUBLISH_NOW]: true, };
  }

  removeSelf() {
    const identity = this.getIdentity();
    if (!identity) {
      throw new Error('Cannot call removeSelf to removed Node. Id:'+this.getId());
    }
    const [ _, ...parentIdentity ]= identity;
    return { type: REMOVE, [TARGET]: parentIdentity, [PARAM]: [ this.getId(), ], [PUBLISH_NOW]: true, };
  }

  _createChild(initialState, k, predefinedRef) {
    const child = this[children][k] = { ref: predefinedRef, };
    defineProperty(this, k, {
      configurable: true,
      enumerable: true,
      get: () => {
        if (child.ref) {
          return child.ref;
        }
        child.ref = new StateMapperSaga(initialState, this[depth] + 1, this[role][createChild](k), this[dispatcher]);
        return child.ref;
      },
    });
  }
}