import Branch from './Branch';
import { branchPrivates, knotTree, TARGET, REMOVE, GET_STATE, PARAM, PUBLISH_NOW, } from '../common';

const { identity, dispatcher, actual, } = branchPrivates;
const { createChild, resolve, } = knotTree;

export const proxy = Symbol('proxy');
const { keys, } = Object;

const stateBranchMethods = {
  setState: true,
  clearState: true,
  remove: true,
  transaction: true,
  getIdentity: true,
  getId: true,
  removeSelf: true,
  getChildren: true,
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

  removeSelf() {
    const identity = this.getIdentity();
    if (!identity) {
      throw new Error('Cannot call removeSelf to removed Node. Id:'+this.getId());
    }
    const [ _, ...parentIdentity ]= identity;
    this[dispatcher].dispatch({ type: REMOVE, [TARGET]: parentIdentity, [PARAM]: [ this.getId(), ], [PUBLISH_NOW]: !this[dispatcher].onGoingTransaction, });
  }

  _createChild(k, childRole = this[identity][createChild](k)) {
    const child = new ProxyBranch(childRole, this[dispatcher]);
    return child._createProxy();
  }

  getChildren() {
    const state = this[proxy].state;
    return keys(state).filter(k => Branch.couldBeParent(state[k])).map(k => this[proxy][k]);
  }

  _getChildrenRecursively() {
    return this.getChildren().reduce(Branch._onReduceChildren, []);
  }

  _createProxy() {
    this[proxy] = new Proxy(this,
      {
        get(target, k) {
          if (typeof k ==='symbol') {
            if (k === actual) {
              return target;
            }
            return k;
          } else if (stateBranchMethods[k]) {
            return target[k].bind(target);
          } else if (k==='state') {
            const resolved = target[identity][resolve]();
            if (resolved) {
              return target[dispatcher].dispatch({ type: GET_STATE, [TARGET]: resolved, });
            }
            return Branch.onAccessingRemovedNode(target[identity].getId(), 'state');
          }
          k +='';
          const resolved = target[identity][resolve]();
          if (resolved) {
            const state = target[dispatcher].dispatch({ type: GET_STATE, [TARGET]: resolved, });
            if (Branch.couldBeParent(state[k])) {
              return target._createChild(k, target[identity][k]);
            }
          }
          return undefined;
        },
      });
    return this[proxy];
  }

  _returnSelf(){
    return this[proxy];
  }
}