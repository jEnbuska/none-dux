import { any, spec, } from './common';
import { ACCESS_CALLBACK, SUB_REDUCER, } from '../common';
import buildValidator from './buildValidator';
import validateState from './validateState';

const emptyShape = {
  [spec]: {
    name: 'Object',
    isRequired: false,
    strict: false,
  },
};

export default function createValidatorMiddleware(subject, shape = emptyShape) {
  shape = buildValidator(shape);
  validateState(subject.__autoreducer_state__, subject.__autoreducer_prevState__, subject.getIdentity(), shape);
  return () => (next) => (action) => {
    const result = next(action);
    const { [SUB_REDUCER]: path, [ACCESS_CALLBACK]: callback, } = action;
    if (path && !callback) {
      let child = subject;
      let subShape = shape;
      for (let i = 0; i<path.length; i++) {
        const nextSubShape = subShape[path[i]] || subShape[any];
        if (!nextSubShape) {
          break;
        }
        subShape = nextSubShape;
        child = child[path[i]];
      }
      validateState(child.__autoreducer_state__, child.__autoreducer_prevState__, child.getIdentity(), subShape);
    }
    return result;
  };
}