export const spec = '__type_spec__';

export default class Validator {

  constructor(name, strict= false, isRequired= false) {
    this[spec] = { name, strict, isRequired, };
  }

  get isRequired() {
    const { name, strict, } = this[spec];
    return new Validator(name, strict, true);
  }

  get strict() {
    const { name, isRequired, } = this[spec];
    return new Validator(name, true, isRequired);
  }
}
