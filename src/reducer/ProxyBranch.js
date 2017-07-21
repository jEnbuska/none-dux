import Branch from './Branch';
import { branchPrivates, knotTree, TARGET, GET_STATE, invalidParents, } from '../common';

const { identity, dispatcher, targetBranch, } = branchPrivates;
const { push, resolve, } = knotTree;

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

const wMap = new WeakMap();

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
          if (typeof k ==='symbol') {
            if (k === targetBranch) {
              return target;
            }
            return k;
          } else if (k==='state') {
            const resolved = target[identity][resolve]();
            if (resolved) {
              return target[dispatcher].dispatch({ type: GET_STATE, [TARGET]: resolved, });
            }
            return Branch.onAccessingRemovedNode(target[identity].getId(), 'state');
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
                  let child;
                  if (target[identity][k] && (child = wMap.get(target[identity][k]))) {
                    children[k] = child;
                  } else {
                    children[k] = target._createChild(k, target[identity][k]);
                  }
                }
              }
              return target[k].bind(undefined, children);
            }
            Branch.onAccessingRemovedNode(target[identity].getId(), 'getState');
            return target[k].bind(undefined, undefined);
          }
          k +='';
          const resolved = target[identity][resolve]();
          if (resolved) {
            const v = target[dispatcher].dispatch({ type: GET_STATE, [TARGET]: resolved, })[k];
            if (v && !invalidParents[getPrototypeOf(v).constructor.name]) {
              const id = target[identity][k];
              if (target[identity][k] && wMap.has(id)) {
                return wMap.get(id);
              }
              return target._createChild(k, id);
            }
          }
          return undefined;
        },
      });
    wMap.set(this[identity], this[proxy]);
    return this[proxy];
  }

  _returnSelf() {
    return this[proxy];
  }
}