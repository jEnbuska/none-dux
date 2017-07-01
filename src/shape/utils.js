import { Str, Bool, Dt, Func, Rgx, Numb, Err, Symb, } from './Leafs';
import { Arr, Obj, } from './Parents';
import { isRequired, strict, stateOnly, type, leaf, many, } from './shapeTypes';
import { NATURAL_LEAF_TYPES, } from '../common';

const { getPrototypeOf, keys, } = Object;

export function getValueTypeName(val) {
  try {
    return getPrototypeOf(val).constructor.name;
  } catch (_) { return undefined; }
}

export function getComponentTypeOf(obj) {
  return {
    [Str]: 'String',
    [Bool]: 'Boolean',
    [Dt]: 'Date',
    [Symb]: 'Symbol',
    [Func]: 'Function',
    [Rgx]: 'RegExp',
    [Numb]: 'Number',
    [Err]: 'Error',
    [Obj]: 'Object',
    [Arr]: 'Array',
  }[Object.getPrototypeOf(obj).constructor];
}

export const checkers = {
  String: (val) => val === '' || (val && getPrototypeOf(val).constructor.name === 'String'),
  Number: (val) => val === 0 || (val && getPrototypeOf(val).constructor.name === 'Number'),
  Boolean: (val) => val===false || (val && getPrototypeOf(val).constructor.name === 'Boolean'),
  RegExp: (val) => val && getPrototypeOf(val).constructor.name === 'RegExp',
  Symbol: (val) => val && getPrototypeOf(val).constructor.name === 'Symbol',
  Function: (val) => val && getPrototypeOf(val).constructor.name === 'Function',
  Date: (val) => val && getPrototypeOf(val).constructor.name === 'Date',
  strict: (state, shape) => keys(state).every(key => shape[key]),
  Object: (val) => {
    if (val) {
      const { name, } = getPrototypeOf(val).constructor;
      return name === 'Object' || (name !== 'Array' && name !== 'SubStoreArrayLeaf' && !NATURAL_LEAF_TYPES[name]);
    }
    return false;
  },
  Array: (val) => {
    if (val) {
      const { name, } = getPrototypeOf(val).constructor;
      return name === 'Array' || name === 'SubStoreArrayLeaf';
    }
    return false;
  },
  none: (val) => val === null || val === undefined, name: 'null or undefined',
};

export function getShapesChildren(shape) {
  const { [isRequired]: _0, [many]: _1, [strict]: _2, [type]: _3, [leaf]: _4, [stateOnly]: _5, ...children } = shape;
  return children;
}