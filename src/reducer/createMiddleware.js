import { TARGET, GET_STATE, GET_PREV_STATE, PARAM, PUBLISH_NOW, findChild, branchPrivates, SET_STATE, CLEAR_STATE, REMOVE, PUBLISH_CHANGES, ROLLBACK, identityPrivates, poorSet, } from '../common';
import Branch from './Branch';
import { proxy, } from './ProxyBranch';

const { identity, dispatcher, onRemove, onSetState, onClearState, accessState, accessPrevState, accessPendingState, } = branchPrivates;
const { removeChild, renameSelf, } = identityPrivates;

const { entries, } = Object;
export function createThunk(rootBranch) {
  return (store) => {
    rootBranch[dispatcher].dispatch = action => store.dispatch(action);
    return (next) => (action) => {
      if (typeof action === 'function') {
        return action(rootBranch[proxy] || rootBranch, store);
      }
      return next(action);
    };
  };
}

export function createStateAccessMiddleware(rootBranch) {
  return () => (next) => (action) => {
    const { type, [TARGET]: path, } = action;
    switch (type) {
      case GET_STATE:
        return findChild(rootBranch[accessPendingState] || rootBranch[accessState], path);
      case GET_PREV_STATE:
        return findChild(rootBranch[accessPrevState], path);
      default:
        return next(action);
    }
  };
}

const removeReducer = function (acc, e) {
  if (!this.has(e[0])) {
    acc[e[0]] = e[1];
  }
  return acc;
};

export function createStateChanger(root, legacy) {
  let state = root[accessState];
  if (legacy) {
    return () => (next) => (action) => {
      const { type, [TARGET]: path, [PARAM]: param, [PUBLISH_NOW]: publishNow, } = action;
      if (path) {
        const trace = createTraceablePathLegacy(root, path);
        const target = trace[trace.length-1];
        switch (type) {
          case SET_STATE:
            if (target.state instanceof Array || param instanceof Array) {
              throw new Error(`Target: "${path.join(', ')}"\nCannot call set state when state or parameter is Array`);
            }
            target.child[onSetState](param, target.state);
            target.state = { ...target.state, ...param, };
            break;
          case CLEAR_STATE:
            if (!path.length) {
              console.error('CLEAR_STATE should not be called on nonedux root level state, instead use setState, to avoid removing root level states');
            }
            target.child[onClearState](param, target.state);
            target.state = param;
            break;
          case REMOVE:
            if (!path.length) {
              throw new Error(`Got invalid action: REMOVE ${param.join(', ')}, Cannot remove root level values ones set on initialState`);
            }
            target.state = target.child[onRemove](param, target.state);
            break;
          default:
            throw new Error('Invalid action\n' + JSON.stringify({ type, path, param, }, null, 2));
        }

        state = createNextState(trace);
        if (publishNow) {
          root[accessPrevState] = root[accessState];
          root[accessState] = state;
          state = root[accessState];
        } else {
          root[accessPendingState] = state;
        }
      } else if (type === PUBLISH_CHANGES) {
        root[accessPrevState] = root[accessState];
        root[accessState] = state;
        delete root[accessPendingState];
      } else if (type === ROLLBACK) {
        root[onClearState](param);
        delete root[accessPendingState];
      }
      next(action);
    };
  }
  return () => (next) => (action) => {
    const { type, [TARGET]: path, [PARAM]: param, [PUBLISH_NOW]: publishNow, } = action;
    if (path) {
      const trace = createTraceablePath(root, path);
      const target = trace[trace.length-1];
      switch (type) {
        case SET_STATE:
          if (target.state instanceof Array || param instanceof Array) {
            throw new Error(`Target: "${path.join(', ')}"\nCannot call set state when state or parameter is Array`);
          }
          onProxySetState(target.identifier, param, target.state);
          target.state = { ...target.state, ...param, };
          break;
        case CLEAR_STATE:
          if (!path.length) {
            console.error('CLEAR_STATE should not be called on nonedux root level state, instead use setState, to avoid removing root level states');
          }
          onProxyClearState(target.identifier, param, target.state);
          target.state = param;
          break;
        case REMOVE:
          if (!path.length) {
            throw new Error(`Got invalid action: REMOVE ${param.join(', ')}, Cannot remove root level values ones set on initialState`);
          }
          if (target.state instanceof Array) {
            target.state = onProxyArrayRemove(target.identifier, param, target.state);
          } else {
            onProxyObjectRemove(target.identifier, param);
            const reducer = removeReducer.bind(new Set(param));
            target.state = entries(target.state).reduce(reducer, {});
          }
          break;
        default:
          throw new Error('Invalid action\n' + JSON.stringify({ type, path, param, }, null, 2));
      }
      state = createNextState(trace);
      if (publishNow) {
        root[accessPrevState] = root[accessState];
        root[accessState] = state;
        state = root[accessState];
      } else {
        root[accessPendingState] = state;
      }
    } else if (type === PUBLISH_CHANGES) {
      root[accessPrevState] = root[accessState];
      root[accessState] = state;
      delete root[accessPendingState];
    } else if (type === ROLLBACK) {
      onProxyClearState(root[identity], param, root[accessPendingState]);
      delete root[accessPendingState];
    }
    next(action);
  };
}

function createTraceablePathLegacy(root, path) {
  let childState = root[accessPendingState] || root[accessState];
  let child = root;
  const list = [ { state: childState, child, }, ];
  for (let i = path.length-1; i>=0; i--) {
    const key = path[i];
    child = child[key];
    childState = childState[key];
    list.push({ key, child, state: childState, });
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
      if (Branch.canBeBranch(newState[k])) {
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
      if (Branch.canBeBranch(newState[k])) {
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
