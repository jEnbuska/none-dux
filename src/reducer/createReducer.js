import { invalidReferenceHandler, PARAM, SUB_REDUCER, SET_STATE, CLEAR_STATE, REMOVE, } from '../common';

export default function createReducer(autoReducer) {
  return function (_, { type, [SUB_REDUCER]: path, [PARAM]: param, }) {
    if (path) {
      let child = this;
      const targetPathList = [ child, ];
      for (let i = 0; i<path.length; i++) {
        child = child[path[i]];
        if (child) {
          targetPathList.push(child);
        } else {
          break;
        }
      }
      let changes = false;
      if (child) {
        switch (type) {
          case SET_STATE:
            child.__applySetState(param);
            changes=true;
            break;
          case CLEAR_STATE:
            child.__applyClearState(param);
            changes = true;
            break;
          case REMOVE:
            child.__applyRemove(param);
            changes = true;
            break;
          default:
            console.error('Invalid action\n' + JSON.stringify({ type, path, param, }, null, 2));
        }
        if (changes) {
          const reversed = targetPathList.reverse();
          let previous = child;
          for (let i = 1; i<reversed.length; i++) {
            const { __autoreducer_id__: childId, __autoreducer_state__: childState, } = previous;
            const current = reversed[i];
            const { __autoreducer_state__: parentState, } = current;
            current.__autoreducer_prevState__ = parentState;
            if (parentState instanceof Array) {
              current.__autoreducer_state__ = [
                ...parentState.slice(0, childId),
                childState, ...parentState.slice(Number(childId)+1, parentState.length),
              ];
            } else {
              current.__autoreducer_state__ = { ...parentState, [childId]: childState, };
            }
            previous = current;
          }
        }
      } else {
        invalidReferenceHandler[type](path, param);
      }
    }
    return this.__autoreducer_state__;
  }.bind(autoReducer);
}