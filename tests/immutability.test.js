
import createStore from '../src/createStore';

describe('immutability', () => {
  let store;
  test('previous states should not be changed',
    () => {
      store = createStore({ a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, x: { t: -1, }, j: { z: -0, }, }, }, }, });
      const { state: initialState, } = store;
      const { state: bInitialState, } = store.b;
      store.setState({ a: 2, });
      expect(initialState).not.toEqual(store.state);
      expect(bInitialState).toEqual(store.b.state);
    });

  test('stores other children should remain unchanged',
    () => {
      store = createStore({ a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, x: { t: -1, }, j: { z: -0, }, }, }, }, });
      const { state: bInitialState, } = store.b;
      store.setState({ a: 2, });
      expect(bInitialState).toEqual(store.b.state);
      expect(bInitialState===store.state.b);
    });

  test('changing deep state',
    () => {
      store = createStore({ a: 1, b: { c: 2, d: {}, e: { f: 4, g: 7, h: { i: 100, x: { t: -1, }, j: { z: -0, }, }, }, }, });
      const bOrg = store.b.state;
      const dOrg = store.b.d.state;
      const eOrg = store.b.e.state;
      const hOrg = store.b.e.h.state;
      store.setState({ b: { c: 3, d: {}, e: { f: 4, g: 7, h: { i: 101, x: { t: -1, }, j: { z: -0, }, }, }, }, });
      expect(store.b.state!==bOrg, 'b').toBeTruthy();
      expect(store.b.d.state!==dOrg, 'd').toBeTruthy();
      expect(store.b.e.state!==eOrg, 'e').toBeTruthy();
      expect(store.b.e.h.state!==hOrg, 'h').toBeTruthy();
    });

  test('changing deep state by children', () => {
    store = createStore({ a: 1, b: { c: 2, d: {}, e: { f: 4, g: 7, h: { i: 100, x: { t: -1, }, j: { z: -0, }, }, }, }, });
    const bOrg = store.b.state;
    const dOrg = store.b.d.state;
    const eOrg = store.b.e.state;
    const hOrg = store.b.e.h.state;

    const { b, } = store;
    b.setState({ c: 3, });
    b.e.h.setState({ i: 101, });

    expect(store.b.state!==bOrg, 'b').toBeTruthy();
    expect(store.b.d.state===dOrg, 'd').toBeTruthy();
    expect(store.b.e.state!==eOrg, 'e').toBeTruthy();
    expect(store.b.e.h.state!==hOrg, 'h').toBeTruthy();
  });

  test('parameters passed to store should never mutate any values', () => {
    const initialState = { a: 1, b: { c: 2, d: { e: 3, }, }, };
    Object.defineProperty(initialState.b.d, 'e', {
      writable: false,
      value: initialState.b.d.e,
    });
    Object.defineProperty(initialState, 'a', {
      writable: false,
      value: initialState.a,
    });
    Object.defineProperty(initialState.b, 'c', {
      writable: false,
      value: initialState.b.c,
    });
    Object.defineProperty(initialState.b, 'd', {
      writable: false,
      value: initialState.b.d,
    });
    Object.defineProperty(initialState, 'b', {
      writable: false,
      value: initialState.b,
    });
    expect(() => initialState.b.d.e='').toThrow(Error);
    expect(() => initialState.b.d='').toThrow(Error);
    expect(() => initialState.b.c='').toThrow(Error);
    expect(() => initialState.b='').toThrow(Error);
    expect(() => initialState.a='').toThrow(Error);
    const store = createStore(initialState);
    const nextState = { a: 2, b: { c: { x: 1, }, d: 1, }, e: 3, };
    Object.defineProperty(nextState, 'a', {
      writable: false,
      value: nextState.a,
    });
    Object.defineProperty(nextState, 'e', {
      writable: false,
      value: nextState.e,
    });
    Object.defineProperty(nextState.b.c, 'x', {
      writable: false,
      value: nextState.b.c.x,
    });
    Object.defineProperty(nextState.b, 'd', {
      writable: false,
      value: nextState.b.d,
    });
    Object.defineProperty(nextState.b, 'c', {
      writable: false,
      value: nextState.b.c,
    });
    Object.defineProperty(nextState, 'b', {
      writable: false,
      value: nextState.b,
    });
    expect(() => nextState.a='').toThrow(Error);
    expect(() => nextState.e='').toThrow(Error);
    expect(() => nextState.b.c.x='').toThrow(Error);
    expect(() => nextState.b.d='').toThrow(Error);
    expect(() => nextState.b='').toThrow(Error);
    store.setState(nextState);

    Object.defineProperty(store.state.b.c, 'x', {
      writable: false,
      value: store.state.b.c.x,
    });
    Object.defineProperty(store.state.b, 'c', {
      writable: false,
      value: store.state.b.c,
    });
    Object.defineProperty(store.state, 'b', {
      writable: false,
      value: store.state.b,
    });
    store.b.c.remove('x');

    Object.defineProperty(store.state, 'e', {
      writable: false,
      value: store.state.e,
    });
    store.remove('e');

    Object.defineProperty(store.state.b.c, 'x', {
      writable: false,
      value: store.state.b.c.x,
    });
    Object.defineProperty(store.state.b, 'd', {
      writable: false,
      value: store.state.b.d,
    });
    Object.defineProperty(store.state.b, 'c', {
      writable: false,
      value: store.state.b.c,
    });
    Object.defineProperty(store.state, 'b', {
      writable: false,
      value: store.state.b,
    });
    store.setState({ b: { c: 1, }, });
  });
});