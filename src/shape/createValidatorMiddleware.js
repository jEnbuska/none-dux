import { any, spec, } from './common';
import { SUBJECT, SET_STATE, REMOVE, CLEAR_STATE, branchPrivates, } from '../common';
import createValidator from './createValidator';
import validateState from './validateState';

const { accessState, accessPrevState, } = branchPrivates;

const emptyShape = {
  [spec]: {
    name: 'Object',
    isRequired: false,
    strict: false,
  },
};

const triggerTypes = [ SET_STATE, REMOVE, CLEAR_STATE, ];
export default function createValidatorMiddleware(subject, shape = emptyShape) {
  shape = createValidator(shape);
  validateState(subject[accessState], subject[accessPrevState], subject.getIdentity(), shape);
  return () => (next) => (action) => {
    const result = next(action);
    const { type, [SUBJECT]: path, } = action;
    if (path && triggerTypes.some(t => t === type)) {
      validateState(subject[accessState], subject[accessPrevState], [], shape);
    }
    return result;
  };
}