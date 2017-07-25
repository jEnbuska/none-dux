import { combineReducers, } from 'redux';

import types from './types';

const A_A = createReducer('A_A');
const A_B = createReducer('A_B');
const A = combineReducers({ A_A, A_B, });
const B = createReducer('B');
const C = createReducer('C');
const D = createReducer('D');
const E_A = createReducer('E_A');
const E_B = createReducer('E_B');
const E = combineReducers({ E_A, E_B, });

export default combineReducers({ A, B, C, D, E, });

function createReducer(name) {
  const ADD = types['ADD_'+name];
  const REMOVE = types['REMOVE_'+name];
  const UPDATE = types['UPDATE_'+name];
  const RESET = types['RESET_'+name];
  return (state = {}, { type, payload, }) => {
    switch (type) {
      case ADD:
        return { ...state, [payload.id]: payload, };
      case REMOVE: {
        state = { ...state, };
        delete state[payload];
        return state;
      } case UPDATE: {
        state = { ...state, };
        state[payload.id] = { ...state[payload.id], ...payload, };
        return state;
      } case RESET: {
        return payload;
      }
      default:
        return state;
    }
  };
}