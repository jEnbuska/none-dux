export const SET_STATE = 'NONEDUX::SET_STATE';
export const CLEAR_STATE = 'NONEDUX::CLEAR_STATE';
export const REMOVE = 'NONEDUX::REMOVE';
export const GET_STATE = 'NONEDUX::GET_STATE';
export const GET_PREV_STATE = 'NONEDUX::GET_PREV_STATE';
export const ACCESS_CALLBACK = 'NONEDUX::ACCESS_CALLBACK';
export const SUB_REDUCER = 'NONEDUX::SUB_REDUCER';
export const PARAM = 'NONEDUX::PARAM';

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