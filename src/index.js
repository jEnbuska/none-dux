import createLeaf from './reducer/leafs';
import shape from './shape';
import { stateMapperPrivates, _README_URL_, invalidParents as leafs, } from './common';
import StateMapper from './reducer/StateMapper';
import ProxyStateMapper from './reducer/ProxyStateMapper';
import StateMapperSaga from './reducer/StateMapperSaga';
import KnotTree from './reducer/KnotTree';
import { createProxyStateChanged, createStateAccessMiddleware, createThunk, createLegacyStateChanger, } from './reducer/createMiddleware';

const { assign, keys, defineProperty, } = Object;
const { propState, propPrevState, createProxy } = stateMapperPrivates;

export function checkProxySupport() {
  const target = {};
  const proxy = new Proxy(target, {
    get: (t, k) => !!(t === target && k && 'check')
  });
  return proxy.check;
}

export default function initNonedux(initialState = {}, saga = false, proxy = checkProxySupport()) {
  console.log({proxy})
  if (!StateMapper.couldBeParent(initialState) ||!keys(initialState).length) {
    throw new Error('Expected initial state to contain at least one child, state but got '+ JSON.stringify(initialState));
  }
  let subject;
  if (saga) {
    if (proxy) {
      console.error('TODO');
    }
    subject = new StateMapperSaga(initialState, 0, new KnotTree(), { dispatch: () => { }, });
  } else if (proxy) {
    subject = new ProxyStateMapper(0, new KnotTree(), { dispatch: () => {} });
  } else {
    subject = new StateMapper(initialState, 0, new KnotTree(), { dispatch: () => { }, onGoingTransaction: false, });
    const onCreateChild = subject._createChild.bind(subject);
    defineProperty(subject, '_createChild', {
      enumerable: false,
      value: (key, role) => {
        if (initialState.hasOwnProperty(key)) {
          onCreateChild(key, role);
        } else {
          console.error('Cannot add new to root level state after initialization');
        }
      },
    });
  }
  subject[propState] = initialState;
  subject[propPrevState]= {};
  const thunk = createThunk(subject);
  const stateAccess = createStateAccessMiddleware(subject);
  const noneduxStateChanger = proxy ? createProxyStateChanged(subject) : createLegacyStateChanger(subject);
  const reducers = keys(initialState).reduce((acc, k) => assign(acc, { [k]: createDummyReducer(k, subject), }), {});
  if (proxy) {
    subject = subject[createProxy]();
  }
  return {
    reducers,
    middlewares: [ stateAccess, thunk, noneduxStateChanger, ],
    subject,
    get thunk() {
      throw new Error('Nonedux thunk middleware is no longer available separately.\nUse the list of "middlewares"  provided from the same function call\nSee README part: "Configuring store" at '+_README_URL_);
    },
    get reducer() {
      throw new Error('Nonedux reducer is deprecated\nInstead user reducers with combineReducers\nSee README part: "Configuring store" at '+_README_URL_);
    },
    dispatcher: () => console.warn('Usage of dispatcher is deprecated and can be removed'),
  };
}
export { createLeaf, shape, leafs, };

function createDummyReducer(key, root) {
  return () => root[propState][key];
}