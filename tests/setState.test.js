import { ReducerParent, }from '../src/createNoneDux';

describe('setState', () => {
  let subject;
  test('change root state', () => {
    subject = new ReducerParent({ a: 1, }).subject;
    expect(subject.state).toEqual({ a: 1, });
    subject._onSetState({ a: 2, });
    expect(subject.state).toEqual({ a: 2, });
  });

  test('add a new values', () => {
    subject = new ReducerParent({ a: 1, b: { c: 2, d: 3, e: { f: 4, }, }, }).subject;
    subject._onSetState({ x: 1, });
    expect(subject.state).toEqual({ a: 1, b: { c: 2, d: 3, e: { f: 4, }, }, x: 1, });
  });

  test('leaf value to undefined', () => {
    subject = new ReducerParent({ a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, }, }, }).subject;
    subject.b._onSetState({ c: undefined, });
    expect(subject.state).toEqual({ a: 1, b: { c: undefined, d: 3, e: { f: 4, g: 7, }, }, });
  });
  test('set leaf value to null', () => {
    subject = new ReducerParent({ a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, }, }, }).subject;
    subject.b._onSetState({ c: null, });
    expect(subject.state).toEqual({ a: 1, b: { c: null, d: 3, e: { f: 4, g: 7, }, }, });
  });
  test('leaf into empty object', () => {
    subject = new ReducerParent({}).subject;
    subject._onSetState({ a: 1, });
    subject._onSetState({ a: {}, });
    expect(subject.state).toEqual({ a: {}, });
  });
  test('leaf into object', () => {
    subject = new ReducerParent({}).subject;
    subject._onSetState({ a: 1, b: { c: 2, d: 3, e: 1, }, });
    subject.b._onSetState({ e: { x: 2, }, });
    expect(subject.state).toEqual({ a: 1, b: { c: 2, d: 3, e: { x: 2, }, }, });
  });
  test('undefined leaf to object', () => {
    subject = new ReducerParent({ a: 1, b: 'hello', c: { d: undefined, }, }).subject;
    subject.c._onSetState({ d: { x: { y: 13, }, }, });
    expect(subject.state).toEqual({ a: 1, b: 'hello', c: { d: { x: { y: 13, }, }, }, });
  });
  test('null  leaf into object', () => {
    subject = new ReducerParent({}).subject;
    subject._onSetState({ 1: 1, b: { c: 2, d: 3, e: null, }, });
    subject.b._onSetState({ e: { x: 2, }, });
    expect(subject.state).toEqual({ 1: 1, b: { c: 2, d: 3, e: { x: 2, }, }, });
    expect(subject.state[1]).toEqual(1);
  });

  test('undefined leaf to string', () => {
    subject = new ReducerParent({ a: 1, b: { c: undefined, d: 3, e: { f: 4, g: 7, h: { i: 100, x: {}, }, }, }, }).subject;
    subject._onSetState({ b: { c: 'Hello test', }, });
    expect(subject.state).toEqual({
      a: 1,
      b: { c: 'Hello test', },
    });
  });

  test('setState with a  primitive should throw error', () => {
    subject = new ReducerParent({ a: 1, b: { c: undefined, d: 3, e: { f: 4, }, }, }).subject;
    expect(() => subject.b._onSetState(2)).toThrow(Error);
  });

  test('immidiate string to empty object', () => {
    subject = new ReducerParent({ a: 'hello', b: { c: undefined, d: 3, e: { f: 4, }, }, }).subject;
    subject._onSetState({ a: {}, });
    expect(subject.state).toEqual({ a: {}, b: { c: undefined, d: 3, e: { f: 4, }, }, });
  });

  test('immidiate string to non empty object', () => {
    subject = new ReducerParent({ a: 'hello', b: { c: undefined, d: 3, e: { f: 4, }, }, }).subject;
    subject._onSetState({ a: { b: 'world', }, });
    expect(subject.state).toEqual({ a: { b: 'world', }, b: { c: undefined, d: 3, e: { f: 4, }, }, });
  });

  test('non immidiate string to empty object', () => {
    subject = new ReducerParent({ b: { c: 'hello', d: 3, e: { f: 4, }, }, }).subject;
    subject._onSetState({ b: { c: {}, }, });
    expect(subject.state).toEqual({ b: { c: {}, }, });
  });

  test('non immidiate string to non empty object', () => {
    subject = new ReducerParent({ b: { c: 'hello', d: 3, e: { f: 4, }, }, }).subject;
    subject._onSetState({ b: { c: { x: 1, y: 'test', }, }, });
    expect(subject.state).toEqual({ b: { c: { x: 1, y: 'test', }, }, });
  });
});
