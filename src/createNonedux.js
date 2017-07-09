import ReducerParent from './ReducerParent';
import { SUB_REDUCER, ACCESS_CALLBACK, SET_STATE, CLEAR_STATE, REMOVE, GET_STATE, GET_PREV_STATE, stringify, findChild, } from './common';

export default function createNoneDux(initialState = {}) {
  const subject = new ReducerParent(initialState);
  const thunk = createThunk(subject);
  const reducer = createReducer(subject);
  return {
    reducer,
    thunk,
    subject,
    dispatcher: () => console.warn('Usage of dispatcher is deprecated and can be removed'),
  };
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

function createThunk(reducer) {
  return (store) => {
    reducer.__autoreducer_dispatcher__.dispatch = action => {
      store.dispatch(action);
    };
    return (next) => (action) => {
      if (typeof action === 'function') {
        return action(reducer, store);
      }
      const { type, [SUB_REDUCER]: path, [ACCESS_CALLBACK]: accessCallback, } = action;
      if (accessCallback) {
        const child = findChild(reducer, path);
        if (child) {
          return accessCallback(type === GET_STATE ? child.__autoreducer_state__ : child.__autoreducer_prevState__);
        }
        return invalidReferenceHandler[type](path);
      }
      return next(action);
    };
  };
}

function createReducer(reducer) {
  return function (_, { type, [SUB_REDUCER]: path, param, [ACCESS_CALLBACK]: callback, }) {
    if (path && !callback) {
      let child = reducer;
      const targetPathList = [ child, ];
      for (let i = 0; i<path.length; i++) {
        child = child[path[i]];
        if (child) {
          targetPathList.push(child);
        } else {
          break;
        }
      }
      let changes = false;
      if (child) {
        switch (type) {
          case SET_STATE:
            child.__applySetState(param);
            changes=true;
            break;
          case CLEAR_STATE:
            child.__applyClearState(param);
            changes = true;
            break;
          case REMOVE:
            child.__applyRemove(param);
            changes = true;
            break;
          default:
            console.error('Invalid action\n' + JSON.stringify({ type, path, param, }, null, 2));
        }
        if (changes) {
          const reversed = targetPathList.reverse();
          let previous = child;
          for (let i = 1; i<reversed.length; i++) {
            const { __autoreducer_id__: childId, __autoreducer_state__: childState, } = previous;
            const current = reversed[i];
            const { __autoreducer_state__: parentState, } = current;
            current.__autoreducer_prevState__ = parentState;
            if (parentState instanceof Array) {
              current.__autoreducer_state__ = [
                ...parentState.slice(0, childId),
                childState, ...parentState.slice(Number(childId)+1, parentState.length),
              ];
            } else {
              current.__autoreducer_state__ = { ...parentState, [childId]: childState, };
            }
            previous = current;
          }
        }
      } else {
        invalidReferenceHandler[type](path, param);
      }
    }
    return this.__autoreducer_state__;
  }.bind(reducer);
}