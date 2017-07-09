import ReducerParent from './ReducerParent';
import { SET_STATE, CLEAR_STATE, REMOVE, GET_STATE, GET_PREV_STATE, stringify, findChild, } from './common';

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
      const { type, target, callback, } = action;
      if (callback) {
        const child = findChild(reducer, target);
        if (child) {
          return callback(type === GET_STATE ? child.__autoreducer_state__ : child.__autoreducer_prevState__);
        }
        return invalidReferenceHandler[type](target);
      }
      return next(action);
    };
  };
}

function createReducer(reducer) {
  return function (_, { type, target, param, callback}) {
    if (target && !callback) {
      const child = findChild(reducer, target);
      if (child) {
        switch (type) {
          case SET_STATE:
            child.__applySetState(param);
            break;
          case CLEAR_STATE:
            child.__applyClearState(param);
            break;
          case REMOVE:
            child.__applyRemove(param);
            break;
          default:
            console.error('Invalid action\n' + JSON.stringify({ type, target, param, }, null, 2));
        }
      } else {
        invalidReferenceHandler[type](target, param);
      }
    }
    return this.__autoreducer_state__;
  }.bind(reducer);
}