import { reducerPrivates, PARAM, SUB_REDUCER, SET_STATE, CLEAR_STATE, REMOVE, } from '../common';

const { onRemove, onSetState, onClearState, propState, propPrevState, } = reducerPrivates;

export default function createReducer(root) {
  return function (_, { type, [SUB_REDUCER]: path, [PARAM]: param, }) {
    if (path) {
      const { child, childState, childList, } = createChildList(root, path);
      const tail = childList[childList.length-1];
      switch (type) {
        case SET_STATE:
          tail.state = child[onSetState](param, childState);
          break;
        case CLEAR_STATE:
          child[onClearState](param, childState);
          tail.state = param;
          break;
        case REMOVE:
          tail.state = child[onRemove](param, childState);
          break;
        default:
          console.error('Invalid action\n' + JSON.stringify({ type, path, param, }, null, 2));
          return this[propState];
      }
      this[propPrevState]= this[propState];
      this[propState] = createNextState(childList);
    }
    return this[propState];
  }.bind(root);
}

function createChildList(root, path) {
  let childState= root[propState];
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