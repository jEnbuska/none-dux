import { createStore, applyMiddleware, combineReducers, } from 'redux';
import reducers from './reduxReducers';
import nonedux, { shape, } from '../src';

const { validatorMiddleware, } = shape;

export function createStoreWithNonedux(initialState, shape, saga, proxy = false) {
  const { reducers, middlewares, subject, } = nonedux({ initialState, saga, legacy: !proxy, });
  if (shape) {
    middlewares.push(validatorMiddleware(subject, shape));
  }
  const createStoreWithMiddleware = applyMiddleware(...middlewares)(createStore);
  const store = createStoreWithMiddleware(combineReducers({ ...reducers, }));
  return { subject, store, };
}

export const configs = [ 'legacy', 'proxy', ];

export function createReduxStore() {
  return createStore(reducers);
}