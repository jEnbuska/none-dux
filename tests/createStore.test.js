
import createStore from '../src/createStore';

describe('Create store', () => {
  let root;
  test('should return 1 level initial values', () => {
    root = createStore({ a: 1, });
    expect(root.state).toEqual({ a: 1, });
  });

  test('should return 2 level initial values', () => {
    root = createStore({ a: 1, b: { c: 1, }, });
    expect(root.state).toEqual({ a: 1, b: { c: 1, }, });
  });

  test('should return 3 level initial values', () => {
    root = createStore({ a: 1, b: { c: 2, d: 3, e: { f: 4, }, }, });
    expect(root.state).toEqual({ a: 1, b: { c: 2, d: 3, e: { f: 4, }, }, });
  });
  test('should be able to reference children', () => {
    root = createStore({ a: 1, b: { c: 2, d: 3, e: { f: 4, }, }, });
    root.b.e;
  })
});
