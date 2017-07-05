import { spec, } from './Validator';
import createValidator, { any, } from './createValidator';
import { naturalLeafTypes, checkers, } from './types';

const emptyShape = {
  [spec]: {
    name: 'Object',
    isRequired: false,
    strict: false,
  },
};
function stringify(obj) {
  try {
    return JSON.stringify(obj, null, 2);
  } catch (Exception) {
    return obj;
  }
}

export default function createValidatorMiddleware(subject, shape = emptyShape) {
  shape = createValidator(shape);
  validateRecursively(subject.state, subject.prevState, subject.getIdentity(), shape);
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
      validateRecursively(child.state, child.prevState, child.getIdentity(), subShape);
    }
    return result;
  };
}

const { keys, getPrototypeOf, } = Object;
const { error, } = console;
function validateRecursively(state, prevState, identity, shape) {
  const { [spec]: specification, [any]: anyK, ...children } = shape;
  const { name, strict, isRequired, } = specification || {};
  if (checkers[name](state)) {
    if (state && !naturalLeafTypes[getPrototypeOf(state).constructor.name]) {
      keys({ ...state, ...children, })
      .filter((k) => {
        try {
          return state[k] !== prevState[k];
        } catch (Exception) {
          return true;
        }
      })
      .forEach((k) => {
        if (strict && !shape[k] && !anyK) {
          error('"strict" validation failed:' +
            '\nAt: "'+identity.join(', ')+'"' +
            '\nNo validations for key: '+k+'' +
            '\nWith value: '+ stringify(state[k]));
        } else if (shape[k]) {
          if (shape[k][spec].isRequired && !state.hasOwnProperty(k)) {
            error('"isRequired" validation failed:' +
              '\nAt: '+identity.join(', ')+'"' +
              '\nIs missing value for key: '+k);
          } else {
            validateRecursively(
              state && state.hasOwnProperty(k) ? state[k] : undefined,
              prevState && prevState.hasOwnProperty(k) ? prevState[k] : undefined,
              [ ...identity, k, ],
              shape[k]
            );
          }
        } else if (anyK) {
          validateRecursively(
            state && state.hasOwnProperty(k) ? state[k] : undefined,
            prevState && prevState.hasOwnProperty(k) ? prevState[k] : undefined,
            [ ...identity, k, ],
            shape[any],
          );
        }
      });
    }
  } else if (isRequired || (state !== undefined && state!==null)) {
    error('Validation failed at "'+identity.join(', ')+'"\n' +
      'Expected: '+ name+'' +
      '\nisRequired: '+ isRequired + '' +
      '\nstrict: '+strict +
      '\nBut got '+stringify(state));
  }
}