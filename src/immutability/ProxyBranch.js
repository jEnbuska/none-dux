import Branch from './Branch';
import { branchPrivates, identityPrivates, SUBJECT, GET_STATE, } from '../common';

const { identity, dispatcher, accessPrevState, accessState, accessPendingState, } = branchPrivates;
const { push, resolve, } = identityPrivates;

export const proxy = Symbol('proxy');

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
const branchSymbols = {
  [identity]: true,
  [dispatcher]: true,
  [accessState]: true,
  [accessPrevState]: true,
  [accessPendingState]: true,
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

  _createChild(dispatcher, childRole) {
    const child = new ProxyBranch(childRole, dispatcher);
    return child._createProxy();
  }

  getChildren() { /* dummy func handled by by*/ }

  _getChildrenRecursively() {
    return Object.values(this.getChildren()).reduce(Branch._onGetChildrenRecursively, []);
  }
  _createProxy() {
    const proxy = new Proxy(this,
      {
        get(target, k, receiver) {
          if (branchSymbols[k]) {
            return target[k];
          } else if (branchReflectables[k]) {
            return Reflect.get(target, k, receiver);
          }
          const resolved = target[identity][resolve]();
          if (resolved) {
            const state = target[dispatcher].dispatch({ type: GET_STATE, [SUBJECT]: resolved, });
            const createChild = Reflect.get(target, '_createChild', receiver);
            if (k === 'getChildren') {
              const children = ProxyBranch.onGetChildren(target, state, createChild);
              return function () { return this; }.bind(children);
            }
            k+=''; // find single child
            if (Branch.valueCanBeBranch(state[k])) {
              return Reflect.apply(createChild, target, [ target[dispatcher], target[identity][k] || target[identity][push](k), ]);
            }
          }
          Branch.onAccessingRemovedBranch(target[identity].getId(), k);
        },
      });
    return proxy;
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