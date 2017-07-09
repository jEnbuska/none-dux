import { invalidReferenceHandler, SUB_REDUCER, ACCESS_CALLBACK, GET_STATE, findChild, } from '../common';

export function createThunk(reducer) {
  return (store) => {
    reducer.__autoreducer_dispatcher__.dispatch = action => {
      store.dispatch(action);
    };
    return (next) => (action) => {
      if (typeof action === 'function') {
        return action(reducer, store);
      }
      return next(action);
    };
  };
}

export function createAccessCallbackMiddleware(reducer) {
  return () => (next) => (action) => {
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
}
