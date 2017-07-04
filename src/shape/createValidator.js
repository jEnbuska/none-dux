import { spec, object, array, any, } from './types';
import Validator, { validatorIsRequired, validatorStrict, validatorChecker} from './Validator';

const { entries, } = Object;

export function toType(type) {
  return function (acc, next) {
    acc = acc instanceof String ? {}: acc;
    acc[next] = type;
    return acc;
  };
}

export default function createValidator(shape) {
  let validator;
  if (shape instanceof Array) {
    shape = shape.reduce((acc, v) => {
      if (v && v[spec]) {
        acc[spec] = v[spec];
      } else {
        acc[any] = v;
      }
      return acc;
    }, {});
    const initial = shape[spec] || {};
    validator = array;
    if (initial[validatorIsRequired]) {
      validator = array.isRequired;
    }
    shape[spec] = validator;
  } else {
    const initial = shape[spec] || {};
    validator = object;
    if (initial[validatorIsRequired]) {
      validator = validator.isRequired;
    }
    if (initial[validatorStrict]) {
      validator = validator.strict;
    }
    shape[spec] = validator;
  }
  return entries(shape)
    .reduce((acc, [ k, v, ]) => {
      if (k !== spec) {
        if (!(v instanceof Validator)) {
          acc[k] = createValidator(v);
        } else if (v !== validator) {
          acc[k] = { [spec]: v, };
        }
      }
      return acc;
    }, shape);
}