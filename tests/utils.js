import { createStore, applyMiddleware, combineReducers, } from 'redux';
import nonedux, { shape, } from '../src';

const { validatorMiddleware, } = shape;

export function createStoreWithNonedux(initialState, shape, saga) {
  const { reducers, middlewares, subject, } = nonedux(initialState, saga);
  if (shape) {
    middlewares.push(validatorMiddleware(subject, shape));
  }
  const createStoreWithMiddleware = applyMiddleware(...middlewares)(createStore);
  const store = createStoreWithMiddleware(combineReducers({ ...reducers, }));
  return { subject, store, };
}