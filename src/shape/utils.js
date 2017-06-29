import { Str, Bool, Dt, Func, Rgx, Numb, Err, Symb, } from './Leafs';
import { Arr, Obj, } from './Parents';

export const NONE = '__SubStore_none__';
export const Wrap = ({ children, }) => children;
export function getComponentType(comp) {
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
  }[comp];
}
