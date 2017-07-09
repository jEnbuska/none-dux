export const SET_STATE = 'NONEDUX_SET_STATE';
export const CLEAR_STATE = 'NONEDUX_CLEAR_STATE';
export const REMOVE = 'NONEDUX_REMOVE';
export const GET_STATE = 'NONEDUX_GET_STATE';
export const GET_PREV_STATE = 'NONEDUX_GET_PREV_STATE';

export function stringify(obj) {
  try {
    return JSON.stringify(obj, null, 2);
  } catch (Exception) {
    return obj;
  }
}

export function findChild(root, path) {
  let child = root;
  for (let i = 0; child && i<path.length; i++) {
    child = child[path[i]];
  }
  return child;
}