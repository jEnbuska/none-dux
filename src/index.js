import createLeaf from './reducer/AutoReducerLeaf';
import shape from './shape';

import AutoReducer from './reducer/AutoReducer';
import KnotList from './reducer/KnotList';
import createReducer from './reducer/createReducer';
import { createStateAccessMiddleware, createThunk, } from './reducer/createMiddleware';

export default function initAutoReducer(initialState = {}) {
  const subject = new AutoReducer(initialState, 0, new KnotList(), { dispatch: () => { }, });
  subject.__autoreducer_state__ = initialState;
  subject.__autoreducer_prevState__= {};
  const thunk = createThunk(subject);
  const stateAccess = createStateAccessMiddleware(subject);
  const reducer = createReducer(subject);
  return {
    reducer,
    middlewares: [ thunk, stateAccess, ],
    subject,
    get thunk() {
      throw new Error('Nonedux thunk middleware is no longer available separately.\nUse the list of "middlewares"  provided from the same function call');
    },
    dispatcher: () => console.warn('Usage of dispatcher is deprecated and can be removed'),
  };
}
export { createLeaf, shape, };