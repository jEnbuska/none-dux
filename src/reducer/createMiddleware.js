import { invalidReferenceHandler, SUB_REDUCER, GET_STATE, GET_PREV_STATE, findChild, } from '../common';

export function createThunk(autoReducer) {
  return (store) => {
    autoReducer.__autoreducer_dispatcher__.dispatch = action => store.dispatch(action);
    return (next) => (action) => {
      if (typeof action === 'function') {
        return action(autoReducer, store);
      }
      return next(action);
    };
  };
}

export function createStateAccessMiddleware(autoReducer) {
  return () => (next) => (action) => {
    const { type, [SUB_REDUCER]: path, } = action;
    switch (type) {
      case GET_PREV_STATE:
      case GET_STATE: {
        const child = findChild(autoReducer, path);
        if (child) { // disallow access to removed childrens state
          return type === GET_STATE ? child.__autoreducer_state__ : child.__autoreducer_prevState__;
        }
        return invalidReferenceHandler[type](path);
      }
      default:
        return next(action);
    }
  };
}