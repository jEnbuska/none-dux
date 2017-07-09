import Validator from './Validator';

const { getPrototypeOf, } = Object;
export const naturalLeafTypes = {
  Number: true, RegExp: true, Boolean: true, Function: true, Date: true, Error: true, String: true, Symbol: true,
};
export const checkers = {
  String: (val) => (val === '' || (val && getPrototypeOf(val).constructor.name === 'String')),
  Number: val => val === 0 || (val && getPrototypeOf(val).constructor.name === 'Number'),
  Boolean: (val) => val===false || (val && getPrototypeOf(val).constructor.name === 'Boolean'),
  RegExp: (val) => val && val instanceof RegExp,
  Symbol: (val) => val && getPrototypeOf(val).constructor.name === 'Symbol',
  Function: (val) => val && getPrototypeOf(val).constructor.name === 'Function',
  Date: (val) => val && val instanceof Date,
  Error: (val) => val && val instanceof Error, name: 'Error',
  Object: (val) => {
    if (val) {
      const { name, } = getPrototypeOf(val).constructor;
      return val && val instanceof Object && (name !== 'Array' && name !== 'AutoReducerArrayLeaf' && !naturalLeafTypes[name]);
    }
    return false;
  },
  Array: (val) => {
    if (val) {
      const { name, } = getPrototypeOf(val).constructor;
      return val && (val instanceof Array || name === 'AutoReducerArrayLeaf');
    }
    return false;
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
  object() {
    throw new Error('Object types are not explicitly, just use "isRequired" and "strict" instead');
  },
  get array() {
    throw new Error('Array types are not explicitly, just use "isRequired" instead');
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