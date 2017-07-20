import StateMapper from './StateMapper';
import { stateMapperPrivates, knotTree, TARGET, SET_STATE, CLEAR_STATE, REMOVE, GET_STATE, PARAM, PUBLISH_CHANGES, PUBLISH_NOW, ROLLBACK, invalidParents, has, } from '../common';

const { role, depth, dispatcher, createProxy, propState, propPrevState, pendingState } = stateMapperPrivates;
const { createChild, resolveIdentity, } = knotTree;

const proxy = Symbol('proxy');
const { keys } = Object;

export default class ProxyStateMapper {

  constructor(_depth, _role, _dispatcher) {
    this[role] = _role;
    this[depth] = _depth;
    this[dispatcher] = _dispatcher;
  }

  transaction(callBack) {
    const publishAfterDone = !this[dispatcher].onGoingTransaction;
    const stateBefore = this[dispatcher].dispatch({ type: GET_STATE, [TARGET]: [], });
    try {
      this[dispatcher].onGoingTransaction = true;
      callBack(this[proxy]);
      if (publishAfterDone) {
        this[dispatcher].dispatch({ type: PUBLISH_CHANGES, });
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

  getId() {
    return this[role].getId();
  }

  getIdentity() {
    return this[role][resolveIdentity]();
  }

  setState(value) {
    const identity = this.getIdentity();
    if (!identity) {
      throw new Error('Cannot call setState to removed Node. Got:', `${value}. Id: "${this.getId()}"`);
    }
    this[dispatcher].dispatch({ type: SET_STATE, [TARGET]: identity, [PARAM]: value, [PUBLISH_NOW]: !this[dispatcher].onGoingTransaction, });
    return this[proxy];
  }

  clearState(value) {
    const identity = this.getIdentity();
    if (!identity) {
      throw new Error('Cannot call clearState to removed Node. Got:', `${value}. Id: "${this.getId()}"`);
    }
    this[dispatcher].dispatch({ type: CLEAR_STATE, [TARGET]: identity, [PARAM]: value, [PUBLISH_NOW]: !this[dispatcher].onGoingTransaction, });
    return this[proxy];
  }

  remove(...keys) {
    const identity = this.getIdentity();
    if (!identity) {
      throw new Error('Cannot call remove to removed Node. Got:', `${keys}. Id: "${this.getId()}"`);
    } else if (keys[0] instanceof Array) {
      keys = keys[0];
    }
    this[dispatcher].dispatch({ type: REMOVE, [TARGET]: identity, [PARAM]: keys, [PUBLISH_NOW]: !this[dispatcher].onGoingTransaction, });
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

  _createChild(k, childRole = this[role][createChild](k)) {
    const child = new ProxyStateMapper(this[depth] + 1, childRole, this[dispatcher]);
    return child._createProxy();
  }

  _getChildren() {
    const state = this[proxy].state;
    return keys(state).filter(k => StateMapper.couldBeParent(state[k])).map(k => this[k] || this.setState({ [k]: state[k] })[k]);
  }

  _getChildrenRecursively() {
    return this[proxy]._getChildren().reduce(StateMapper._onReduceChildren, []);
  }

  _createProxy() {
    this[proxy] = new Proxy(this,
      {
        get(target, k) {
          if (typeof k ==='symbol') {
            switch (k) {
              case propState:
              case propPrevState:
              case pendingState:
                return target[k];
              default:
                return k;
            }
          }
          k +='';
          switch (k) {
            case 'setState':
            case 'clearState':
            case 'remove':
            case 'transaction':
            case 'getIdentity':
            case 'getId':
            case 'removeSelf':
            case '_getChildren':
            case '_getChildrenRecursively':
              return target[k].bind(target);
            case 'state': {
              const identity = target[role][resolveIdentity]();
              if (identity) {
                return target[dispatcher].dispatch({ type: GET_STATE, [TARGET]: identity, });
              }
              return StateMapper.onAccessingRemovedNode(target[role].getId(), 'state');
            }
            default: {
              const identity = target[role][resolveIdentity]();
              if (identity) {
                const state = target[dispatcher].dispatch({ type: GET_STATE, [TARGET]: identity, });
                if (StateMapper.couldBeParent(state[k])) {
                  return target._createChild(k, target[role][k]);
                }
              }
            }
          }
          return undefined;
        },
        apply(target, that, args) { }
      });
    return this[proxy];
  }
}