import Validator from './Validator';

const { getPrototypeOf, } = Object;
export const spec = '__type_spec__';
export const any = '__target_any__'; // any object key like uuid or array index. Can not be isRequired

export const string = new Validator({ check: (val) => val === '' || (val && getPrototypeOf(val).constructor.name === 'String'), name: 'String', });
export const number = new Validator({ check: (val) => val === 0 || (val && getPrototypeOf(val).constructor.name === 'Number'), name: 'Number', });
export const bool = new Validator({ check: (val) => val===false || (val && getPrototypeOf(val).constructor.name === 'Boolean'), name: 'Boolean', });
export const regexp = new Validator({ check: (val) => val && val instanceof RegExp, name: 'RegExp', });
export const symbol = new Validator({ check: (val) => val && getPrototypeOf(val).constructor.name === 'Symbol', name: 'Symbol', });
export const func = new Validator({ check: (val) => val && getPrototypeOf(val).constructor.name === 'Function', name: 'Function', });
export const date = new Validator({ check: (val) => val && val instanceof Date, name: 'Date', });
export const error = new Validator({ check: (val) => val && val instanceof Error, name: 'Error', });
export const isRequired = new Validator(undefined, undefined, true);
export const strict = new Validator(undefined, true, undefined);
// export const anyLeaf = () => new Validator({ check: (val) => [ err, date, bool, number, regexp, func, string, symbol, ].some(({ check, }) => check(val)), name: 'anyLeaf', });
const naturalLeafTypes = {
  Number: true, RegExp: true, Boolean: true, Function: true, Date: true, Error: true, String: true, Symbol: true,
};
export const object = new Validator({ check: (val) => {
  if (val) {
    const { name, } = getPrototypeOf(val).constructor;
    return val && val instanceof Object && (name !== 'Array' && name !== 'SubStoreArrayLeaf' && !naturalLeafTypes[name]);
  }
  return false;
}, name: 'Object', });
export const array = new Validator({ check: (val) => {
  if (val) {
    const { name, } = getPrototypeOf(val).constructor;
    return val && (val instanceof Array || name === 'SubStoreArrayLeaf');
  }
  return false;
}, name: 'Array', });

export default {
  get object() {
    throw new Error('Object types are not explicitly, just use "isRequired" and "strict" instead');
  },
  get array() {
    throw new Error('Array types are not explicitly, just use "isRequired" instead');
  },
  number,
  bool,
  error,
  regexp,
  func,
  date,
  strict,
  isRequired,
};