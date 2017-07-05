import { object, array, } from './types';
import Validator, { spec, } from './Validator';

export const any = '__target_any__'; // any object key like uuid or array index. Can not be isRequired
const { entries, assign, } = Object;

export function toType(type) {
  return function (acc, next) {
    acc = acc instanceof String ? {}: acc;
    acc[next] = type;
    return acc;
  };
}

export default function createValidator(shape, identity = []) {
  let validator;
  if (shape instanceof Array) {
    const [ first, second, third, ] = shape;
    shape = {};
    if (third) {
      throw new Error('Only one child shape per array. Got'+shape.length+ ' at "'+identity.join(', ') +2+'"');
    }
    if (first) {
      if (first[spec]) {
        if (first[spec].name) {
          assign(shape, { [any]: first, }, array);
        } else {
          validator = array;
          if (first[spec].isRequired) {
            validator = validator.isRequired;
          }
          assign(shape, validator);
          if (second) {
            assign(shape, { [any]: second, });
          }
        }
      } else {
        assign(shape, { [any]: first, }, array);
      }
    } else {
      assign(shape, array);
    }
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
    .filter(([ k, v, ]) => k!==spec && !(v instanceof Validator))
    .reduce((acc, [ k, v, ]) => {
      acc[k] = createValidator(v, [ ...identity, k, ]);
      return acc;
    }, shape);
}