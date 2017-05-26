import { expect, } from 'chai';
import createStore from '../src/createStore';

describe('Create simple store', () => {
  let root;
  it('should return 1 level initial values', () => {
    root = createStore({ a: 1, });
    expect(root.state).to.deep.equal({ a: 1, });
  });

  it('should return 2 level initial values', () => {
    root = createStore({ a: 1, b: { c: 1, }, });
    expect(root.state).to.deep.equal({ a: 1, b: { c: 1, }, });
  });

  it('should return 3 level initial values', () => {
    root = createStore({ a: 1, b: { c: 2, d: 3, e: { f: 4, }, }, });
    expect(root.state).to.deep.equal({ a: 1, b: { c: 2, d: 3, e: { f: 4, }, }, });
  });
  it('should be able to reference children', () => {
    root = createStore({ a: 1, b: { c: 2, d: 3, e: { f: 4, }, }, });
    root.b.c;

  })
});
