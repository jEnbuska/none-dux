export const validatorStrict = '__type_strict__';
export const validatorChecker = '__type_checker__';
export const validatorIsRequired= '__type_isRequired__';

export default class Validator {

  constructor(checker, strict = false, isRequired = false) {
    this.__type_checker__ = checker;
    this.__type_strict__ = strict;
    this.__type_isRequired__ = isRequired;
  }

  get isRequired() {
    return new Validator(this.__type_checker__, this.__type_strict__, true);
  }

  get strict() {
    return new Validator(this.__type_checker__, true, this.__type_isRequired__);
  }

  check(value, shape) {
    let valid = true;
    if (this.__type_checker__) {
      valid = this.__type_checker__.check(value);
    }
    if (valid && this.__type_strict__) {
      valid = valid && Object.keys(value).every(key => shape[key]);
    }
    if (!this.__type_isRequired__) {
      valid = valid || value === undefined || value === null;
    }
    return valid;
  }
}
