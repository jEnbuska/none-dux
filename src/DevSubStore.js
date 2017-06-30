import SubStore from './SubStore';
import { strict, isRequired, type, leaf, many, } from '../src/shape/shapeTypes';

const { getPrototypeOf, keys, entries, } = Object;

const naturalLeafTypes = {
  Number: true, RegExp: true, Boolean: true, Function: true, Date: true, Error: true, String: true, Symbol: true,
};
const checkers = {
  string: { check: (val) => val === '' || (val && getPrototypeOf(val).constructor.name === 'String'), name: 'string', },
  Number: { check: (val) => val === 0 || (val && getPrototypeOf(val).constructor.name === 'Number'), name: 'number', },
  Boolean: { check: (val) => val===false || (val && getPrototypeOf(val).constructor.name === 'Boolean'), name: 'bool', },
  RegExp: { check: (val) => val && getPrototypeOf(val).constructor.name === 'RegExp', name: 'regex', },
  Symbol: { check: (val) => val && getPrototypeOf(val).constructor.name === 'Symbol', name: 'symbol', },
  Function: { check: (val) => val && getPrototypeOf(val).constructor.name === 'Function', name: 'func', },
  Date: { check: (val) => val && getPrototypeOf(val).constructor.name === 'Date', name: 'date', },
  strict: { check: (state, shape) => keys(state).every(key => shape[key]), name: 'strict', },
  Object: { check: (val) => {
    if (val) {
      const { name, } = getPrototypeOf(val).constructor;
      return name === 'Object' || (name !== 'Array' && name !== 'SubStoreArrayLeaf' && !naturalLeafTypes[name]);
    }
    return false;
  }, name: 'object', },
  Array: { check: (val) => {
    if (val) {
      const { name, } = getPrototypeOf(val).constructor;
      return name === 'Array' || name === 'SubStoreArrayLeaf';
    }
    return false;
  }, name: 'array', },
  none: { check: (val) => val === null || val === undefined, name: 'null or undefined', },
};

export default class DevSubStore extends SubStore {

  static verbose = true;

  constructor(initialValue, key, parent, depth, __substore_shape__) {
    super(initialValue, key, parent, depth, __substore_shape__);
    DevSubStore.afterChanged(this);
  }

  remove(...ids) {
    super.remove(...ids);
    DevSubStore.afterChanged(this);
    return this;
  }

  _createSubStore(initialState, key, parent) {
    const { __substore_depth__: depth, __substore_shape__: shape = {}, } = this;
    const subShape = shape[key] || shape[many];
    if (subShape) {
      this[key] = new DevSubStore(initialState, key, parent, depth + 1, subShape);
    } else {
      this[key] = new SubStore(initialState, key, parent, depth + 1, subShape);
      if (shape[strict]) {
        DevSubStore.onExclusiveViolation({ key, target: this, shape, value: this[key].state, });
      }
    }
    return this[key];
  }

  _merge(obj, prevState) {
    super._merge(obj, prevState);
    DevSubStore.afterChanged(this);
    return this;
  }

  _reset(nextState, prevState) {
    if (nextState instanceof Array) {
      if (DevSubStore.verbose) {
        console.warn('Arrays in state can be behave unintuitively, consider using objects instead');
        DevSubStore.verbose=false;
      }
      if (!(prevState instanceof Array) && SubStore.couldBeParent(nextState)) {
        console.warn('transforming state of '+JSON.stringify(this.__substore_identity__)+' from object into array');
      }
    } else if (prevState instanceof Array && SubStore.couldBeParent(nextState)) {
      console.warn('transforming state of '+JSON.stringify(this.__substore_identity__)+' from array to object');
    }
    super._reset(nextState, prevState);
    DevSubStore.afterChanged(this);
    return this;
  }

  static afterChanged(target) {
    const { state, __substore_shape__: shape, __substore_identity__, prevState, } = target;
    const { [strict]: s, [type]: t, [isRequired]: r, [leaf]: l, } = shape;
    if (s) {
      entries(state)
          .filter(([ k, ]) => !shape[k])
          .filter(([ k, ]) => !prevState || state[k] !== prevState[k])
          .forEach(([ key, value, ]) => DevSubStore.onExclusiveViolation({ key, value, target, shape, }));
    }
    if (!checkers[t].check(state) && (r || (!r && !checkers.none(state)))) {
      DevSubStore.onValidationError({
        state,
        expected: t,
        actual: DevSubStore.getSpecificType(state),
        identity: [ ...__substore_identity__, ],
        isRequired: r,
        strict: s,
      });
      entries(state)
        .filter(([ _, v, ]) => !SubStore.couldBeParent(v))
        .filter(([ k, ]) => !prevState || state[k]!==prevState[k])
        .filter(([ k, ]) => shape[k])
        .filter(([ k, v, ]) => !checkers[shape[k].type].check(v))
        .forEach(([ key, state, ]) => {
          DevSubStore.onValidationError({
            state,
            expected: t,
            actual: DevSubStore.getSpecificType(state),
            identity: [ ...__substore_identity__, key, ],
            isRequired: r,
            strict: s,
          });
        });
    }
    DevSubStore.ensureRequiredFields(target);
  }

  static getSpecificType(state) {
    const type = typeof state;
    if (state instanceof Object) {
      if (type === 'function') {
        return 'Function';
      } else if (state instanceof Array) {
        return 'Array';
      } else if (state instanceof RegExp) {
        return 'RegExp';
      } else if (state instanceof Date) {
        return 'Date';
      }
      return 'Object';
    }
    if (state === null) {
      return 'null';
    } else if (type === 'boolean') {
      return 'Boolean';
    }
    const [ first, ...rest ] = type;
    return first.toUpperCase() + String(rest);
  }

  static ensureRequiredFields(target) {
    const { __substore_shape__, __substore_identity__: identity, state, prevState, } = target;
    const { [isRequired]: _0, [many]: _1, [strict]: _2, [type]: _3, [leaf]: _4, ...children } = __substore_shape__;
    const missingRequiredFields = entries(children)
      .filter(([ k, v, ]) => !prevState || state[k]!==prevState[k])
      .filter(([ _, v, ]) => v[isRequired])
      .filter(([ k, ]) => !state.hasOwnProperty(k))
      .map(([ k, ]) => k);
    if (missingRequiredFields.length) {
      DevSubStore.onMissingRequiredFields({ identity, missingRequiredFields, });
    }
  }

  static onExclusiveViolation({ key, target, shape, value, }) {
    const { [isRequired]: _0, [many]: _1, [strict]: _2, [type]: _3, [leaf]: _4, ...children } = shape;
    console.error('Exclusive validation failed: '+JSON.stringify(target.getIdentity())+'\n'+
      'Has no validation for key: ' + key + '\n' +
      'With value: '+JSON.stringify(value, null, 1)+'\n'+
      'Expected\n'+ entries(children).map(([ k, v, ]) => {
        return k + ': ' + v.type;
      }).join('\n'));
  }

  static onValidationError({ expected, actual, state, identity, isRequired, }) {
    console.error(`Validations failed\nExpected type ${JSON.stringify(expected, null, 1)}\nBut got ${actual}\nisRequired: ${!!isRequired}\nTarget: ${JSON.stringify(identity)}\nState: ${JSON.stringify(state, null, 1)}`);
  }

  static onMissingRequiredFields({ identity, missingRequiredFields, }) {
    console.error(`Validation failed\nMissing fields: ${JSON.stringify(missingRequiredFields)}\nTarget ${JSON.stringify(identity)}`);
  }

  static onInvalidSpecType(target) {
    console.error(`invalid spec type '${JSON.stringify(target.__substore_shape__[spec].type)}\nTarget ${JSON.stringify(target.get)}`);
  }
}