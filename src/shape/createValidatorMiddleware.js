import { any, spec, } from './common';
import { SUB_REDUCER, SET_STATE, REMOVE, CLEAR_STATE, reducerPrivates, } from '../common';
import createValidator from './createValidator';
import validateState from './validateState';

const { propState, propPrevState, } = reducerPrivates;

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
  validateState(subject[propState], subject[propPrevState], subject.getIdentity(), shape);
  return () => (next) => (action) => {
    const result = next(action);
    const { type, [SUB_REDUCER]: path, } = action;
    if (path && triggerTypes.some(t => t === type)) {
      validateState(subject[propState], subject[propPrevState], [], shape);
    }
    return result;
  };
}