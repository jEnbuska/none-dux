import { createStoreWithNonedux as init, } from './utils';
import { shape, } from '../src/';
import onErrorHandler from '../src/shape/shapeErrorHandler';

const { types, any, } = shape;
const { number, strict, isRequired, string, bool, } = types;

describe('Validator middleware', () => {
  let onStrictErrors;
  let onIsRequiredErrors;
  let onTypeErrors;

  beforeAll(() => {
    onErrorHandler.onTypeError = ((type, state, identity) => onTypeErrors.push({ type, state, identity, }));
    onErrorHandler.onStrictError = ((identity, key, state) => onStrictErrors.push({ identity, key, state, }));
    onErrorHandler.onRequiredError = ((identity, key) => onIsRequiredErrors.push({ identity, key, }));
  });
  beforeEach(() => {
    onStrictErrors = [];
    onIsRequiredErrors = [];
    onTypeErrors = [];
  });

  test('isRequired error on init', () => {
    init({ b: {}, }, { a: number.isRequired, });
    expect(onIsRequiredErrors.length).toBe(1);
    expect(onIsRequiredErrors[0]).toEqual({
      identity: [],
      key: 'a',
    });

    init({ b: {}, }, { a: { ...isRequired, }, });
    expect(onIsRequiredErrors.length).toBe(2);
    expect(onIsRequiredErrors[1]).toEqual({
      identity: [],
      key: 'a',
    });
    init({ b: {}, }, { a: [ isRequired, ], });
    expect(onIsRequiredErrors.length).toBe(3);
    expect(onIsRequiredErrors[2]).toEqual({
      identity: [],
      key: 'a',
    });

    init({ a: [ undefined, ], }, { a: [ number.isRequired, ], });
    expect(onIsRequiredErrors.length).toBe(4);
    expect(onIsRequiredErrors[3]).toEqual({
      identity: [ 'a', ],
      key: '0',
    });

    init({ a: [ undefined, ], }, { a: [ { ...isRequired, }, ], });
    expect(onIsRequiredErrors.length).toBe(5);
    expect(onIsRequiredErrors[4]).toEqual({
      identity: [ 'a', ],
      key: '0',
    });
    expect(onTypeErrors).toEqual([]);
    expect(onStrictErrors).toEqual([]);
  });

  test('strict error on init', () => {
    init({ a: 1, }, { ...strict, });
    expect(onStrictErrors.length).toBe(1);
    expect(onStrictErrors[0]).toEqual({
      identity: [],
      key: 'a',
      state: 1,
    });

    init({ a: { c: 2, }, }, { a: { ...strict, b: number, }, });
    expect(onStrictErrors.length).toBe(2);
    expect(onStrictErrors[1]).toEqual({
      identity: [ 'a', ],
      key: 'c',
      state: 2,
    });

    init({ a: { b: [ { d: 2, }, ], }, }, { a: { b: [ { ...strict, c: number, }, ], }, });
    expect(onStrictErrors.length).toBe(3);
    expect(onStrictErrors[2]).toEqual({
      identity: [ 'a', 'b', '0', ],
      key: 'd',
      state: 2,
    });
  });

  test('type error on init', () => {
    init({ a: 1, }, { a: string, });
    expect(onTypeErrors.length).toBe(1);
    expect(onTypeErrors[0]).toEqual({
      identity: [ 'a', ],
      type: 'String',
      state: 1,
    });
  });

  test('type error on init', () => {
    init({ a: 1, }, { a: {}, });
    expect(onTypeErrors.length).toBe(1);
    expect(onTypeErrors[0]).toEqual({
      identity: [ 'a', ],
      type: 'Object',
      state: 1,
    });
    init({ a: [ 'abc', ], }, { a: [ {}, ], });
    expect(onTypeErrors.length).toBe(2);
    expect(onTypeErrors[1]).toEqual({
      identity: [ 'a', '0', ],
      type: 'Object',
      state: 'abc',
    });

    init({ a: [ 'abc', ], }, { a: [ [], ], });
    expect(onTypeErrors.length).toBe(3);
    expect(onTypeErrors[2]).toEqual({
      identity: [ 'a', '0', ],
      type: 'Array',
      state: 'abc',
    });

    init({ a: [ [ [], ], ], }, { a: [ [ {}, ], ], });
    expect(onTypeErrors.length).toBe(4);
    expect(onTypeErrors[3]).toEqual({
      identity: [ 'a', '0', '0', ],
      type: 'Object',
      state: [],
    });

    init({ a: [ [ [], ], ], }, { a: [ isRequired, [ {}, ], ], });
    expect(onTypeErrors.length).toBe(5);
    expect(onTypeErrors[4]).toEqual({
      identity: [ 'a', '0', '0', ],
      type: 'Object',
      state: [],
    });

    init({ a: [ [ { b: 'abc', }, ], ], }, { a: [ isRequired, [ { ...isRequired, b: [], }, ], ], });
    expect(onTypeErrors.length).toBe(6);
    expect(onTypeErrors[5]).toEqual({
      identity: [ 'a', '0', '0', 'b', ],
      type: 'Array',
      state: 'abc',
    });

    init({ a: { b: [], }, }, { ...isRequired.strict, a: { ...isRequired.strict, b: number, }, });
    expect(onTypeErrors.length).toBe(7);
    expect(onTypeErrors[6]).toEqual({
      identity: [ 'a', 'b', ],
      type: 'Number',
      state: [],
    });
  });
  test('strict error on setState', () => {
    const { subject, } = init({ b: '', }, { ...strict, b: string, });
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
