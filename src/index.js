import createLeaf from './reducer/leafs';
import shape from './shape';
import { stateMapperPrivates, } from './common';
import StateMapper from './reducer/StateMapper';
import StateMapperSaga from './reducer/StateMapperSaga';
import KnotTree from './reducer/KnotTree';
import createReducer from './reducer/createReducer';
import { createStateAccessMiddleware, createThunk, } from './reducer/createMiddleware';

const { propState, propPrevState, } = stateMapperPrivates;

export default function initStateMapper(initialState = {}, saga = false) {
  let subject;
  if (saga) {
    subject = new StateMapperSaga(initialState, 0, new KnotTree(), { dispatch: () => { }, });
  } else {
    subject = new StateMapper(initialState, 0, new KnotTree(), { dispatch: () => { }, onGoingTransaction: false, });
  }
  subject[propState] = initialState;
  subject[propPrevState]= {};
  const thunk = createThunk(subject);
  const stateAccess = createStateAccessMiddleware(subject);
  const reducer = createReducer(subject);
  return {
    reducer,
    middlewares: [ thunk, stateAccess, ],
    subject,
    get thunk() {
      throw new Error('Nonedux thunk middleware is no longer available separately.\nUse the list of "middlewares"  provided from the same function call\nSee README part: "Configuring store" at https://github.com/jEnbuska/none-dux');
    },
    dispatcher: () => console.warn('Usage of dispatcher is deprecated and can be removed'),
  };
}
export { createLeaf, shape, };