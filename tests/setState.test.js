
import createStore from '../src/createStore';

describe('setState', () => {
  let store;
  test('change root state', () => {
    store = createStore({ a: 1, });
    expect(store.state).toEqual({ a: 1, });
    store.setState({ a: 2, });
    expect(store.state).toEqual({ a: 2, });
  });

  test('add a new values', () => {
    store = createStore({ a: 1, b: { c: 2, d: 3, e: { f: 4, }, }, });
    store.setState({ x: 1, });
    expect(store.state).toEqual({ a: 1, b: { c: 2, d: 3, e: { f: 4, }, }, x: 1, });
  });

  test('leaf value to undefined', () => {
    store = createStore({ a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, }, }, });
    store.b.setState({ c: undefined, });
    expect(store.state).toEqual({ a: 1, b: { c: undefined, d: 3, e: { f: 4, g: 7, }, }, });
  });
  test('set leaf value to null', () => {
    store = createStore({ a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, }, }, });
    store.b.setState({ c: null, });
    expect(store.state).toEqual({ a: 1, b: { c: null, d: 3, e: { f: 4, g: 7, }, }, });
  });
  test('leaf into empty object', () => {
    store = createStore({});
    store.setState({ a: 1, });
    store.setState({ a: {}, });
    expect(store.state).toEqual({ a: {}, });
  });
  test('leaf into object', () => {
    store = createStore({});
    store.setState({ a: 1, b: { c: 2, d: 3, e: 1, }, });
    store.b.setState({ e: { x: 2, }, });
    expect(store.state).toEqual({ a: 1, b: { c: 2, d: 3, e: { x: 2, }, }, });
  });
  test('undefined leaf to object', () => {
    store = createStore({ a: 1, b: 'hello', c: { d: undefined, }, });
    store.c.setState({ d: { x: { y: 13, }, }, });
    expect(store.state).toEqual({ a: 1, b: 'hello', c: { d: { x: { y: 13, }, }, }, });
  });
  test('null  leaf into object', () => {
    store = createStore({});
    store.setState({ 1: 1, b: { c: 2, d: 3, e: null, }, });
    store.b.setState({ e: { x: 2, }, });
    expect(store.state).toEqual({ 1: 1, b: { c: 2, d: 3, e: { x: 2, }, }, });
    expect(store.state[1]).toEqual(1);
  });

  test('undefined leaf to string', () => {
    store = createStore({ a: 1, b: { c: undefined, d: 3, e: { f: 4, g: 7, h: { i: 100, x: {}, }, }, }, });
    store.setState({ b: { c: 'Hello test', }, });
    expect(store.state).toEqual({
      a: 1,
      b: { c: 'Hello test', },
    });
  });

  test('setState with a  primitive should throw error', () => {
    store = createStore({ a: 1, b: { c: undefined, d: 3, e: { f: 4, }, }, });
    expect(() => store.b.setState(2)).toThrow(Error);
  });

  test('immidiate string to empty object', () => {
    store = createStore({ a: 'hello', b: { c: undefined, d: 3, e: { f: 4, }, }, });
    store.setState({ a: {}, });
    expect(store.state).toEqual({ a: {}, b: { c: undefined, d: 3, e: { f: 4, }, }, });
  });

  test('immidiate string to non empty object', () => {
    store = createStore({ a: 'hello', b: { c: undefined, d: 3, e: { f: 4, }, }, });
    store.setState({ a: { b: 'world', }, });
    expect(store.state).toEqual({ a: { b: 'world', }, b: { c: undefined, d: 3, e: { f: 4, }, }, });
  });

  test('non immidiate string to empty object', () => {
    store = createStore({ b: { c: 'hello', d: 3, e: { f: 4, }, }, });
    store.setState({ b: { c: {}, }, });
    expect(store.state).toEqual({ b: { c: {}, }, });
  });

  test('non immidiate string to non empty object', () => {
    store = createStore({ b: { c: 'hello', d: 3, e: { f: 4, }, }, });
    store.setState({ b: { c: { x: 1, y: 'test', }, }, });
    expect(store.state).toEqual({ b: { c: { x: 1, y: 'test', }, }, });
  });
});
