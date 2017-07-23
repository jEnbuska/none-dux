import { SUBJECT, GET_STATE, PARAM, PUBLISH_NOW, findChild, branchPrivates, SET_STATE, CLEAR_STATE, COMMIT_TRANSACTION, ROLLBACK, identityPrivates, poorSet, } from '../common';
import Branch from './Branch';

const { identity, dispatcher, onRemove, onSetState, onClearState, accessState, accessPrevState, accessPendingState, } = branchPrivates;
const { removeChild, renameSelf, } = identityPrivates;

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

export function createStateChanger(root, legacy) {
  let nextState = root[accessState];
  if (legacy) {
    return () => (next) => (action) => {
      const { type, [SUBJECT]: subject, [PARAM]: param, [PUBLISH_NOW]: publishNow, } = action;
      if (subject) {
        const trace = createTraceablePathLegacy(root, subject);
        const target = trace[trace.length-1];
        if (type === SET_STATE) {
          if (target.state instanceof Array) {
            throw new Error(`Target: "${subject.join(', ')}"\nCannot call setState when targets state is Array`);
          }
          target.branch[onSetState](param, target.state);
          target.state = { ...target.state, ...param, };
        } else if (type === CLEAR_STATE) {
          target.branch[onClearState](param, target.state);
          target.state = param;
        } else {
          target.state = target.branch[onRemove](param, target.state);
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
        root[onClearState](param);
        delete root[accessPendingState];
      }
      next(action);
    };
  }
  return () => (next) => (action) => {
    const { type, [SUBJECT]: path, [PARAM]: param, [PUBLISH_NOW]: publishNow, } = action;
    if (path) {
      const trace = createTraceablePath(root, path);
      const target = trace[trace.length-1];
      if (type === SET_STATE) {
        if (target.state instanceof Array) {
          throw new Error(`Target: "${path.join(', ')}"\nCannot call set state when state or parameter is Array`);
        }
        onProxySetState(target.identifier, param, target.state);
        target.state = { ...target.state, ...param, };
      } else if (type === CLEAR_STATE) {
        onProxyClearState(target.identifier, param, target.state);
        target.state = param;
      } else if (target.state instanceof Array) {
        target.state = onProxyArrayRemove(target.identifier, param, target.state);
      } else {
        onProxyObjectRemove(target.identifier, param);
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
      onProxyClearState(root[identity], param, root[accessPendingState]);
      delete root[accessPendingState];
    }
    next(action);
  };
}

function createTraceablePathLegacy(root, path) {
  let state = root[accessPendingState] || root[accessState];
  let branch = root;
  const list = [ { state, branch, }, ];
  for (let i = path.length-1; i>=0; i--) {
    const key = path[i];
    branch = branch[key];
    state = state[key];
    list.push({ key, branch, state, });
  }
  return list;
}

function createTraceablePath(root, path) {
  let state= root[accessPendingState] || root[accessState];
  let identifier = root[identity];
  const list = [ { state, identifier, }, ];
  for (let i = path.length-1; i>=0; i--) {
    const key = path[i];
    identifier = identifier[key];
    state = state[key];
    list.push({ key, identifier, state, });
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

function onProxySetState(identity, newState, prevState) {
  for (let k in newState) {
    k += '';
    if (identity[k] && newState[k]!==prevState[k]) {
      if (Branch.valueCanBeBranch(newState[k])) {
        onProxyClearState(identity[k], newState[k], prevState[k]);
      } else {
        identity[removeChild](k);
      }
    }
  }
}

function onProxyClearState(identity, newState = {}, prevState = {}) {
  for (const k in identity) {
    if (newState[k] !== prevState[k]) {
      if (Branch.valueCanBeBranch(newState[k])) {
        onProxyClearState(identity[k], newState[k], prevState[k]);
      } else {
        identity[removeChild](k);
      }
    }
  }
}

function onProxyObjectRemove(target, keys) {
  for (let k in keys) {
    k = keys[k] + '';
    if (target[k]) {
      target[removeChild](k);
    }
  }
}

function onProxyArrayRemove(target, indexes, state) {
  const toBeRemoved = poorSet(indexes);
  const nextState = [];
  const stateLength = state.length;
  for (let i = 0; i<stateLength; i++) {
    i +='';
    const { length, } = nextState;
    if (toBeRemoved[i]) {
      if (target[i]) {
        target[removeChild](i);
      }
    } else {
      if (target[i] && i !== length) {
        target[i][renameSelf](length+'');
      }
      nextState.push(state[i]);
    }
  }
  return nextState;
}
