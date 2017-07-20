import { stateMapperPrivates, knotTree, TARGET, SET_STATE, CLEAR_STATE, REMOVE, GET_STATE, PARAM, PUBLISH_CHANGES, PUBLISH_NOW, ROLLBACK, invalidParents, has, } from '../common';

const { propState, propPrevState, pendingState, onSetState, onClearState, onRemove, role, depth, dispatcher, onRemoveChild, children, handleChange, createProxy } = stateMapperPrivates;
const { createChild, removeChild, resolveIdentity, } = knotTree;
const onRemoveFromArray = Symbol('onRemoveFromArray');
const onRemoveFromObject = Symbol('onRemoveFromObject');
const { entries } = Object;

export default class ProxyStateMapper {

  static __kill(target) {
    console.trace();
    throw new Error('StateMapper maximum depth '+ProxyStateMapper.maxDepth+' exceeded by "'+target[role][resolveIdentity].join(', ')+'"');
  }

  static maxDepth = 45;

  constructor(_depth, _role, _dispatcher) {
    this[role] = _role;
    if (_depth>ProxyStateMapper.maxDepth) { ProxyStateMapper.__kill(this); }
    this[depth] = _depth;
    this[dispatcher] = _dispatcher;
  }

  transaction(callBack) {
    const publishAfterDone = !this[dispatcher].onGoingTransaction;
    const stateBefore = this[dispatcher].dispatch({ type: GET_STATE, [TARGET]: [], });
    try {
      this[dispatcher].onGoingTransaction = true;
      callBack(this);
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
    console.log(this[role]);
    return this[role][resolveIdentity]();
  }

  setState(value) {
    const identity = this.getIdentity();
    if (!identity) {
      throw new Error('Cannot call setState to removed Node. Got:', `${value}. Id: "${this.getId()}"`);
    }
    this[dispatcher].dispatch({ type: SET_STATE, [TARGET]: identity, [PARAM]: value, [PUBLISH_NOW]: !this[dispatcher].onGoingTransaction, });
    return this;
  }

  clearState(value) {
    const identity = this.getIdentity();
    if (!identity) {
      throw new Error('Cannot call clearState to removed Node. Got:', `${value}. Id: "${this.getId()}"`);
    }
    this[dispatcher].dispatch({ type: CLEAR_STATE, [TARGET]: identity, [PARAM]: value, [PUBLISH_NOW]: !this[dispatcher].onGoingTransaction, });
    return this;
  }

  remove(...keys) {
    const identity = this.getIdentity();
    if (!identity) {
      throw new Error('Cannot call remove to removed Node. Got:', `${keys}. Id: "${this.getId()}"`);
    } else if (keys[0] instanceof Array) {
      keys = keys[0];
    }
    this[dispatcher].dispatch({ type: REMOVE, [TARGET]: identity, [PARAM]: keys, [PUBLISH_NOW]: !this[dispatcher].onGoingTransaction, });
    return this;
  }

  removeSelf() {
    const identity = this.getIdentity();
    if (!identity) {
      throw new Error('Cannot call removeSelf to removed Node. Id:'+this.getId());
    }
    const [ _, ...parentIdentity ]= identity;
    this[dispatcher].dispatch({ type: REMOVE, [TARGET]: parentIdentity, [PARAM]: [ this.getId(), ], [PUBLISH_NOW]: !this[dispatcher].onGoingTransaction, });
    return this;
  }

  [onSetState](newState, prevState) {
    this[handleChange](newState, prevState, newState);
    return { ...prevState, ...newState, };
  }

  [onClearState](newState, prevState) {
    this[handleChange](newState, prevState);
  }

  [onRemove](keys = [], state) {
    if (state instanceof Array) {
      return this[onRemoveFromArray](keys, state);
    }
    return this[onRemoveFromObject](keys, state);
  }

  [onRemoveChild](k) {
    this[role][removeChild](k);
  }

  _createChild(k, childRole = this[role][createChild](k)) {
    console.log('create child '+k);
    console.log(childRole[resolveIdentity]());
    const child = new ProxyStateMapper(this[depth] + 1, childRole, this[dispatcher]);
    return child[createProxy]();
  }

  [createProxy]() {
    return new Proxy(this,
      {
        get(target, key) {
          switch (key) {
            case 'setState':
            case 'clearState':
            case 'remove':
            case 'getIdentity':
            case 'getId':
              return target[key].bind(target);
            case 'state': {
              const identity = target[role][resolveIdentity]();
              if (identity) {
                return target[dispatcher].dispatch({ type: GET_STATE, [TARGET]: identity, });
              }
              return undefined;
            }
            default: {
              const identity = target[role][resolveIdentity]();
              if (identity) {
                const state = target[dispatcher].dispatch({ type: GET_STATE, [TARGET]: identity, });
                if (state && has.call(state, key)) {
                  return target._createChild(key);
                }
              }
            }
          }
          return undefined;
        },
        apply(target, that, args) {
          console.log('apply');
          console.log(target);
          console.log(that);
          console.log(args);
        }
      });
  }

  static onAccessingRemovedNode(id, property) {
    console.error('Accessing '+property+' of remove node '+id+' will always return undefined');
  }
}

function poorSet(arr) {
  return arr.reduce(poorSetMapper, {});
}
function poorSetMapper(acc, k) {
  acc[k+''] = true;
  return acc;
}

function onReduceChildren(acc, child) {
  return [ ...acc, child, ...child.getChildrenRecursively(), ];
}