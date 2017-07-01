const { getPrototypeOf, } = Object;

export const NATURAL_LEAF_TYPES = {
  Number: true, RegExp: true, Boolean: true, Function: true, Date: true, Error: true, String: true, Symbol: true,
};
export function stringify(val){
  try{
    return JSON.stringify(val, null, 2);
  }catch (e){ return val}
}
export const APPLICATION_STATE = '__application_state__';
export const SET_STATE = 'SET_STATE';
export const CLEAR_STATE = 'CLEAR_STATE';
export const REMOVE = 'REMOVE';
export const NON_PARENT_VALUES = {
  ...NATURAL_LEAF_TYPES,
  SubStoreArrayLeaf: true,
  SubStoreObjectLeaf: true,
};
export function exists(it) {
  return it;
}
export function valueCouldBeSubStore(value) {
  return value && value instanceof Object && !NON_PARENT_VALUES[getPrototypeOf(value).constructor.name];
}
