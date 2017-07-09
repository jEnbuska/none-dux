import { spec, } from './Validator';
import createValidator, { any, } from './createValidator';
import { naturalLeafTypes, checkers, } from './types';
import { stringify, } from '../common';

export const onErrorHandlers = {
  onStrictError: (identity, key, state) =>
    console.error('"strict" validation failed:' +
    '\nAt: "'+identity.join(', ')+'"' +
    '\nNo validations for key: '+key +'' +
    '\nWith value: '+ stringify(state)),
  onRequiredError: (identity, key) =>
    console.error('"isRequired" validation failed:' +
    '\nAt: '+identity.join(', ')+'"' +
    '\nIs missing value for key: '+key),
  onTypeError: (type, state, identity) =>
    console.error('Validation failed at "'+identity.join(', ')+'"\n' +
    'Expected: '+ type+'' +
    '\nBut got '+stringify(state)),
};

const emptyShape = {
  [spec]: {
    name: 'Object',
    isRequired: false,
    strict: false,
  },
};

export default function createValidatorMiddleware(subject, shape = emptyShape) {
  shape = createValidator(shape);
  validateRecursively(subject.__autoreducer_state__, subject.__autoreducer_prevState__, subject.getIdentity(), shape);
  return () => (next) => (action) => {
    const result = next(action);
    const { target, callback, } = action;
    if (target && !callback) {
      let child = subject;
      let subShape = shape;
      for (let i = 0; i<target.length; i++) {
        const nextSubShape = subShape[target[i]] || subShape[any];
        if (!nextSubShape) {
          break;
        }
        subShape = nextSubShape;
        child = child[target[i]];
      }
      validateRecursively(child.__autoreducer_state__, child.__autoreducer_prevState__, child.getIdentity(), subShape);
    }
    return result;
  };
}

const { keys, getPrototypeOf, } = Object;
function validateRecursively(state, prevState, identity, shape, initial) {
  const { [spec]: specification, [any]: _, ...children } = shape;
  const { name, strict, isRequired, } = specification || {};
  if (checkers[name](state)) {
    if (state && !naturalLeafTypes[getPrototypeOf(state).constructor.name]) {
      keys({ ...state, ...children, })
      .filter((k) => {
        try {
          return initial || !prevState || state[k] !== prevState[k] || !prevState.hasOwnProperty(k);
        } catch (Exception) {
          return true;
        }
      })
      .forEach((k) => {
        const subShape = shape[k] || shape[any];
        if (!subShape && strict) {
          onErrorHandlers.onStrictError(identity, k, state[k]);
        } else if (subShape) {
          if (state[k] === null || state[k] === undefined) {
            if (subShape[spec].isRequired) {
              onErrorHandlers.onRequiredError(identity, k);
            }
          } else {
            validateRecursively(
              state[k],
              prevState && prevState.hasOwnProperty(k) ? prevState[k] : undefined,
              [ ...identity, k, ],
              subShape,
              initial,
            );
          }
        }
      });
    }
  } else {
    onErrorHandlers.onTypeError(name, state, identity);
  }
}