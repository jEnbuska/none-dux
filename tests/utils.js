import { createStore, applyMiddleware, combineReducers, } from 'redux';
import reducers from './reduxReducers';
import nonedux, { shape, } from '../src';

const { validatorMiddleware, } = shape;

export function createStoreWithNonedux(initialState, shape) {
  const { reducers, middlewares, subject, } = nonedux({ initialState, shape});
  if (shape) {
    middlewares.push(validatorMiddleware(subject, shape));
  }
  const createStoreWithMiddleware = applyMiddleware(...middlewares)(createStore);
  const store = createStoreWithMiddleware(combineReducers({ ...reducers, }));
  return { subject, store, };
}

export function createReduxStore() {
  return createStore(reducers);
}