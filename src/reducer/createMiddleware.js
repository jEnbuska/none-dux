import { TARGET, GET_STATE, GET_PREV_STATE, PARAM, PUBLISH_NOW, findChild, stateMapperPrivates, SET_STATE, CLEAR_STATE, REMOVE, PUBLISH_CHANGES, ROLLBACK, } from '../common';

const { dispatcher, onRemove, onSetState, onClearState, propState, propPrevState, pendingState, } = stateMapperPrivates;

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

export function createStateChanged(root) {
  let state = root[propState];
  return () => (next) => (action) => {
    const { type, [TARGET]: path, [PARAM]: param, [PUBLISH_NOW]: publishNow, } = action;
    if (path) {
      const { child, childState, childList, } = createChildList(root, path);
      switch (type) {
        case SET_STATE:
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