import { _README_URL_, } from '../common';

export const spec = '__type_spec__';
export const any = '__target_any__'; // any KEY (not value)

const { getPrototypeOf, } = Object;
export const naturalLeafTypes = {
  Number: true, RegExp: true, Boolean: true, Function: true, Date: true, Error: true, String: true, Symbol: true,
};

const { assign, } = Object;

export class Validator {

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

  many(...keys) {
    return keys.reduce((acc, k) => assign(acc, { [k]: this, }), {});
  }
}
function safeEvaluate(evaluate) {
  try {
    return evaluate();
  } catch (e) {
    return false;
  }
}
export const checkers = {
  String(val) { return val === '' || (val && typeof val === 'string'); },
  Number(val) { return val === 0 || (val && typeof val === 'number'); },
  Boolean(val) { return safeEvaluate(() => val===false || (val && typeof val === 'boolean')); },
  RegExp(val) { return safeEvaluate(() => val && val instanceof RegExp); },
  Symbol(val) { return safeEvaluate(() => val && getPrototypeOf(val).constructor.name === 'Symbol'); },
  Function(val) { return safeEvaluate(val && getPrototypeOf(val).constructor.name === 'Function'); },
  Date(val) { return safeEvaluate(() => val && val instanceof Date); },
  Error(val) { return safeEvaluate(() => val && val instanceof Error); },
  Object(val) {
    return safeEvaluate(() => {
      if (val) {
        const { name, } = getPrototypeOf(val).constructor;
        return val && val instanceof Object && (name !== 'Array' && name !== 'ArrayLeaf' && !naturalLeafTypes[name]);
      }
      return false;
    });
  },
  Array(val) {
    return safeEvaluate(() => {
      if (val) {
        const { name, } = getPrototypeOf(val).constructor;
        return val && (val instanceof Array || name === 'ObjectLeaf');
      }
      return false;
    });
  },
};
export const string = new Validator('String');
export const number = new Validator('Number');
export const bool = new Validator('Boolean',);
export const regexp = new Validator('RegExp');
export const symbol = new Validator('Symbol');
export const func = new Validator('Function');
export const date = new Validator('Date');
export const error = new Validator('Error');
export const isRequired = new Validator(undefined, undefined, true);
export const strict = new Validator(undefined, true, undefined);

// export const anyLeaf = () => new Validator({ check: (val) => [ err, date, bool, number, regexp, func, string, symbol, ].some(({ check, }) => check(val)), name: 'anyLeaf', });

export const object = new Validator('Object');
export const array = new Validator('Array');

export default {
  get object() {
    throw new Error('Object types are not set explicitly. Just use curly braces instead\nExample: { ...isRequired, age: number, [any]: { ... } }\nREADME section: "Type checking" at '+_README_URL_);
  },
  get array() {
    throw new Error('Array types are not set explicitly, just use [ /*definition here*/ ] instead\nREADME section: "Type checking" at '+_README_URL_);
  },
  string,
  number,
  bool,
  regexp,
  symbol,
  error,
  func,
  date,
  strict,
  isRequired,
};