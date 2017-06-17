import SubStore, { couldHaveChildren, } from './SubStore';
import { spec, none, bool, number, string, object, array, anyLeaf, any, regex, } from './createStore';

const { entries, } = Object;
export default class DevSubStore extends SubStore {

  constructor(initialValue, key, parent, depth, _shape) {
    super(initialValue, key, parent, depth, _shape);
    const deviation = this._checkSpecTypeDeviation(_shape[spec].type);
    if (deviation) {
      DevSubStore.onValidationError(deviation);
    }
    DevSubStore.ensureRequiredFields(this);
  }

  remove(...ids) {
    super.remove(...ids);
    if (this.state instanceof Array) {
      console.warn('Remove should not be called to array state. Avoid using arrays all together');
    }
    const deviation = this._checkSpecTypeDeviation(this._shape[spec].type);
    if (deviation) {
      DevSubStore.onValidationError(deviation);
    }
    DevSubStore.ensureRequiredFields(this);
    return this;
  }

  _createSubStore(initialState, key, parent, depth, shape = {}) {
    const subShape = shape[key] || shape[any];
    if (subShape) {
      this[key] = new DevSubStore(initialState, key, parent, depth, subShape);
    } else {
      this[key] = new SubStore(initialState, key, parent, depth, subShape);
      if (shape[spec].exclusive) {
        DevSubStore.onExclusiveViolation(key, this, shape, initialState);
      }
    }
  }

  _merge(obj, prevState) {
    super._merge(obj, prevState);
    const deviation = this._checkSpecTypeDeviation(this._shape[spec].type);
    if (deviation) {
      DevSubStore.onValidationError(deviation);
    }
    DevSubStore.ensureRequiredFields(this);
    return this;
  }

  _reset(nextState, prevState) {
    if (!(prevState instanceof Array) && couldHaveChildren(nextState) && nextState instanceof Array) {
      console.warn('reset transforming state from object into array. Try avoid using arrays all together');
    } else if (prevState instanceof Array && couldHaveChildren(nextState) && !(nextState instanceof Array)) {
      console.warn('reset transforming state from array to object. Try avoid using arrays all together');
    }
    super._reset(nextState, prevState);
    const deviation = this._checkSpecTypeDeviation(this._shape[spec].type);
    if (deviation) {
      DevSubStore.onValidationError(deviation);
    }
    DevSubStore.ensureRequiredFields(this);
    return this;
  }

  _checkSpecTypeDeviation(type) {
    let deviation;
    const { state, _identity: identity, _shape, } = this;
    const { isRequired, } = _shape;
    switch (type) {
      case none: {
        const actualType = DevSubStore.getSpecificType(state);
        if (actualType!=='null' && actualType !=='undefined') {
          deviation = { type, actualType, state, identity, isRequired, };
        }
        break;
      }
      case regex:
      case bool:
      case number:
      case string: {
        deviation = DevSubStore.validateLeaf(this, type);
        break;
      } case anyLeaf:
        deviation = DevSubStore.validateAnyPrimitive(this, type);
        break;
      case object: {
        deviation = DevSubStore.validateObjectType(this, 'object');
        break;
      } case array: {
        deviation = DevSubStore.validateObjectType(this, 'array');
        break;
      } default: {
        if (type instanceof Array) {
          const someDoesNotDeviate = type.some(type => !this._checkSpecTypeDeviation(type));
          if (!someDoesNotDeviate) {
            const actualType = DevSubStore.getSpecificType(state);
            deviation = { type, actualType, state, identity, isRequired, };
          }
        } else {
          DevSubStore.onInvalidSpecType(this);
        }
      }
    }
    return deviation;
  }

  static getSpecificType(state) {
    const type = typeof state;
    if (state instanceof Object) {
      if (type === 'function') {
        return 'function';
      } else if (state instanceof Array) {
        return 'array';
      } else if (state instanceof RegExp) {
        return 'regex';
      }
      return 'object';
    }
    if (state === null) {
      return 'null';
    }
    return type;
  }

  static validateLeaf(target, type) {
    const { state, _shape, _identity: identity, } = target;
    const { isRequired, } = _shape[spec];
    const actualType = DevSubStore.getSpecificType(state);
    if (type!==actualType) {
      if (isRequired) {
        return { type, actualType, isRequired, state, identity, };
      } else if (actualType !== 'null' && actualType !== 'undefined') {
        return { type, actualType, isRequired, state, identity, };
      }
    }
    return false;
  }

  static validateAnyPrimitive(target) {
    const { state, _shape, _identity: identity, } = target;
    const { isRequired, } = _shape;
    const actualType = DevSubStore.getSpecificType(state);
    if (isRequired && (actualType==='undefined' || actualType==='null')) {
      return { anyLeaf, actualType, isRequired, state, identity, };
    } else if (couldHaveChildren(state)) {
      return { anyLeaf, actualType, isRequired, state, identity, };
    }
    return false;
  }

  static validateObjectType(target, expected) {
    const { state, _shape, _identity: identity, } = target;
    const { type, isRequired, } = _shape;
    const actualType = DevSubStore.getSpecificType(state);
    if (actualType !== expected && (isRequired || (actualType !=='null'&& actualType!=='undefined'))) {
      return { type, actualType, state, identity, };
    }
    return false;
  }

  static ensureRequiredFields(target) {
    const { _shape, _identity: identity, } = target;
    const { [spec]: s, [any]: a, ...rest } = _shape;
    const missingRequiredFields = entries(rest).filter(([ k, v, ]) => v[spec].isRequired)
      .filter(([ k, ]) => !target[k])
      .map(([ k, ]) => k);
    if (missingRequiredFields.length) {
      DevSubStore.onMissingRequiredFields({ identity, missingRequiredFields, });
    }
  }

  static onExclusiveViolation(key, target, shape, value) {
    const { [spec]: _, ...rest } = shape;
    DevSubStore.onValidationError('Exclusive validation failed: '+JSON.stringify(target._identity)+'\n'+
      'Has no validation for key: ' + key + '\n' +
      'With value: '+JSON.stringify(value, null, 1)+'\n'+
      'Expected '+ entries(rest).map(([ k, v, ]) => {
        const { type, } = v[spec];
        return k + ': ' + JSON.stringify(type);
      }).join(', '));
  }

  static onValidationError({ type, actualType, state, identity, isRequired, }) {
    console.error(`Validations failed\nisRequired: ${!!isRequired}\nExpected type ${JSON.stringify(type)}\nBut got ${actualType}\nTarget: ${JSON.stringify(identity)}\nState: ${JSON.stringify(state, null, 1)}`);
  }

  static onMissingRequiredFields({ identity, missingRequiredFields, }) {
    console.error(`Validation failed\nMissing fields: ${JSON.stringify(missingRequiredFields)}\nTarget ${JSON.stringify(identity)}`);
  }

  static onInvalidSpecType(target) {
    console.error(`invalid spec type '${JSON.stringify(target._shape[spec].type)}\nTarget ${JSON.stringify(target._identity)}`);
  }
}