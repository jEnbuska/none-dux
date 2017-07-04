import ReducerParent from './ReducerParent';
import { SET_STATE, CLEAR_STATE, REMOVE, } from './common';

export default function createNoneDux(initialState = {}) {
  const subject = new ReducerParent(initialState);
  const thunk = createThunk(subject);
  const reducer = createReducer(subject);
  return {
    reducer,
    thunk,
    subject,
    dispatcher: () => console.warn('Usage of dispatcher is deprecated and can be removed'),
  };
}

function createThunk(subject) {
  return (store) => {
    subject.__substore_onAction__.dispatch = action => {
      store.dispatch(action);
    };
    return next => action => {
      if (typeof action === 'function') {
        return action(subject, store);
      }
      return next(action);
    };
  };
}

function createReducer(subject) {
  return function (_, { type, target, param, }) {
    if (target) {
      const child = target.reduce((t, key) => t[key], this);
      switch (type) {
        case SET_STATE:
          child._onSetState(param);
          break;
        case CLEAR_STATE:
          child._onClearState(param);
          break;
        case REMOVE:
          child._onRemove(param);
          break;
        default:
          console.error('Invalid action\n' + JSON.stringify({ type, target, param, }, null, 2));
      }
    }
    return this.state;
  }.bind(subject);
}