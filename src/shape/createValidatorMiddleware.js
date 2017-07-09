import { any, spec, } from './common';
import { SUB_REDUCER, SET_STATE, REMOVE, CLEAR_STATE, } from '../common';
import buildValidator from './buildValidator';
import validateState from './validateState';

const emptyShape = {
  [spec]: {
    name: 'Object',
    isRequired: false,
    strict: false,
  },
};

const typesOfInterres = [ SET_STATE, REMOVE, CLEAR_STATE, ];
export default function createValidatorMiddleware(subject, shape = emptyShape) {
  shape = buildValidator(shape);
  validateState(subject.__autoreducer_state__, subject.__autoreducer_prevState__, subject.getIdentity(), shape);
  return () => (next) => (action) => {
    const result = next(action);
    const { type, [SUB_REDUCER]: path, } = action;
    if (path && typesOfInterres.some(t => t === type)) {
      let currentState= subject.state;
      let child = subject;
      let prevState = subject.prevState;
      let subShape = shape;
      for (let i = 0; i<path.length; i++) {
        const key = path[i];
        const nextSubShape = subShape[key] || subShape[any];
        if (!nextSubShape) {
          break;
        }
        subShape = nextSubShape;
        currentState = currentState[key];
        prevState = prevState && prevState[key];
        child = child[key];
      }
      validateState(currentState, prevState, child.getIdentity(), subShape);
    }
    return result;
  };
}