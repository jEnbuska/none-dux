import { spec, } from './Validator';
import createValidator, { any, } from './createValidator';
import { naturalLeafTypes, checkers, } from './types';

function stringify(obj) {
  try {
    return JSON.stringify(obj, null, 2);
  } catch (Exception) {
    return obj;
  }
}

let pending;
function performValidation() {
  if (pending) {
    pending();
  }
  pending=undefined;
}

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
  onTypeError: (isRequired, strict, type, state, identity) =>
    console.error('Validation failed at "'+identity.join(', ')+'"\n' +
    'Expected: '+ type+'' +
    '\nisRequired: '+ isRequired + '' +
    '\nstrict: '+strict +
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
  console.log(JSON.stringify({shape}, null, 2))
  subject.__substore_parent__._notifyUp = () => {
    performValidation();
  };
  validateRecursively(subject.state, subject.prevState, subject.getIdentity(), shape, true);
  return () => (next) => (action) => {
    const result = next(action);
    const { target, } = action;
    if (target) {
      let child = subject;
      let subShape = shape;
      for (let i = 0; i<target.length; i++) {
        subShape = subShape[target[i]];
        if (!subShape) {
          return result;
        }
        child = child[target[i]];
      }
      pending = () => validateRecursively(child.state, child.prevState, child.getIdentity(), subShape);
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
          return initial || state[k] !== prevState[k];
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
    onErrorHandlers.onTypeError(isRequired, strict, name, state, identity);
  }
}