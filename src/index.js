import 'babel-polyfill';
import createLeaf from './immutability/leafs';
import shape from './shape';
import { has, branchPrivates, _README_URL_, invalidParents as leafs, } from './common';
import Branch from './immutability/Branch';
import LegacyBranch from './immutability/LegacyBranch';
import ProxyBranch from './immutability/ProxyBranch';
import SagaLegacyBranch from './immutability/SagaLegacyBranch';
import Identity from './immutability/Identity';
import { createStateAccessMiddleware, createThunk, createStateChanger, } from './immutability/middlewares';

const { assign, keys, defineProperties, } = Object;
const { accessState, accessPrevState, accessPendingState, } = branchPrivates;
export function checkProxySupport() {
  const target = {};
  try {
    const proxy = new Proxy(target, {
      get: (t, k) => (t === target && k === 'check'),
    });
    return proxy.check;
  } catch (e) {
    return false;
  }
}

export default function initNonedux({ initialState, saga = false, legacy = !checkProxySupport(), }) {
  if (!Branch.valueCanBeBranch(initialState) || !keys(initialState).length) {
    throw new Error('Invalid initialState.'+
    `expected something like:
      nonedux( { initialState } ) // initialState wrapped in object
      // initialState must contain all the root level instances used in application
    `);
  }
  let subject;
  if (saga) {
    legacy = true;
    subject = new SagaLegacyBranch(new Identity(), { dispatch: () => { }, }, initialState);
  } else if (legacy) {
    subject = new LegacyBranch(new Identity(), { dispatch: () => { }, onGoingTransaction: false, }, initialState);
  } else {
    subject = new ProxyBranch(new Identity(), { dispatch: () => {}, });
  }

  const stateAccess = createStateAccessMiddleware(subject);
  const noneduxStateChanger = createStateChanger(subject, legacy);
  const reducers = keys(initialState).reduce((acc, k) => assign(acc, { [k]: createDummyReducer(k, subject), }), {});
  definedRootBranchProperties(subject, initialState);
  if (!legacy) {
    subject = subject._createProxy();
  }
  const thunk = createThunk(subject, initialState);
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

function definedRootBranchProperties(root, initialState) {
  const { setState: initialSetState, } = root;
  defineProperties(root, {
    remove: {
      get() { return function () { throw new Error('Cannot remove root branch values'); }; },
    },
    clearState: {
      get() {
        return function () { throw new Error('clearState cannot be be called on root branch, instead use setState'); };
      },
    },
    setState: {
      get() {
        return (value) => {
          try {
            return initialSetState.bind(root, value)();
          } finally {
            const invalidParams = keys(value).filter(k => !has.call(initialState, k));
            if (invalidParams.length) {
              console.error('Missing initialState description for "' + invalidParams.join(', ') + '"\nThis values cannot be mapped to component properties by using mapStateToProps');
            }
          }
        };
      },
    },
    [accessState]: {
      value: initialState,
      writable: true,
      configurable: true,
      enumerable: false,
    },
    [accessPrevState]: {
      value: {},
      writable: true,
      configurable: true,
      enumerable: false,
    },
    [accessPendingState]: {
      value: null,
      writable: true,
      configurable: true,
      enumerable: false,
    },
  });
}