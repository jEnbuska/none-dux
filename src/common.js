export const _README_URL_ = 'https://github.com/jEnbuska/none-dux';
export const SET_STATE = 'NONEDUX::SET_STATE';
export const CLEAR_STATE = 'NONEDUX::CLEAR_STATE';
export const REMOVE = 'NONEDUX::REMOVE';
export const GET_STATE = 'NONEDUX::GET_STATE';
export const GET_PREV_STATE = 'NONEDUX::GET_PREV_STATE';
export const TARGET = 'NONEDUX::TARGET';
export const PARAM = 'NONEDUX::PARAM';
export const PUBLISH_CHANGES = 'NONEDUX::PUBLISH_CHANGES';
export const PUBLISH_NOW = 'NONEDUX::PUBLISH_NOW';
export const ROLLBACK = 'NONEDUX::ROLLBACK';

export function stringify(obj) {
  try {
    return JSON.stringify(obj, null, 2);
  } catch (Exception) {
    return obj;
  }
}

export const has = Object.prototype.hasOwnProperty;

export function findChild(value, path) {
  for (let i = path.length-1; i>=0; --i) {
    const key = path[i];
    value= value[key];
  }
  return value;
}
export const branchPrivates = {
  resolveDiff: Symbol('resolveDiff'),
  pending: Symbol('pending'),
  identity: Symbol('identity'),
  depth: Symbol('depth'),
  propState: Symbol('state'),
  propPrevState: Symbol('prevState'),
  onSetState: Symbol('onSetState'),
  onClearState: Symbol('onClearState'),
  onRemove: Symbol('onRemove'),
  dispatcher: Symbol('dispatcher'),
  onRemoveChild: Symbol('onRemoveChild'),
  children: Symbol('children'),
  handleChange: Symbol('handleChange'),
  pendingState: Symbol('pendingState'),
  createProxy: Symbol('createProxy'),
  actual: Symbol('actual'),
};

export const knotTree = {
  resolve: Symbol('resolve'),
  createChild: Symbol('createChild'),
  renameSelf: Symbol('renameChild'),
  removeChild: Symbol('removeChild'),
};

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
};

export const invalidParents = {
  ObjectLeaf: true,
  ArrayLeaf: true,
  StateMapperSaga: true,
  StateMapper: true,
  Number: true,
  String: true,
  RegExp: true,
  Boolean: true,
  Function: true,
  Date: true,
  Error: true,
};

export function poorSet(arr) {
  return arr.reduce(poorSetMapper, {});
}
function poorSetMapper(acc, k) {
  acc[k+''] = true;
  return acc;
}