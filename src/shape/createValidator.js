import { object, array, any, } from './types';
import Validator, { validatorIsRequired, validatorStrict, validatorChecker, spec, } from './Validator';

const { entries, assign, } = Object;

export function toType(type) {
  return function (acc, next) {
    acc = acc instanceof String ? {}: acc;
    acc[next] = type;
    return acc;
  };
}

export default function createValidator(shape, identity = [], parent, key) {
  let validator;
  if (shape instanceof Array) {
    const [ first, second, ] = shape;
    const initial = {};
    if (second) {
      if (first[spec].checker) {
        const { checker, } = first[spec].checker;
        if (checker.name!=='Array') {
          throw new Error('First type of two values inside array should be of type array or not set at all but got ' + checker.name+'\nAt: '+identity.join(', '));
        }
        console.warn('The array spesific argument should not be given a type at: '+identity.join(', '));
      }
      assign(initial, first, { [any]: second, });
    } else if (first) {
      assign(initial, first);
    }
    validator = array;
    if (initial.isRequired) {
      validator = array.isRequired;
    }
    assign(shape, validator);
  } else {
    const initial = shape[spec] || {};
    validator = object;
    if (initial.isRequired) {
      validator = validator.isRequired;
    }
    if (initial.strict) {
      validator = validator.strict;
    }
    assign(shape, validator);
  }
  return entries(shape)
    .reduce((acc, [ k, v, ]) => {
      if (k !== spec) {
        acc[k] = createValidator(v, [ ...identity, k, ], shape, k);
      } else if (v !== validator) {
        if (!v[spec]) {
          throw new Error('Invalid type at "'+ [ ...identity, k, ].join(', ')+'"');
        } else if (!v[spec].checker) {
          console.log({ v, });
          throw new Error('Missing validator data type at "'+ [ ...identity, k, ].join(', ')+'"');
        }
        acc[k] = v;
      }
      return acc;
    }, shape);
}