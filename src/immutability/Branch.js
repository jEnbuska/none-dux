import { branchPrivates, identityPrivates, SUBJECT, SET_STATE, CLEAR_STATE, REMOVE, PARAM, PUBLISH_NOW, GET_STATE, COMMIT_TRANSACTION, ROLLBACK, invalidParents, } from '../common';

const { identity, dispatcher, accessPrevState, accessState, accessPendingState, } = branchPrivates;
const { resolve, push, } = identityPrivates;

const branchReflectables = {
  state: true,
  setState: true,
  clearState: true,
  remove: true,
  transaction: true,
  getIdentity: true,
  getId: true,
  _getChildrenRecursively: true,
};
const branchAccerssors = {
  [identity]: true,
  [dispatcher]: true,
  [accessState]: true,
  [accessPrevState]: true,
  [accessPendingState]: true,
};

const proxyHandler = {
  get(target, k, receiver) {
    if (branchAccerssors[k]) {
      return target[k];
    } else if (branchReflectables[k]) {
      return Reflect.get(target, k, receiver);
    }
    const resolved = target[identity][resolve]();
    if (resolved) {
      const state = target[dispatcher].dispatch({ type: GET_STATE, [SUBJECT]: resolved, });
      const createChildProxy = Reflect.get(target, '_createChildProxy', receiver);
      if (k === 'getChildren') {
        const children = Branch.onGetChildren(target, state, createChildProxy);
        return function () { return this; }.bind(children);
      }
      if (typeof k ==='symbol') {
        return k;
      }
      k += ''; // find single child
      state[k];
      return Reflect.apply(createChildProxy, target, [ target[dispatcher], target[identity][k] || target[identity][push](k), ]);
    }
    Branch.onAccessingRemovedBranch(target[identity].getId(), k);
  },
};
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
    const location = this[identity][resolve]();
    try {
      return this[dispatcher].dispatch({ type: GET_STATE, [SUBJECT]: location, });
    } catch (error) {
      return Branch.onAccessingRemovedBranch(location.join(', '), 'state');
    }
  }

  getId() {
    return this[identity].getId();
  }

  getIdentity() {
    return this[identity][resolve]();
  }

  setState(value) {
    const identifier = this[identity][resolve]();
    if (!Branch.valueCanBeBranch(value)) {
      throw new Error('Branch does not take leafs as setState parameters. Got:', `${value}. Identity: "${this.getIdentity().join(', ')}"`);
    } else if (value instanceof Array) {
      throw new Error(`Target: "${identifier.join(', ')}"\nCannot call set state parameter is Array`);
    }
    this[dispatcher].dispatch({ type: SET_STATE, [SUBJECT]: identifier, [PARAM]: value, [PUBLISH_NOW]: !this[dispatcher].onGoingTransaction, });
    return this;
  }

  clearState(value) {
    const identifier = this[identity][resolve]();
    if (!Branch.valueCanBeBranch(value)) {
      throw new Error('Branch does not take leafs as clearState parameters. Got:', `${value}. Identity: "${this.getIdentity().join(', ')}"`);
    }
    this[dispatcher].dispatch({ type: CLEAR_STATE, [SUBJECT]: identifier, [PARAM]: value, [PUBLISH_NOW]: !this[dispatcher].onGoingTransaction, });
    return this;
  }

  remove(...keys) {
    if (keys[0] instanceof Array) {
      keys = keys[0];
    }
    this[dispatcher].dispatch({ type: REMOVE, [SUBJECT]: this[identity][resolve](), [PARAM]: keys, [PUBLISH_NOW]: !this[dispatcher].onGoingTransaction, });
    return this;
  }

  _createChildProxy(dispatcher, childIdentity) {
    const child = new Branch(childIdentity, dispatcher);
    return child._createProxy();
  }

  getChildren() { /* dummy func handled by by*/ }

  _getChildrenRecursively() {
    return Object.values(this.getChildren()).reduce(Branch._onGetChildrenRecursively, []);
  }
  _createProxy() {
    return new Proxy(this, proxyHandler);
  }

  static onGetChildren(target, state, createChild) {
    const children = {};
    for (let k in state) {
      k+='';
      const v = state[k];
      if (Branch.valueCanBeBranch(v)) {
        children[k] = Reflect.apply(createChild, target, [ target[dispatcher], target[identity][k] || target[identity][push](k), ]);
      }
    }
    return children;
  }

  static _onGetChildrenRecursively(acc, child) {
    return [ ...acc, child, ...child._getChildrenRecursively(), ];
  }

  static valueCanBeBranch(value) {
    return value && value instanceof Object && !invalidParents[getPrototypeOf(value).constructor.name];
  }

  static onAccessingRemovedBranch(identity) {
    console.error('Accessing "'+identity+'" of removed Branch');
  }
}