import { TARGET, GET_STATE, GET_PREV_STATE, PARAM, PUBLISH_NOW, findChild, stateMapperPrivates, SET_STATE, CLEAR_STATE, REMOVE, PUBLISH_CHANGES, ROLLBACK, has, knotTree, poorSet } from '../common';
import StateMapper from './StateMapper';

const { role, dispatcher, onRemove, onSetState, onClearState, propState, propPrevState, pendingState, } = stateMapperPrivates;
const { removeChild, renameSelf } = knotTree;

const removeReducer = function (acc, e) {
  if (!this.has(e[0])) {
    acc[e[0]] = e[1];
  }
  return acc;
};

const { entries, } = Object;
export function createThunk(stateMapper) {
  return (store) => {
    stateMapper[dispatcher].dispatch = action => store.dispatch(action);
    return (next) => (action) => {
      if (typeof action === 'function') {
        return action(stateMapper, store);
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

export function createProxyStateChanged(root) {
  let state;
  return () => (next) => (action) => {
    const { type, [TARGET]: path, [PARAM]: param, [PUBLISH_NOW]: publishNow, } = action;
    if (path) {
      const list = createProxyChildList(root, path);
      const child = list[list.length-1];
      switch (type) {
        case SET_STATE:
          if (child.state instanceof Array || param instanceof Array) {
            throw new Error('Cannot call set state when state or parameter is Array');
          }
          onProxySetState(role, param, child.state);
          child.state = { ...child.state, ...param };
          break;
        case CLEAR_STATE: {
          onProxyClearState(child.identifier, param, child.state);
          child.state = param;
          break;
        }
        case REMOVE: {
          if (child.state instanceof Array) {
            child.state = onProxyArrayRemove(child.identifier, param, child.state);
          } else {
            onProxyRemove(child.identifier, param);
            const reducer = removeReducer.bind(new Set(param));
            child.state = entries(child.state).reduce(reducer, {});
          }
          break;
        }
        default:
          console.error('Invalid action\n' + JSON.stringify({ type, path, param, }, null, 2));
          return next(action);
      }
      state = createNextState(list);
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
      onProxyClearState(root[role], param, root[pendingState]);
      delete root[pendingState];
    }
    next(action);
  };
}

export function createLegacyStateChanger(root) {
  let state = root[propState];
  return () => (next) => (action) => {
    const { type, [TARGET]: path, [PARAM]: param, [PUBLISH_NOW]: publishNow, } = action;
    if (path) {
      const { child, childState, childList, } = createChildList(root, path);
      switch (type) {
        case SET_STATE:
          if (childState instanceof Array || param instanceof Array) {
            throw new Error('Cannot call set state when state or parameter is Array');
          }
          childList[childList.length-1].state = child[onSetState](param, childState);
          break;
        case CLEAR_STATE:
          child[onClearState](param, childState);
          if (!path.length) {
            console.error('CLEAR_STATE should not be called on nonedux root level state, instead use setState, to avoid removing root level states');
          }
          childList[childList.length-1].state = param;
          break;
        case REMOVE:
          if (!path.length) {
            throw new Error(`Got invalid action: REMOVE ${param.join(', ')}, Cannot remove root level values ones set on initialState`);
          }
          childList[childList.length-1].state = child[onRemove](param, childState);
          break;
        default:
          console.error('Invalid action\n' + JSON.stringify({ type, path, param, }, null, 2));
          return next(action);
      }
      state = createNextState(childList);
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

function createChildList(root, path) {
  let childState= root[pendingState] || root[propState];
  let child = root;
  const childList = [ { state: childState, child, }, ];
  for (let i = path.length-1; i>=0; i--) {
    const key = path[i];
    child = child[key];
    childState = childState[key];
    childList.push({ key, child, state: childState, });
  }
  return { childList, child, childState, };
}

function createProxyChildList(root, path) {
  let state= root[pendingState] || root[propState];
  let identifier = root[role];
  const list = [ { state, identifier }, ];
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

function onProxySetState(role, newState, prevState) {
  for (let k in newState) {
    k += '';
    if (role[k] && newState[k]!==prevState[k]) {
      if (StateMapper.couldBeParent(newState[k])) {
        onProxyClearState(role[k], newState[k], prevState[k]);
      } else {
        role[removeChild](k);
      }
    }
  }
}

function onProxyClearState(role, newState = {}, prevState = {}) {
  for (const k in role) {
    if (newState[k] !== prevState[k]) {
      if (StateMapper.couldBeParent(newState[k])) {
        onProxyClearState(role[k], newState[k], prevState[k]);
      } else {
        role[removeChild](k);
      }
    }
  }
}

function onProxyRemove(target, keys) {
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

