import SubStore from './SubStore';
/*
import { spec, object, array, anyKey, regex, func, date, } from './shape';

const { entries, } = Object;
export default class DevSubStore extends SubStore {

  static verbose = true;

  constructor(initialValue, key, parent, depth, shape, identity) {
    super(initialValue, key, parent, depth, shape, identity);
    DevSubStore.afterChanged(this);
  }

  remove(...ids) {
    super.remove(...ids);
    DevSubStore.afterChanged(this);
    return this;
  }

  _createSubStore(initialState, key, parent) {
    const { __substore_depth__: depth, __substore_shape__: shape = {}, } = this;
    const subShape = shape[key] || shape[anyKey];
    if (subShape) {
      this[key] = new DevSubStore(initialState, key, parent, depth + 1, subShape, [ ...this.__substore_identity__, key, ]);
    } else {
      this[key] = new SubStore(initialState, key, parent, depth + 1, subShape, [ ...this.__substore_identity__, key, ]);
      if (shape[spec].exclusive) {
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
    const { state, __substore_shape__: shape, __substore_identity__, } = target;
    const { exclusive, types, isRequired, } = shape[spec];
    if (exclusive) {
      if (!exclusive.check(state, __substore_identity__)) {
        entries(state)
          .filter(([ k, ]) => !shape[k])
          .forEach(([ key, value, ]) => DevSubStore.onExclusiveViolation({ key, value, target, shape, }));
      }
    }
    if (types.some(({ check, }) => check(state, shape))) {
      entries(state)
        .filter(([ _, v, ]) => !SubStore.couldBeParent(v))
        .filter(([ k, ]) => shape[k])
        .filter(([ k, v, ]) => !shape[k][spec].types.some(({ check, }) => check(v, shape[k])))
        .forEach(([ key, state, ]) => {
          // console.log({ state, key, spec: shape[key][spec].types.map(it => it.name), });
          DevSubStore.onValidationError({
            state,
            actualType: DevSubStore.getSpecificType(state),
            identity: [ ...__substore_identity__, key, ],
            isRequired: !!shape[key][spec].isRequired,
            exclusive: !!exclusive,
            expectedType: shape[key][spec].types.map(({ name, }) => name),
          });
        });
    } else {
      DevSubStore.onValidationError(
        {
          state,
          expectedType: types.map(({ name, }) => name),
          isRequired: !!isRequired,
          identity: __substore_identity__,
          exclusive: !!exclusive,
          actualType: DevSubStore.getSpecificType(state),
        });
    }
    DevSubStore.ensureRequiredFields(target);
  }

  static getSpecificType(state) {
    const type = typeof state;
    if (state instanceof Object) {
      if (type === 'function') {
        return func.name;
      } else if (state instanceof Array) {
        return array.name;
      } else if (state instanceof RegExp) {
        return regex.name;
      } else if (state instanceof Date) {
        return date.name;
      }
      return object.name;
    }
    if (state === null) {
      return 'null';
    } else if (type === 'boolean') {
      return 'bool';
    }
    return type;
  }

  static ensureRequiredFields(target) {
    const { __substore_shape__, __substore_identity__: identity, state, } = target;
    const { [spec]: ignore, [anyKey]: ignore2, ...rest } = __substore_shape__;
    const missingRequiredFields = entries(rest)
      .filter(([ _, v, ]) => v[spec].isRequired)
      .filter(([ k, ]) => !state.hasOwnProperty(k))
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
      'Expected\n'+ entries(rest).map(([ k, v, ]) => {
        const { types, } = v[spec];
        return k + ': ' + types.map(it => it.name).join(', ');
      }).join('\n'));
  }

  static onValidationError({ expectedType, actualType, state, identity, isRequired, }) {
    console.error(`Validations failed\nExpected type ${JSON.stringify(expectedType, null, 1)}\nBut got ${actualType}\nisRequired: ${!!isRequired}\nTarget: ${JSON.stringify(identity)}\nState: ${JSON.stringify(state, null, 1)}`);
  }

  static onMissingRequiredFields({ identity, missingRequiredFields, }) {
    console.error(`Validation failed\nMissing fields: ${JSON.stringify(missingRequiredFields)}\nTarget ${JSON.stringify(identity)}`);
  }

  static onInvalidSpecType(target) {
    console.error(`invalid spec type '${JSON.stringify(target.__substore_shape__[spec].type)}\nTarget ${JSON.stringify(target.get)}`);
  }
}*/