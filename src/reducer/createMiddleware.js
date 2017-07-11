import { SUB_REDUCER, GET_STATE, GET_PREV_STATE, findChild, reducerPrivates, } from '../common';

const { dispatcher, propState, propPrevState, } = reducerPrivates;

export function createThunk(stateMapper) {
  return (store) => {
    stateMapper[dispatcher].dispatch = action => store.dispatch(action);
    return (next) => (action) => {
      if (typeof action === 'function') {
        return action(stateMapper, store);
      }
      return next(action);
    };
  };
}

export function createStateAccessMiddleware(stateMapper) {
  return () => (next) => (action) => {
    const { type, [SUB_REDUCER]: path, } = action;
    switch (type) {
      case GET_STATE:
        return findChild(stateMapper[propState], path);
      case GET_PREV_STATE:
        return findChild(stateMapper[propPrevState], path);
      default:
        return next(action);
    }
  };
}