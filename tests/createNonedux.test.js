import { createStoreWithNonedux, } from './utils';

describe('Create subject', () => {
  let root;
  test('should be able to reference children', () => {
    root = createStoreWithNonedux({ b: { c: 2, d: 3, e: { f: 4, }, }, });
    root.b.e.state;
  })

  test('should return 2 level initial values', () => {
    root = createStoreWithNonedux({ b: { c: 1, }, });
    expect(root.state).toEqual({ b: { c: 1, }, });
  });

  test('should return 3 level initial values', () => {
    root = createStoreWithNonedux({ b: { c: 2, d: 3, e: { f: 4, }, }, });
    expect(root.state).toEqual({ b: { c: 2, d: 3, e: { f: 4, }, }, });
  });
});
