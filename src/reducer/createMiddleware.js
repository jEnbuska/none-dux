import { TARGET, GET_STATE, GET_PREV_STATE, PARAM, PUBLISH_NOW, findChild, branchPrivates, SET_STATE, CLEAR_STATE, REMOVE, PUBLISH_CHANGES, ROLLBACK, has, knotTree, poorSet, } from '../common';
import Branch from './Branch';
import { proxy, } from './ProxyBranch';

const { identity, dispatcher, onRemove, onSetState, onClearState, propState, propPrevState, pendingState, } = branchPrivates;
const { removeChild, renameSelf, } = knotTree;

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

export function createStateAccessMiddleware(stateMapper) {
  return () => (next) => (action) => {
    const { type, [TARGET]: path, } = action;
    switch (type) {
      case GET_STATE:
        return findChild(stateMapper[pendingState] || stateMapper[propState], path);
      case GET_PREV_STATE:
        return findChild(stateMapper[propPrevState], path);
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
  let state = root[propState];
  if (legacy) {
    return () => (next) => (action) => {
      const { type, [TARGET]: path, [PARAM]: param, [PUBLISH_NOW]: publishNow, } = action;
      if (path) {
        const trace = createTraceablePathLegacy(root, path);
        const last = trace[trace.length-1];
        switch (type) {
          case SET_STATE:
            if (last.state instanceof Array || param instanceof Array) {
              throw new Error(`Target: "${path.join(', ')}"\nCannot call set state when state or parameter is Array`);
            }
            last.child[onSetState](param, last.state);
            last.state = { ...last.state, ...param, };
            break;
          case CLEAR_STATE:
            if (!path.length) {
              console.error('CLEAR_STATE should not be called on nonedux root level state, instead use setState, to avoid removing root level states');
            }
            last.child[onClearState](param, last.state);
            last.state = param;
            break;
          case REMOVE:
            if (!path.length) {
              throw new Error(`Got invalid action: REMOVE ${param.join(', ')}, Cannot remove root level values ones set on initialState`);
            }
            last.state = last.child[onRemove](param, last.state);
            break;
          default:
            throw new Error('Invalid action\n' + JSON.stringify({ type, path, param, }, null, 2));
        }
        state = createNextState(trace);
        if (publishNow) {
          root[propPrevState] = root[propState];
          root[propState] = state;
          state = root[propState];
        } else {
          root[pendingState] = state;
        }
      } else if (type === PUBLISH_CHANGES) {
        root[propPrevState] = root[propState];
        root[propState] = state;
        delete root[pendingState];
      } else if (type === ROLLBACK) {
        root[onClearState](param);
        delete root[pendingState];
      }
      next(action);
    };
  }
  return () => (next) => (action) => {
    const { type, [TARGET]: path, [PARAM]: param, [PUBLISH_NOW]: publishNow, } = action;
    if (path) {
      const trace = createTraceablePathProxy(root, path);
      const last = trace[trace.length-1];
      switch (type) {
        case SET_STATE:
          if (last.state instanceof Array || param instanceof Array) {
            throw new Error(`Target: "${path.join(', ')}"\nCannot call set state when state or parameter is Array`);
          }
          onProxySetState(last.identifier, param, last.state);
          last.state = { ...last.state, ...param, };
          break;
        case CLEAR_STATE:
          if (!path.length) {
            console.error('CLEAR_STATE should not be called on nonedux root level state, instead use setState, to avoid removing root level states');
          }
          onProxyClearState(last.identifier, param, last.state);
          last.state = param;
          break;
        case REMOVE:
          if (!path.length) {
            throw new Error(`Got invalid action: REMOVE ${param.join(', ')}, Cannot remove root level values ones set on initialState`);
          }
          if (last.state instanceof Array) {
            last.state = onProxyArrayRemove(last.identifier, param, last.state);
          } else {
            onProxyObjectRemove(last.identifier, param);
            const reducer = removeReducer.bind(new Set(param));
            last.state = entries(last.state).reduce(reducer, {});
          }
          break;
        default:
          throw new Error('Invalid action\n' + JSON.stringify({ type, path, param, }, null, 2));
      }
      state = createNextState(trace);
      if (publishNow) {
        root[propPrevState] = root[propState];
        root[propState] = state;
        state = root[propState];
      } else {
        root[pendingState] = state;
      }
    } else if (type === PUBLISH_CHANGES) {
      root[propPrevState] = root[propState];
      root[propState] = state;
      delete root[pendingState];
    } else if (type === ROLLBACK) {
      onProxyClearState(root[identity], param, root[pendingState]);
      delete root[pendingState];
    }
    next(action);
  };
}

function createTraceablePathLegacy(root, path) {
  let childState = root[pendingState] || root[propState];
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

function createTraceablePathProxy(root, path) {
  let state= root[pendingState] || root[propState];
  let identifier = root[identity];
  const list = [ { state, identifier, }, ];
  for (let i = path.length-1; i>=0; i--) {
    const key = path[i];
    identifier= identifier[key];
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
      if (Branch.couldBeParent(newState[k])) {
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
      if (Branch.couldBeParent(newState[k])) {
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
