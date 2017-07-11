export const SET_STATE = 'NONEDUX::SET_STATE';
export const CLEAR_STATE = 'NONEDUX::CLEAR_STATE';
export const REMOVE = 'NONEDUX::REMOVE';
export const GET_STATE = 'NONEDUX::GET_STATE';
export const GET_PREV_STATE = 'NONEDUX::GET_PREV_STATE';
export const SUB_REDUCER = 'NONEDUX::SUB_REDUCER';
export const PARAM = 'NONEDUX::PARAM';

export function stringify(obj) {
  try {
    return JSON.stringify(obj, null, 2);
  } catch (Exception) {
    return obj;
  }
}

export function findChild(value, path) {
  let child = value;
  // TODO path should be in reverse order, Do --i
  for (let i = 0; i<path.length; i++) {
    const key = path[i];
    child = child[key];
    if (!child) {
      if (i===path.length-1) {
        break;
      } else {
        return undefined;
      }
    }
  }
  return child;
}

export const invalidReferenceHandler = {
  [SET_STATE]: (target, param) => {
    throw new Error('Cannot apply setState to detached child '+target.join(', ')+'\nParam: '+stringify(param));
  },
  [CLEAR_STATE]: (target, param) => {
    throw new Error('Cannot apply clearState to detached child '+target.join(', ')+'\nParam: '+stringify(param));
  },
  [REMOVE]: (target, param) => {
    throw new Error('Cannot apply remove to detached child '+target.join(', ')+'\nParam: '+stringify(param));
  },
  [GET_STATE]: (target) => {
    console.error('Cannot access state of detached child '+target.join(', '));
  },
  [GET_PREV_STATE]: (target) => {
    console.error('Cannot access prevState of detached child '+target.join(', '));
  },
};