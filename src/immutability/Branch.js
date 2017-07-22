import { branchPrivates, identityPrivates, SUBJECT, SET_STATE, CLEAR_STATE, REMOVE, PARAM, PUBLISH_NOW, GET_STATE, COMMIT_TRANSACTION, ROLLBACK, invalidParents, } from '../common';

const { identity, dispatcher, } = branchPrivates;
const { resolve, } = identityPrivates;
const { getPrototypeOf, } = Object;
// Saga state mapper does not dispatch its own actions, instead it should be used like:
// yield put(target.setState, {a:1,b: {}})
export default class Branch {

  constructor(_identity, _dispatched) {
    this[identity] = _identity;
    this[dispatcher] = _dispatched;
  }

  transaction(callBack) {
    const publishAfterDone = !this[dispatcher].onGoingTransaction;
    const stateBefore = this[dispatcher].dispatch({ type: GET_STATE, [SUBJECT]: [], });
    try {
      this[dispatcher].onGoingTransaction = true;
      callBack(this._returnSelf());
      if (publishAfterDone) {
        this[dispatcher].dispatch({ type: COMMIT_TRANSACTION, });
      }
    } catch (Exception) {
      this[dispatcher].dispatch({ type: ROLLBACK, [PARAM]: stateBefore, });
      throw Exception;
    } finally {
      if (publishAfterDone) {
        this[dispatcher].onGoingTransaction = false;
      }
    }
  }

  get state() {
    const resolved = this[identity][resolve]();
    if (resolved) {
      return this[dispatcher].dispatch({ type: GET_STATE, [SUBJECT]: resolved, });
    }
    return Branch.onAccessingRemovedBranch(this.getId(), 'state');
  }

  getId() {
    return this[identity].getId();
  }

  getIdentity() {
    return this[identity][resolve]();
  }

  setState(value) {
    const identity = this.getIdentity();
    if (!identity) {
      throw new Error('Cannot call setState to removed Node. Got:', `${value}. Id: "${this.getId()}"`);
    } else if (!Branch.valueCanBeBranch(value)) {
      throw new Error('Branch does not take leafs as setState parameters. Got:', `${value}. Identity: "${this.getIdentity().join(', ')}"`);
    } else if (value instanceof Array) {
      throw new Error(`Target: "${identity.join(', ')}"\nCannot call set state parameter is Array`);
    }
    return { type: SET_STATE, [SUBJECT]: identity, [PARAM]: value, [PUBLISH_NOW]: !this[dispatcher].onGoingTransaction, };
  }

  clearState(value) {
    const identity = this.getIdentity();
    if (!identity) {
      throw new Error('Cannot call clearState to removed Node. Got:', `${value}. Id: "${this.getId()}"`);
    } else if (!Branch.valueCanBeBranch(value)) {
      throw new Error('Branch does not take leafs as clearState parameters. Got:', `${value}. Identity: "${this.getIdentity().join(', ')}"`);
    }
    return { type: CLEAR_STATE, [SUBJECT]: identity, [PARAM]: value, [PUBLISH_NOW]: !this[dispatcher].onGoingTransaction, };
  }

  remove(keys) {
    const identity = this.getIdentity();
    if (!identity) {
      throw new Error('Cannot call remove on removed Node. Got:', `${keys}. Id: "${this.getId()}"`);
    }
    return { type: REMOVE, [SUBJECT]: identity, [PARAM]: keys, [PUBLISH_NOW]: !this[dispatcher].onGoingTransaction, };
  }

  _returnSelf() {
    return this;
  }

  static _onGetChildrenRecursively(acc, child) {
    return [ ...acc, child, ...child._getChildrenRecursively(), ];
  }

  static valueCanBeBranch(value) {
    return value && value instanceof Object && !invalidParents[getPrototypeOf(value).constructor.name];
  }

  static onAccessingRemovedBranch(property) {
    console.error('Accessing '+property+' of removed Branch');
  }
}