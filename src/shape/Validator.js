export const validatorStrict = 'strict';
export const validatorChecker = 'checker';
export const validatorIsRequired= 'isRequired';
export const spec = '__type_spec__';

export default class Validator {

  constructor(checker, strict= false, isRequired= false) {
    this[spec] = { checker, strict, isRequired, };
  }

  get isRequired() {
    const { checker, strict, } = this[spec];
    return new Validator(checker, strict, true);
  }

  get strict() {
    const { checker, isRequired, } = this[spec];
    return new Validator(checker, true, isRequired);
  }

  check(value, shape) {
    const { checker, strict, isRequired, } = this[spec];
    let valid = checker(value);
    if (valid && strict) {
      valid = valid && Object.keys(value).every(key => shape[key]);
    }
    if (!isRequired) {
      valid = valid || value === undefined || value === null;
    }
    return valid;
  }
}
