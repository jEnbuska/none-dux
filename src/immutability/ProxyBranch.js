import Branch from './Branch';
import { branchPrivates, identityPrivates, SUBJECT, GET_STATE, } from '../common';

const { identity, dispatcher, targetBranch, } = branchPrivates;
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
  _returnSelf: true,
  _getChildrenRecursively: true,
};

export default class ProxyBranch extends Branch {

  setState(value) {
    this[dispatcher].dispatch(super.setState(value));
    return this[proxy];
  }

  clearState(value) {
    this[dispatcher].dispatch(super.clearState(value));
    return this[proxy];
  }

  remove(...keys) {
    if (keys[0] instanceof Array) {
      keys = keys[0];
    }
    this[dispatcher].dispatch(super.remove(keys));
    return this[proxy];
  }

  _createChild(k, childRole = this[identity][push](k)) {
    const child = new ProxyBranch(childRole, this[dispatcher]);
    return child._createProxy();
  }

  getChildren(proxyChildren) { // dummy handled by proxy for better performance
    return proxyChildren;
  }

  _getChildrenRecursively() {
    return Object.values(this[proxy].getChildren()).reduce(Branch._onGetChildrenRecursively, []);
  }
  _createProxy() {
    this[proxy] = new Proxy(this,
      {
        get(target, k, receiver) {
          if (branchReflectables[k]) {
            return Reflect.get(target, k, receiver);
          } else if (typeof k === 'symbol') {
            if (k === targetBranch) {
              return target;
            }
            return target[k];
          }
          const resolved = target[identity][resolve]();
          if (resolved) {
            const state = target[dispatcher].dispatch({ type: GET_STATE, [SUBJECT]: resolved, });
            if (k === 'getChildren') {
              return ProxyBranch.onGetChildren(target, state);
            }
            k+=''; // find single child
            if (Branch.valueCanBeBranch(state[k])) {
              return target._createChild(k, target[identity][k]);
            }
          }
          Branch.onAccessingRemovedBranch(target[identity].getId(), k);
        },
      });
    return this[proxy];
  }

  static onGetChildren(target, state) {
    const children = {};
    for (let k in state) {
      k+='';
      const v = state[k];
      if (Branch.valueCanBeBranch(v)) {
        children[k] = target._createChild(k, target[identity][k]);
      }
    }
    return target.getChildren.bind(undefined, children);
  }

  _returnSelf() {
    return this[proxy];
  }
}