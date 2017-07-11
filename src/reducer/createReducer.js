import { invalidReferenceHandler, PARAM, SUB_REDUCER, SET_STATE, CLEAR_STATE, REMOVE, } from '../common';

export default function createReducer(autoReducer) {
  return function (state, { type, [SUB_REDUCER]: path, [PARAM]: param, }) {
    if (path) {
      let child = this;
      let childState = state;
      const pathList = [ { state, }, ];
      for (let i = 0; i<path.length; i++) {
        const key = path[i];
        if (child = child[key]) {
          childState = childState[key];
          // TODO refactor unshift to push and remove KnotList reverse
          pathList.unshift({ key, child, state: childState, });
        } else {
          invalidReferenceHandler[type](path, param);
          return this.__autoreducer_state__;
        }
      }
      switch (type) {
        case SET_STATE:
          pathList[0].state = child.__applySetState(param, childState);
          break;
        case CLEAR_STATE:
          child.__applyClearState(param, childState);
          pathList[0].state = param;
          break;
        case REMOVE:
          pathList[0].state = child.__applyRemove(param, childState);
          break;
        default:
          console.error('Invalid action\n' + JSON.stringify({ type, path, param, }, null, 2));
          return this.__autoreducer_state__;
      }
      let previous = pathList[0];
      for (let i = 1; i<pathList.length; i++) {
        const { key, state: childState, } = previous;
        const current = pathList[i];
        const { state: parentState, } = current;
        if (parentState instanceof Array) {
          current.state= [
            ...parentState.slice(0, key),
            childState, ...parentState.slice(Number(key)+1, parentState.length),
          ];
        } else {
          current.state = { ...parentState, [key]: childState, };
        }
        previous = current;
      }
      this.__autoreducer_prevState__= this.__autoreducer_state__;
      this.__autoreducer_state__ = previous.state;
    }
    return this.__autoreducer_state__;
  }.bind(autoReducer);
}