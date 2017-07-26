import { branchPrivates, identityPrivates, SUBJECT, SET_STATE, CLEAR_STATE, REMOVE, PARAM, PUBLISH_NOW, GET_STATE, COMMIT_TRANSACTION, ROLLBACK, invalidParents, } from '../common';

const { identity, dispatcher, } = branchPrivates;
const { resolve, clearReferences, } = identityPrivates;
const { getPrototypeOf, defineProperties, } = Object;
// Saga state mapper does not dispatch its own actions, instead it should be used like:
// yield put(target.setState, {a:1,b: {}})
export default class Branch {

  constructor(_identity, _dispatched) {
    defineProperties(this, {
      [identity]: {
        value: _identity,
        enumerable: false,
        configurable: true,
      },
      [dispatcher]: {
        value: _dispatched,
        enumerable: false,
        configurable: true,
      },
    });
  }

  clearReferences(middleware) {
    if (!middleware) {
      console.warn('clearReferences has been deprecated.\nclearReferences is automatically run after action has been executed and there is no other pending actions');
    }
    this[identity][clearReferences]();
  }

  transaction(callBack) {
    const dispatcherRef = this[dispatcher];
    const publishAfterDone = !dispatcherRef.onGoingTransaction;
    const stateBefore = dispatcherRef.dispatch({ type: GET_STATE, [SUBJECT]: [], });
    try {
      dispatcherRef.onGoingTransaction = true;
      callBack(this);
      if (publishAfterDone) {
        dispatcherRef.dispatch({ type: COMMIT_TRANSACTION, });
      }
    } catch (Exception) {
      dispatcherRef.dispatch({ type: ROLLBACK, [PARAM]: stateBefore, });
      throw Exception;
    } finally {
      if (publishAfterDone) {
        dispatcherRef.onGoingTransaction = false;
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
    const identifier = this[identity][resolve]();
    if (!identifier) {
      throw new Error('Cannot call setState to removed Node. Got:', `${value}. Id: "${this.getId()}"`);
    } else if (!Branch.valueCanBeBranch(value)) {
      throw new Error('Branch does not take leafs as setState parameters. Got:', `${value}. Identity: "${this.getIdentity().join(', ')}"`);
    } else if (value instanceof Array) {
      throw new Error(`Target: "${identifier.join(', ')}"\nCannot call set state parameter is Array`);
    }
    return { type: SET_STATE, [SUBJECT]: identifier, [PARAM]: value, [PUBLISH_NOW]: !this[dispatcher].onGoingTransaction, };
  }

  clearState(value) {
    const identifier = this[identity][resolve]();
    if (!identifier) {
      throw new Error('Cannot call clearState to removed Node. Got:', `${value}. Id: "${this.getId()}"`);
    } else if (!Branch.valueCanBeBranch(value)) {
      throw new Error('Branch does not take leafs as clearState parameters. Got:', `${value}. Identity: "${this.getIdentity().join(', ')}"`);
    }
    return { type: CLEAR_STATE, [SUBJECT]: identifier, [PARAM]: value, [PUBLISH_NOW]: !this[dispatcher].onGoingTransaction, };
  }

  remove(keys) {
    const identifier = this[identity][resolve]();
    if (!identifier) {
      throw new Error('Cannot call remove on removed Node. Got:', `${keys}. Id: "${this.getId()}"`);
    }
    return { type: REMOVE, [SUBJECT]: identifier, [PARAM]: keys, [PUBLISH_NOW]: !this[dispatcher].onGoingTransaction, };
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