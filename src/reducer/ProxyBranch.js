import Branch from './Branch';
import { branchPrivates, identityPrivates, TARGET, GET_STATE, invalidParents, } from '../common';

const { identity, dispatcher, targetBranch, } = branchPrivates;
const { push, resolve, } = identityPrivates;

const { getPrototypeOf, } = Object;
export const proxy = Symbol('proxy');

const stateBranchMethods = {
  setState: true,
  clearState: true,
  remove: true,
  transaction: true,
  getIdentity: true,
  getId: true,
  _getChildrenRecursively: true,
};

export default class ProxyBranch extends Branch {

  getId() {
    return this[identity].getId();
  }

  getIdentity() {
    return this[identity][resolve]();
  }

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

  getChildren(proxyChildren) {
    return proxyChildren;
  }

  _getChildrenRecursively() {
    return Object.values(this[proxy].getChildren()).reduce(Branch._onGetChildrenRecursively, []);
  }

  _createProxy() {
    this[proxy] = new Proxy(this,
      {
        get(target, k) {

          if (k === 'state') {
            const resolved = target[identity][resolve]();
            if (resolved) {
              return target[dispatcher].dispatch({ type: GET_STATE, [TARGET]: resolved, });
            }
            return Branch.onAccessingRemovedBranch(target[identity].getId(), 'state');
          } else if (stateBranchMethods[k]) {
            return target[k].bind(target);
          } else if (k === 'getChildren') {
            const resolved = target[identity][resolve]();
            if (resolved) {
              const state = target[dispatcher].dispatch({ type: GET_STATE, [TARGET]: resolved, });
              const children = {};
              for (const k in state) {
                const v = state[k];
                if (v && !invalidParents[getPrototypeOf(v).constructor.name]) {
                  if (target[identity][k] && Branch.children.has(target[identity][k])) {
                    children[k] = Branch.children.get(target[identity][k]);
                  } else {
                    children[k] = target._createChild(k, target[identity][k]);
                  }
                }
              }
              return target.getChildren.bind(undefined, children);
            }
            Branch.onAccessingRemovedBranch(target[identity].getId(), 'getState');
            return target.getChildren.bind(undefined, undefined);
          } else if (typeof k === 'symbol') {
            if (k === targetBranch) {
              return target;
            }
            return k;
          }
          k+='';
          const resolved = target[identity][resolve]();
          if (resolved) {
            const v = target[dispatcher].dispatch({ type: GET_STATE, [TARGET]: resolved, })[k];
            if (v && !invalidParents[getPrototypeOf(v).constructor.name]) {
              const id = target[identity][k];
              if (target[identity][k] && Branch.children.has(id)) {
                return Branch.children.get(id);
              }
              return target._createChild(k, id);
            }
          }
        },
      });
    Branch.children.set(this[identity], this[proxy]);
    return this[proxy];
  }

  _returnSelf() {
    return this[proxy];
  }
}