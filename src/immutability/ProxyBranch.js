import Branch from './Branch';
import { branchPrivates, identityPrivates, SUBJECT, GET_STATE, } from '../common';

const { identity, dispatcher, accessPrevState, accessState, accessPendingState, } = branchPrivates;
const { push, resolve, } = identityPrivates;

const branchReflectables = {
  state: true,
  setState: true,
  clearState: true,
  remove: true,
  transaction: true,
  getIdentity: true,
  removeSelf: true,
  getId: true,
  clearReferences: true,
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
        const children = ProxyBranch.onGetChildren(target, state, createChildProxy);
        return function () { return this; }.bind(children);
      }
      if (typeof k ==='symbol') {
        return k;
      }
      k += ''; // find single child
      if (Branch.valueCanBeBranch(state[k])) {
        return Reflect.apply(createChildProxy, target, [ target[dispatcher], target[identity][k] || target[identity][push](k), ]);
      }
    }
    Branch.onAccessingRemovedBranch(target[identity].getId(), k);
  },
};

export default class ProxyBranch extends Branch {

  setState(value) {
    this[dispatcher].dispatch(super.setState(value));
    return this;
  }

  get state() {
    const identifier = this[identity][resolve]();
    if (identifier) {
      return this[dispatcher].dispatch({ type: GET_STATE, [SUBJECT]: identifier, });
    }
    return Branch.onAccessingRemovedBranch(this.getId(), 'state');
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

  _createChildProxy(dispatcher, childIdentity) {
    const child = new ProxyBranch(childIdentity, dispatcher);
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
}