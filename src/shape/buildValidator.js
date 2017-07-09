import { Validator, object, array, spec, any, } from './common';

const { entries, assign, } = Object;

export default function buildValidator(shape, identity = []) {
  let validator;
  if (shape instanceof Array) {
    const [ first, second, third, ] = shape;
    if (third) {
      throw new Error('Only one child shape / array. Got'+shape.length+ ' at "'+identity.join(', ') +2+'"');
    }
    shape = [ first, second, ]
      .filter(exists => exists)
      .reduce((acc, next) => {
        if ((next instanceof Validator && next[spec].name) || !(next instanceof Validator)) {
          acc[any] = next;
        } else {
          acc[spec] = next[spec];
        }
        return acc;
      }, {});
    if (shape[spec]) {
      const { isRequired, } = shape[spec];
      assign(shape, new Validator('Array', false, isRequired));
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
    .filter(([ k, v, ]) => !(k === spec || (v instanceof Validator && v[spec].name)))
    .reduce((acc, [ k, v, ]) => {
      acc[k] = buildValidator(v, [ ...identity, k, ]);
      return acc;
    }, shape);
}