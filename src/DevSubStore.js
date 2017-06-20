import SubStore from './SubStore';
import { spec, bool, number, string, object, array, anyLeaf, any, regex, symbol, func, } from './shape';

const { entries, } = Object;
export default class DevSubStore extends SubStore {

  static verbose = true;

  constructor(initialValue, key, parent, depth, _shape) {
    super(initialValue, key, parent, depth, _shape);
    DevSubStore.afterChanged(this);
  }

  remove(...ids) {
    super.remove(...ids);
    DevSubStore.afterChanged(this);
    return this;
  }

  _createSubStore(initialState, key, parent, depth, shape = {}) {
    const subShape = shape[key] || shape[any];
    if (subShape) {
      this[key] = new DevSubStore(initialState, key, parent, depth, subShape);
    } else {
      this[key] = new SubStore(initialState, key, parent, depth, subShape);
      if (shape[spec].exclusive) {
        DevSubStore.onExclusiveViolation({ key, target: this, shape, value: initialState, });
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
      if (!(prevState instanceof Array) && SubStore.couldHaveSubStores(nextState)) {
        console.warn('transforming state of '+JSON.stringify(this.__substore_identity__)+' from object into array');
      }
    } else if (prevState instanceof Array && SubStore.couldHaveSubStores(nextState)) {
      console.warn('transforming state of '+JSON.stringify(this.__substore_identity__)+' from array to object');
    }
    super._reset(nextState, prevState);
    DevSubStore.afterChanged(this);
    return this;
  }

  static afterChanged(target) {
    const deviation = DevSubStore.checkSpecTypeDeviation(target);
    if (deviation) {
      DevSubStore.onValidationError(deviation);
    }
    DevSubStore.ensureRequiredFields(target);
  }

  static checkSpecTypeDeviation(target) {
    const { type, } = target._shape[spec];
    switch (type) {
      case string:
      case number:
      case bool:
      case symbol:
        return DevSubStore.validateLeaf(target, type);
      case object:
        return DevSubStore.validateObjectType(target, 'object');
      case array:
        return DevSubStore.validateObjectType(target, 'array');
      case anyLeaf:
        return DevSubStore.validateAnyLeaf(target);
      case regex:
        return DevSubStore.validateObjectType(target, 'regex');
      case func:
        return DevSubStore.validateObjectType(target, 'func');
      default:
        DevSubStore.onInvalidSpecType(target);
        return;
    }
  }

  static getSpecificType(state) {
    const type = typeof state;
    if (state instanceof Object) {
      if (type === 'function') {
        return func;
      } else if (state instanceof Array) {
        return array;
      } else if (state instanceof RegExp) {
        return regex;
      }
      return object;
    }
    if (state === null) {
      return 'null';
    }
    return type;
  }

  static validateLeaf(target, type) {
    const { state, _shape, __substore_identity__: identity, } = target;
    const { isRequired, } = _shape[spec];
    const actualType = DevSubStore.getSpecificType(state);
    if (type!==actualType) {
      if (isRequired) {
        return { expectedType: type, actualType, isRequired, state, identity, };
      } else if (actualType !== 'null' && actualType !== 'undefined') {
        return { expectedType: type, actualType, isRequired, state, identity, };
      }
    }
    return false;
  }

  static validateAnyLeaf(target) {
    const { state, _shape, __substore_identity__: identity, } = target;
    const { isRequired, type, } = _shape[spec];
    const actualType = DevSubStore.getSpecificType(state);
    if (isRequired && (actualType==='undefined' || actualType==='null')) {
      return { expectedType: type, actualType, isRequired, state, identity, };
    } else if (SubStore.couldHaveSubStores(state)) {
      return { expectedType: type, actualType, isRequired, state, identity, };
    }
    return false;
  }

  static validateObjectType(target, expected) {
    const { state, _shape, __substore_identity__: identity, } = target;
    const { type, isRequired, } = _shape[spec];
    const actualType = DevSubStore.getSpecificType(state);
    if (actualType !== expected && (isRequired || (actualType !=='null'&& actualType!=='undefined'))) {
      return { expectedType: type, actualType, state, identity, isRequired, };
    }
    return false;
  }

  static ensureRequiredFields(target) {
    const { _shape, __substore_identity__: identity, } = target;
    const { [spec]: ignore, [any]: ignore2, ...rest } = _shape;
    const missingRequiredFields = entries(rest).filter(([ _, v, ]) => v[spec].isRequired)
      .filter(([ k, ]) => !target[k])
      .map(([ k, ]) => k);
    if (missingRequiredFields.length) {
      DevSubStore.onMissingRequiredFields({ identity, missingRequiredFields, });
    }
  }

  static onExclusiveViolation({ key, target, shape, value, }) {
    const { [spec]: _, ...rest } = shape;
    console.error('Exclusive validation failed: '+JSON.stringify(target.getIdentity())+'\n'+
      'Has no validation for key: ' + key + '\n' +
      'With value: '+JSON.stringify(value, null, 1)+'\n'+
      'Expected '+ entries(rest).map(([ k, v, ]) => {
        const { type, } = v[spec];
        return k + ': ' + JSON.stringify(type);
      }).join(', '));
  }

  static onValidationError({ expectedType, actualType, state, identity, isRequired, }) {
    console.error(`Validations failed\nExpected type ${expectedType}\nBut got ${actualType}\nisRequired: ${!!isRequired}\nTarget: ${JSON.stringify(identity)}\nState: ${JSON.stringify(state, null, 1)}`);
  }

  static onMissingRequiredFields({ identity, missingRequiredFields, }) {
    console.error(`Validation failed\nMissing fields: ${JSON.stringify(missingRequiredFields)}\nTarget ${JSON.stringify(identity)}`);
  }

  static onInvalidSpecType(target) {
    console.error(`invalid spec type '${JSON.stringify(target._shape[spec].type)}\nTarget ${JSON.stringify(target.get)}`);
  }
}