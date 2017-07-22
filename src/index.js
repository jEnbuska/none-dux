import createLeaf from './reducer/leafs';
import shape from './shape';
import { branchPrivates, _README_URL_, invalidParents as leafs, } from './common';
import Branch from './reducer/Branch';
import LegacyBranch from './reducer/LegacyBranch';
import ProxyStateBranch from './reducer/ProxyBranch';
import SagaLegacyBranch from './reducer/SagaLegacyBranch';
import Identity from './reducer/Identity';
import { createStateAccessMiddleware, createThunk, createStateChanger, } from './reducer/createMiddleware';

const { assign, keys, defineProperty, } = Object;
const { accessState, accessPrevState, } = branchPrivates;

export function checkProxySupport() {
  const target = {};
  const proxy = new Proxy(target, {
    get: (t, k) => !!(t === target && k==='check' && 'check'),
  });
  return proxy.check;
}

export default function initNonedux({ initialState, saga = false, legacy = !checkProxySupport(), }) {
  if (!Branch.canBeBranch(initialState) ||!keys(initialState).length) {
    throw new Error('Expected initial state to contain at least one child, state but got '+ JSON.stringify(initialState));
  }
  let subject;
  if (saga) {
    legacy = true;
    subject = new SagaLegacyBranch(new Identity(), { dispatch: () => { }, }, initialState);
  } else if (legacy) {
    subject = new LegacyBranch(new Identity(), { dispatch: () => { }, onGoingTransaction: false, }, initialState);
    const onCreateChild = subject._createChild.bind(subject);
    defineProperty(subject, '_createChild', {
      enumerable: false,
      value: (key, identity) => {
        if (initialState.hasOwnProperty(key)) {
          onCreateChild(key, identity);
        } else {
          console.error('Cannot add new to root level state after initialization');
        }
      },
    });
  } else {
    subject = new ProxyStateBranch(new Identity(), { dispatch: () => {}, });
  }
  subject[accessState] = initialState;
  subject[accessPrevState]= {};
  const thunk = createThunk(subject);
  const stateAccess = createStateAccessMiddleware(subject);
  const noneduxStateChanger = createStateChanger(subject, legacy);
  const reducers = keys(initialState).reduce((acc, k) => assign(acc, { [k]: createDummyReducer(k, subject), }), {});
  if (!legacy) {
    subject = subject._createProxy();
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
  return () => root[accessState][key];
}