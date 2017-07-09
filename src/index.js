import createLeaf from './reducer/AutoReducerLeaf';
import shape from './shape';

import AutoReducer from './reducer/AutoReducer';
import createReducer from './reducer/createReducer';
import { createThunk, createAccessCallbackMiddleware, } from './reducer/middlewares';

export default function initAutoReducer(initialState = {}) {
  const subject = new AutoReducer(initialState, 'root', 0, [], { dispatch: () => { }, });
  const thunk = createThunk(subject);
  const accessCallback = createAccessCallbackMiddleware(subject);
  const reducer = createReducer(subject);
  return {
    reducer,
    middlewares: [ accessCallback, thunk, ],
    subject,
    get thunk() {
      throw new Error('Nonedux thunk middleware is no longer available separately.\nUse the list of "middlewares" provided');
    },
    dispatcher: () => console.warn('Usage of dispatcher is deprecated and can be removed'),
  };
}
export { createLeaf, shape, };