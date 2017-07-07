import { createStore, applyMiddleware, } from 'redux';
import ReducerParent from '../src/ReducerParent';
import { shape, } from '../src/';
import nonedux from '../src/createNonedux';
import { onErrorHandlers, } from '../src/shape/createValidatorMiddleware';

const { types, any, validatorMiddleware, } = shape;
const { number, strict, isRequired, string, bool, } = types;

ReducerParent.onDevSubStoreCreationError = () => {};

function onCreateStore(initialState, shape) {
  const { reducer, thunk, subject, } = nonedux(initialState);
  const createStoreWithMiddleware = applyMiddleware(...[ thunk, validatorMiddleware(subject, shape), ])(createStore);
  createStoreWithMiddleware(reducer);
  return subject;
}

describe('Validator middleware', () => {
  let onStrictErrors;
  let onIsRequiredErrors;
  let onTypeErrors;

  beforeAll(() => {
    onErrorHandlers.onTypeError = ((type, state, identity) => onTypeErrors.push({ type, state, identity, }));
    onErrorHandlers.onStrictError = ((identity, key, state) => onStrictErrors.push({ identity, key, state, }));
    onErrorHandlers.onRequiredError = ((identity, key) => onIsRequiredErrors.push({ identity, key, }));
  });

  beforeEach(() => {
    onStrictErrors = [];
    onIsRequiredErrors = [];
    onTypeErrors = [];
  });

  test('create store with validator', () => {
    expect(() => onCreateStore({})).not.toThrow();
  });

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
    expect(onTypeErrors).toEqual([]);
    expect(onStrictErrors).toEqual([]);
  });

  test('strict error on init', () => {
    onCreateStore({ a: 1, }, { ...strict, });
    expect(onStrictErrors.length).toBe(1);
    expect(onStrictErrors[0]).toEqual({
      identity: [],
      key: 'a',
      state: 1,
    });

    onCreateStore({ a: { c: 2, }, }, { a: { ...strict, b: number, }, });
    expect(onStrictErrors.length).toBe(2);
    expect(onStrictErrors[1]).toEqual({
      identity: [ 'a', ],
      key: 'c',
      state: 2,
    });

    onCreateStore({ a: { b: [ { d: 2, }, ], }, }, { a: { b: [ { ...strict, c: number, }, ], }, });
    expect(onStrictErrors.length).toBe(3);
    expect(onStrictErrors[2]).toEqual({
      identity: [ 'a', 'b', '0', ],
      key: 'd',
      state: 2,
    });
  });

  test('type error on init', () => {
    onCreateStore({ a: 1, }, { a: string, });
    expect(onTypeErrors.length).toBe(1);
    expect(onTypeErrors[0]).toEqual({
      identity: [ 'a', ],
      type: 'String',
      state: 1,
    });
  });

  test('type error on init', () => {
    onCreateStore({ a: 1, }, { a: {}, });
    expect(onTypeErrors.length).toBe(1);
    expect(onTypeErrors[0]).toEqual({
      identity: [ 'a', ],
      type: 'Object',
      state: 1,
    });
    onCreateStore({ a: [ 'abc', ], }, { a: [ {}, ], });
    expect(onTypeErrors.length).toBe(2);
    expect(onTypeErrors[1]).toEqual({
      identity: [ 'a', '0', ],
      type: 'Object',
      state: 'abc',
    });

    onCreateStore({ a: [ 'abc', ], }, { a: [ [], ], });
    expect(onTypeErrors.length).toBe(3);
    expect(onTypeErrors[2]).toEqual({
      identity: [ 'a', '0', ],
      type: 'Array',
      state: 'abc',
    });

    onCreateStore({ a: [ [ [], ], ], }, { a: [ [ {}, ], ], });
    expect(onTypeErrors.length).toBe(4);
    expect(onTypeErrors[3]).toEqual({
      identity: [ 'a', '0', '0', ],
      type: 'Object',
      state: [],
    });

    onCreateStore({ a: [ [ [], ], ], }, { a: [ isRequired, [ {}, ], ], });
    expect(onTypeErrors.length).toBe(5);
    expect(onTypeErrors[4]).toEqual({
      identity: [ 'a', '0', '0', ],
      type: 'Object',
      state: [],
    });

    onCreateStore({ a: [ [ { b: 'abc', }, ], ], }, { a: [ isRequired, [ { ...isRequired, b: [], }, ], ], });
    expect(onTypeErrors.length).toBe(6);
    expect(onTypeErrors[5]).toEqual({
      identity: [ 'a', '0', '0', 'b', ],
      type: 'Array',
      state: 'abc',
    });

    onCreateStore({ a: { b: [], }, }, { ...isRequired.strict, a: { ...isRequired.strict, b: number, }, });
    expect(onTypeErrors.length).toBe(7);
    expect(onTypeErrors[6]).toEqual({
      identity: [ 'a', 'b', ],
      type: 'Number',
      state: [],
    });
  });
  test('strict error on setState', () => {
    const subject = onCreateStore({ }, { ...strict, });
    expect(onStrictErrors.length).toBe(0);
    const { state, } = subject.setState({ a: 1, });
    expect(onStrictErrors.length).toBe(1);
    expect(onStrictErrors[0]).toEqual({
      identity: [],
      key: 'a',
      state: 1,
    });
  });
});
