import { expect, } from 'chai';
import createStore from '../src/createStore';

describe('remove', () => {
  let store;
  it('removing the root store should be ok',
    () => {
      store = createStore({ a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, x: { t: -1, }, j: { z: -0, }, }, }, }, });
      store.remove('a');
      expect(store.state).to.deep.equal({ b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, x: { t: -1, }, j: { z: -0, }, }, }, }, });
    });

  it('removing leaf from object',
    () => {
      store = createStore({ a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, x: { t: -1, }, j: { z: -0, }, }, }, }, });
      store.b.remove('d');
      expect(store.state).to.deep.equal({ a: 1, b: { c: 2, e: { f: 4, g: 7, h: { i: 100, x: { t: -1, }, j: { z: -0, }, }, }, }, });
    });

  it('the number of children should match the non removed children',
    () => {
      store = createStore({});
      store.setState({ a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, x: {}, j: { z: -0, }, }, }, }, });
      let children = store.getChildrenRecursively();
      expect(children.length).to.deep.equal(12);
      store.b.e.h.remove();
      children = store.getChildrenRecursively();
      expect(children.length).to.deep.equal(7);
    });

  it('remove sub object',
    () => {
      store = createStore({ a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, x: { t: -1, }, j: { z: -0, }, }, }, }, });
      store.b.e.h.remove('x');
      expect(store.state).to.deep.equal({ a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, j: { z: -0, }, }, }, }, });
      store.b.remove('d');
      store.remove('b');
      expect(store.state).to.deep.equal({ a: 1, });
    });

  it('should be able to remove an empty child',
    () => {
      store = createStore({ a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, x: {}, j: { z: -0, }, }, }, }, });
      store.b.e.h.remove('x');
      expect(store.state).to.deep.equal({ a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, j: { z: -0, }, }, }, }, });
    });

  it('should be able to remove undefined value',
    () => {
      store = createStore({ a: 1, b: { c: undefined, d: undefined, e: { f: 4, g: 7, }, }, });
      store.b.remove('d');
      expect(store.state).to.deep.equal({ a: 1, b: { c: undefined, e: { f: 4, g: 7, }, }, });
      store.b.c.remove();
      expect(store.state).to.deep.equal({ a: 1, b: { e: { f: 4, g: 7, }, }, });
    });

  it('should be able to remove multiple children at ones',
    () => {
      store = createStore({ a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, x: {}, j: { z: -0, }, }, }, }, });
      store.b.e.h.remove('x', 'j');
      expect(store.state).to.deep.equal({ a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, }, }, }, });
    });

  it('should be able to remove multiple children little by little',
    () => {
      store = createStore({ a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, x: { t: -1, }, j: { z: -0, }, }, }, }, });
      store.b.e.h.x.remove();
      expect(store.state).to.deep.equal({ a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, j: { z: -0, }, }, }, }, });
      store.b.d.remove();
      store.b.remove();
      expect(store.state).to.deep.equal({ a: 1, });
    });

  it('sub store should be removed',
    () => {
      store = createStore({ a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, x: { t: -1, }, j: { z: -0, }, }, }, }, });
      store.b.remove();
      expect(store.b).to.deep.equal(undefined);
      expect(store.state.b).to.deep.equal(undefined);
    });
});