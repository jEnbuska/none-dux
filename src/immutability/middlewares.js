import { SUBJECT, GET_STATE, PARAM, PUBLISH_NOW, findChild, branchPrivates, SET_STATE, CLEAR_STATE, COMMIT_TRANSACTION, ROLLBACK, poorSet, } from '../common';
import Branch from './Branch';

const { dispatcher, accessState, accessPrevState, accessPendingState, } = branchPrivates;

const { entries, } = Object;
export function createThunk(rootBranch) {
  return (store) => {
    rootBranch[dispatcher].dispatch = action => store.dispatch(action);
    return (next) => (action) => {
      if (typeof action === 'function') {
        return action(rootBranch, store);
      }
      return next(action);
    };
  };
}

export function createStateAccessMiddleware(rootBranch) {
  return () => (next) => (action) => {
    if (action.type === GET_STATE) {
      return findChild(rootBranch[accessPendingState] || rootBranch[accessState], action[SUBJECT]);
    }
    return next(action);
  };
}

const removeReducer = function (acc, e) {
  if (!this.has(e[0])) {
    acc[e[0]] = e[1];
  }
  return acc;
};

export function createStateChanger(root) {
  let nextState = root[accessState];
  return () => (next) => (action) => {
    const { type, [SUBJECT]: path, [PARAM]: param, [PUBLISH_NOW]: publishNow, } = action;
    if (path) {
      const trace = createTraceablePath(root, path);
      const target = trace[trace.length-1];
      if (type === SET_STATE) {
        if (Branch.valueCanBeBranch(target.state)) {
          target.state = { ...target.state, ...param, };
        } else {
          target.state = param;
        }
      } else if (type === CLEAR_STATE) {
        target.state = param;
      } else if (target.state instanceof Array) {
        target.state = onProxyArrayRemove(param, target.state);
      } else {
        const rReducer = removeReducer.bind(new Set(param));
        target.state = entries(target.state).reduce(rReducer, {});
      }
      nextState = createNextState(trace);
      if (publishNow) {
        root[accessPrevState] = root[accessState];
        root[accessState] = nextState;
        nextState = root[accessState];
      } else {
        root[accessPendingState] = nextState;
      }
    } else if (type === COMMIT_TRANSACTION) {
      root[accessPrevState] = root[accessState];
      root[accessState] = nextState;
      delete root[accessPendingState];
    } else if (type === ROLLBACK) {
      delete root[accessPendingState];
    }
    next(action);
  };
}

function createTraceablePath(root, path) {
  let state= root[accessPendingState] || root[accessState];
  const list = [ { state, }, ];
  for (let i = path.length-1; i>=0; i--) {
    const key = path[i];
    state = state[key];
    list.push({ key, state, });
  }
  return list;
}

function createNextState(childList) {
  for (let i = childList.length-1; i>0; --i) {
    const { key, state: childState, } = childList[i];
    const { state: parentState, } = childList[i-1];
    if (parentState instanceof Array) {
      childList[i-1].state= [
        ...parentState.slice(0, key),
        childState, ...parentState.slice(Number(key)+1, parentState.length),
      ];
    } else {
      childList[i-1].state = { ...parentState, [key]: childState, };
    }
  }
  return childList[0].state;
}

function onProxyArrayRemove(indexes, state) {
  const toBeRemoved = poorSet(indexes);
  const nextState = [];
  const stateLength = state.length;
  for (let i = 0; i<stateLength; i++) {
    i +='';
    if (!toBeRemoved[i]) {
      nextState.push(state[i]);
    }
  }
  return nextState;
}
