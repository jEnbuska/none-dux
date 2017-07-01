import { Str, Bool, Dt, Func, Rgx, Numb, Err, Symb, } from './Leafs';
import { Arr, Obj, } from './Parents';

export const isChildValue = {
  Number: true,
  String: true,
  RegExp: true,
  Boolean: true,
  Function: true,
  Date: true,
  Error: true,
};

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
