const { keys, values, } = Object;
export const SET_STATE = 'SET_STATE';
export const CLEAR_STATE = 'CLEAR_STATE';
export const REMOVE = 'REMOVE';

const { getPrototypeOf, } = Object;
const leafs= {
  Number: true,
  String: true,
  RegExp: true,
  Boolean: true,
};

export default class SubStore {

  static lastChange;
  static _maxDepth = 100;
  __substore_id__;
  __substore_identity__;
  state;
  prevState = {};
  __substore_parent__;

  constructor(initialValue, key, parent, depth, _shape) {
    if (depth>SubStore._maxDepth) { SubStore.__kill(); }
    this._shape= _shape;
    this._depth = depth;
    this.__substore_id__ = key;
    this.__substore_parent__ = parent;
    this.__substore_identity__ = [ ...parent.__substore_identity__, key, ];
    if (SubStore.couldHaveSubStores(initialValue)) {
      for (const k in initialValue) {
        initialValue[k] = this._createSubStore(initialValue[k], k, this, depth + 1, _shape).state;
      }
    }
    this.state = initialValue;
  }

  singleUpdate(callBack) {
    const { __substore_parent__, state, __substore_identity__, } = this;
    this.__substore_parent__ = { _notifyUp() {}, };
    callBack(this);
    this.__substore_parent__ = __substore_parent__;
    if (this.state!==state) {
      SubStore.lastChange = { func: CLEAR_STATE, target: __substore_identity__, param: this.state, };
      this.__substore_parent__._notifyUp(this);
    }
    return this;
  }

  getParent() {
    return this.__substore_parent__;
  }

  getId() {
    return this.__substore_id__;
  }

  getIdentity() {
    return this.__substore_identity__;
  }

  setState(value) {
    if (value instanceof SubStore) {
      throw new Error('SubStore does not take other SubStores as setState parameters. Got:', `${value}. Identity:`, JSON.stringify(this.__substore_identity__));
    } else if (!this.__substore_parent__) {
      throw new Error('detached SubStore action: setState', JSON.stringify(this.__substore_identity__));
    }
    const { state: prevState, __substore_parent__, } = this;
    if (SubStore.couldHaveSubStores(value) && SubStore.couldHaveSubStores(prevState) && !(value instanceof Array || prevState instanceof Array)) {
      this._merge(value, prevState);
    } else {
      this._reset(value, prevState);
    }
    this.prevState = prevState;
    SubStore.lastChange = { func: SET_STATE, target: this.__substore_identity__, param: value, };
    __substore_parent__._notifyUp(this);
    return this;
  }

  clearState(value) {
    if (!this.__substore_parent__) {
      throw new Error('detached SubStore action: clearState', JSON.stringify(this.__substore_identity__));
    } else if (value instanceof SubStore) {
      throw new Error('SubStore does not take other SubStores as resetState parameters. Got:', `${value}. Identity:`, JSON.stringify(this.__substore_identity__));
    }
    const prevState = this.state;
    this._reset(value, prevState);
    SubStore.lastChange = { func: CLEAR_STATE, target: this.__substore_identity__, param: value, };
    this.__substore_parent__._notifyUp(this);
    return this;
  }

  remove(...ids) {
    if (!this.__substore_parent__) {
      throw new Error('detached SubStore action: remove', JSON.stringify(this.__substore_identity__));
    }
    const { state, } = this;
    if (ids.length) {
      this.prevState = state;
      if (!(SubStore.couldHaveSubStores(state))) {
        throw new Error('Remove error:', `${JSON.stringify(this.__substore_identity__)}. Has no children, was given,${JSON.stringify(ids)} when state: ${state}`);
      }
      let nextState;
      if (state instanceof Array) {
        nextState = this._removeFromArrayState(ids);
      } else {
        nextState = this._removeFromObjectState(ids);
      }
      this.state = nextState;
      SubStore.lastChange = { func: REMOVE, target: this.__substore_identity__, param: ids, };
      this.__substore_parent__._notifyUp(this);
    } else {
      this.__substore_parent__.remove(this.__substore_id__);
    }
    return this;
  }

  _removeFromArrayState(ids) {
    const set = ids.reduce(function (acc, i) { acc[i] = true; return acc; }, {});
    return this.state.reduce((acc, next, i) => {
      const { length, } = acc;
      if (!set[i]) {
        if (i !== length) {
          const target = this[i];
          this[length] = target;
          delete this[i];
          target.__substore_id__ = length;
        }
        acc.push(next);
      } else {
        delete this[i].__substore_parent__;
        delete this[i].state;
        delete this[i].prevState;
        delete this[i];
      }
      return acc;
    }, []);
  }

  _removeFromObjectState(ids) {
    const nextState = { ...this.state, };
    for (const id of ids) {
      if (this[id] && this[id] instanceof SubStore) {
        delete nextState[id];
        delete this[id].__substore_parent__;
        delete this[id];
      } else {
        throw new Error('Remove error:',
          JSON.stringify(this.__substore_identity__),
          `Has no such child as ${id} when state: ${JSON.stringify(this.state, null, 1)}`);
      }
    }
    return nextState;
  }

  _merge(obj, prevState) {
    const nextState = { ...prevState, ...obj, };
    for (const k in nextState) {
      const child = this[k];
      if (child) {
        if (obj.hasOwnProperty(k) && obj[k]!==prevState[k]) {
          nextState[k] = child._reset(obj[k], prevState[k]).state;
        }
      } else {
        nextState[k] = this._createSubStore(obj[k], k, this, this._depth + 1, this._shape).state;
      }
    }
    this.state = nextState;
    return this;
  }

  _reset(nextState, prevState) {
    this.prevState = prevState;
    if (SubStore.couldHaveSubStores(nextState)) {
      const { _shape, _depth, } = this;
      if (SubStore.couldHaveSubStores(prevState)) {
        const merge = { ...prevState, ...nextState, };
        for (const k in merge) {
          if (this[k]) {
            if (nextState.hasOwnProperty(k)) {
              if (nextState[k] !== prevState[k]) {
                nextState[k] = this[k]._reset(nextState[k], prevState[k]).state;
              }
            } else {
              delete this[k].__substore_parent__;
              delete this[k];
            }
          } else {
            nextState[k] = this._createSubStore(nextState[k], k, this, _depth + 1, _shape).state;
          }
        }
      } else {
        for (const k in nextState) {
          nextState[k] = this._createSubStore(nextState[k], k, this, _depth + 1, _shape).state;
        }
      }
    } else if (SubStore.couldHaveSubStores(prevState)) {
      for (const k in prevState) {
        delete this[k].__substore_parent__;
        delete this[k];
      }
    }
    this.state = nextState instanceof Array ? values(nextState) : nextState;
    return this;
  }

  _notifyUp(child) {
    const { __substore_id__, state, } = child;
    const prevState = this.state;
    if (prevState instanceof Array) {
      this.state = [ ...prevState.slice(0, __substore_id__), state, ...prevState.slice(Number(__substore_id__)+1, prevState.length), ];
    } else {
      this.state = { ...prevState, [__substore_id__]: state, };
    }
    this.prevState = prevState;
    if (this.__substore_parent__) {
      this.__substore_parent__._notifyUp(this);
    } else {
      throw new Error('Detached Child SubStore cannot be modified:', JSON.stringify(this.__substore_identity__));
    }
  }

  getChildrenRecursively() {
    return this.getChildren()
      .reduce(function (acc, child) {
        return [ ...acc, child, ...child.getChildrenRecursively(), ];
      }, []);
  }

  getChildren() {
    return SubStore.couldHaveSubStores(this.state)
      ? keys(this.state)
      .map(k => this[k])
      : [];
  }

  _createSubStore(initialState, key, parent, depth) {
    return this[key] = new SubStore(initialState, key, parent, depth);
  }

  static __kill() { /* redefined by StoreCreator*/ }

  static couldHaveSubStores(value) {
    return value && value instanceof Object && !leafs[getPrototypeOf(value).constructor.name];
  }
}