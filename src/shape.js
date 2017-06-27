const { getPrototypeOf, keys, } = Object;
export const spec = '__substore_spec__';
export const anyKey = '__substore_target_any__'; // any object key like uuid or array index. Can not be isRequired

export const isRequired = (val) => val!==null && val !== undefined;
const naturalLeafTypes = {
  Number: true, RegExp: true, Boolean: true, Function: true, Date: true, Error: true, String: true, Symbol: true,
};
export const object = { check: (val) => {
  if (val) {
    const { name, } = getPrototypeOf(val).constructor;
    return name === 'Object' || (name !== 'Array' && name !== 'SubStoreArrayLeaf' && !naturalLeafTypes[name]);
  }
  return false;
}, name: 'object', };
export const array = { check: (val) => {
  if (val) {
    const { name, } = getPrototypeOf(val).constructor;
    return name === 'Array' || name === 'SubStoreArrayLeaf';
  }
  return false;
}, name: 'array', };
export const string = { check: (val) => val === '' || (val && getPrototypeOf(val).constructor.name === 'String'), name: 'string', };
export const number = { check: (val) => val === 0 || (val && getPrototypeOf(val).constructor.name === 'Number'), name: 'number', };

export const none = { check: (val) => val === null || val === undefined, name: 'null or undefined', };
export const exclusive= { check: (val, shape) => keys(val).every(key => shape[key]), name: 'exclusive', };
export const bool = { check: (val) => val===false || (val && getPrototypeOf(val).constructor.name === 'Boolean'), name: 'bool', };
export const regex = { check: (val) => val && getPrototypeOf(val).constructor.name === 'RegExp', name: 'regex', };
export const symbol = { check: (val) => val && getPrototypeOf(val).constructor.name === 'Symbol', name: 'symbol', };
export const func = { check: (val) => val && getPrototypeOf(val).constructor.name === 'Function', name: 'func', };
export const date = { check: (val) => val && getPrototypeOf(val).constructor.name === 'Date', name: 'date', };
export const anyLeaf = { check: (val) => [ date, bool, number, regex, func, string, symbol, ].some(({ check, }) => check(val)), name: 'anyLeaf', };
export const anyValue = { check: (val) => isRequired(val), name: 'anyValue', };