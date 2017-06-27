
import createStore from '../src/createStore';

describe('remove', () => {
  let store;
  test('removing the root store should be ok',
    () => {
      store = createStore({ a: {}, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, x: { t: -1, }, j: { z: -0, }, }, }, }, });
      store.remove('b');
      expect(store.state).toEqual({ a: {}, });
    });

  test('removing leaf from object',
    () => {
      store = createStore({ a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, x: { t: -1, }, j: { z: -0, }, }, }, }, });
      store.b.remove('d');
      expect(store.state).toEqual({ a: 1, b: { c: 2, e: { f: 4, g: 7, h: { i: 100, x: { t: -1, }, j: { z: -0, }, }, }, }, });
    });

  test('the number of children should match the non removed children',
    () => {
      store = createStore({});
      store.setState({ a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, x: {}, j: { z: -0, }, }, }, }, });
      let children = store.getChildrenRecursively();
      expect(children.length).toEqual(5);
      store.b.e.h.removeSelf();
      children = store.getChildrenRecursively();
      expect(children.length).toEqual(2);
    });

  test('remove sub object',
    () => {
      store = createStore({ a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, x: { t: -1, }, j: { z: -0, }, }, }, }, });
      store.b.e.h.remove('x');
      expect(store.state).toEqual({ a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, j: { z: -0, }, }, }, }, });
      store.b.remove('d');
      store.remove('b');
      expect(store.state).toEqual({ a: 1, });
    });

  test('should be able to remove an empty child',
    () => {
      store = createStore({ a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, x: {}, j: { z: -0, }, }, }, }, });
      store.b.e.h.remove('x');
      expect(store.state).toEqual({ a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, j: { z: -0, }, }, }, }, });
    });

  test('should be able to remove undefined value',
    () => {
      store = createStore({ a: 1, b: { c: undefined, d: undefined, e: { f: 4, g: 7, }, }, });
      store.b.remove('d');
      expect(store.state).toEqual({ a: 1, b: { c: undefined, e: { f: 4, g: 7, }, }, });
    });

  test('should be able to remove multiple children at ones',
    () => {
      store = createStore({ a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, x: {}, j: { z: -0, }, }, }, }, });
      store.b.e.h.remove('x', 'j');
      expect(store.state).toEqual({ a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, }, }, }, });
    });

  test('should be able to remove multiple children little by little',
    () => {
      store = createStore({ a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, x: { t: -1, }, j: { z: -0, }, }, }, }, });
      store.b.e.h.x.removeSelf();
      expect(store.state).toEqual({ a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, j: { z: -0, }, }, }, }, });
      store.b.e.h.removeSelf();
      store.b.e.removeSelf();
      expect(store.state).toEqual({ a: 1, b: { c: 2, d: 3, }, });
    });

  test('sub store should be removed',
    () => {
      store = createStore({ a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, x: { t: -1, }, j: { z: -0, }, }, }, }, });
      store.b.removeSelf();
      expect(store.b).toEqual(undefined);
      expect(store.state.b).toEqual(undefined);
    });

  test('state should be shift after removal',
    () => {
      store = createStore({ a: 1, b: { c: 'test', d: { x: 1, }, }, });
      const { b, } = store;
      const { d, } = store.b;
      b.removeSelf();
      expect(d.state).toBe(undefined);
      expect(d.prevState).toEqual({ x: 1, });
      expect(b.state).toBe(undefined);
      expect(b.prevState).toEqual({ c: 'test', d: { x: 1, }, });
    });
});