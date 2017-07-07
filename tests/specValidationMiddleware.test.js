import { createStore, applyMiddleware, } from 'redux';
import ReducerParent from '../src/ReducerParent';
import { shape, } from '../src/';
import nonedux from '../src/createNonedux';
import { onErrorHandlers, } from '../src/shape/createValidatorMiddleware';

const { types, any, validatorMiddleware, } = shape;
console.log({ validatorMiddleware, });
const { number, strict, object, isRequired, string, bool, } = types;

ReducerParent.onDevSubStoreCreationError = () => {};

function onCreateStore(initialState, shape) {
  const { reducer, thunk, subject, } = nonedux(initialState);
  const createStoreWithMiddleware = applyMiddleware(...[ thunk, validatorMiddleware(subject, shape), ])(createStore);
  return createStoreWithMiddleware(reducer);
}

describe('Validator middleware', () => {
  let onStrictErrors;
  let onIsRequiredErrors;
  let onTypeErrors;

  beforeAll(() => {
    onErrorHandlers.onTypeError = ((isRequired, strict, type, state, identity) => onTypeErrors.push({ isRequired, strict, type, state, identity, }));
    onErrorHandlers.onStrictError = ((identity, key, state) => onStrictErrors.push({ identity, key, state, }));
    onErrorHandlers.onRequiredError = ((identity, key) => onIsRequiredErrors.push({ identity, key, }));
  });

  beforeEach(() => {
    onStrictErrors = [];
    onIsRequiredErrors = [];
    onTypeErrors = [];
  });
/*
  test('create store with validator', () => {
    expect(() => onCreateStore({})).not.toThrow();
  });
*/
  test('isRequired error on init', () => {
    onCreateStore({}, { a: number.isRequired, });
    expect(onIsRequiredErrors.length).toBe(1);
    expect(onIsRequiredErrors[0]).toEqual({
      identity: [],
      key: 'a',
    });

    onCreateStore({}, { a: { ...isRequired, }, });
    expect(onIsRequiredErrors.length).toBe(2);
    expect(onIsRequiredErrors[1]).toEqual({
      identity: [],
      key: 'a',
    });
    onCreateStore({}, { a: [ isRequired, ], });
    expect(onIsRequiredErrors.length).toBe(3);
    expect(onIsRequiredErrors[2]).toEqual({
      identity: [],
      key: 'a',
    });

    onCreateStore({ a: [ undefined, ], }, { a: [ number.isRequired, ], });
    expect(onIsRequiredErrors.length).toBe(4);
    expect(onIsRequiredErrors[3]).toEqual({
      identity: [ 'a', ],
      key: '0',
    });
    onCreateStore({ a: [ undefined, ], }, { a: [ { ...isRequired, }, ], });
    expect(onIsRequiredErrors.length).toBe(5);
    expect(onIsRequiredErrors[4]).toEqual({
      identity: [ 'a', ],
      key: '0',
    });
  });
});
