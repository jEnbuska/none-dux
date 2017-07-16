import { createStore, applyMiddleware, } from 'redux';
import nonedux, { shape, } from '../src';

const { validatorMiddleware, } = shape;

export function createStoreWithNonedux(initialState, shape, saga) {
  const { reducer, middlewares, subject, } = nonedux(initialState, saga);
  if (shape) {
    middlewares.push(validatorMiddleware(subject, shape));
  }
  const createStoreWithMiddleware = applyMiddleware(...middlewares)(createStore);
  const store = createStoreWithMiddleware(reducer);
  return { subject, store, };
}