import { createStore, applyMiddleware, } from 'redux';
import nonedux, { shape, } from '../src';

const { validatorMiddleware, } = shape;

export function createStoreWithNonedux(initialState, shape) {
  const { reducer, middlewares, subject, } = nonedux(initialState);
  if (shape) {
    middlewares.push(validatorMiddleware(subject, shape));
  }
  const createStoreWithMiddleware = applyMiddleware(...middlewares)(createStore);
  createStoreWithMiddleware(reducer);
  return subject;
}