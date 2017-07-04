import nonedux from '../src/createNoneDux';

describe('Create subject', () => {
  let root;
  test('should be able to reference children', () => {
    root = nonedux({ b: { c: 2, d: 3, e: { f: 4, }, }, }).subject;
    root.b.e.state;
  })

  test('should return 2 level initial values', () => {
    root = nonedux({ b: { c: 1, }, }).subject;
    expect(root.state).toEqual({ b: { c: 1, }, });
  });

  test('should return 3 level initial values', () => {
    root = nonedux({ b: { c: 2, d: 3, e: { f: 4, }, }, }).subject;
    expect(root.state).toEqual({ b: { c: 2, d: 3, e: { f: 4, }, }, });
  });

});
