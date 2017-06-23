import { expect, } from 'chai';
import createStore from '../src/createStore';

describe('immutability', () => {
  let store;
  it('previous states should not be changed',
    () => {
      store = createStore({ a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, x: { t: -1, }, j: { z: -0, }, }, }, }, });
      const { state: initialState, } = store;
      const { state: bInitialState, } = store.b;
      store.setState({ a: 2, });
      expect(initialState).to.not.be.deep.equal(store.state);
      expect(bInitialState).to.deep.equal(store.b.state);
    });

  it('store other children should remain unchanged',
    () => {
      store = createStore({ a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, x: { t: -1, }, j: { z: -0, }, }, }, }, });
      const { state: bInitialState, } = store.b;
      store.setState({ a: 2, })
      expect(bInitialState).to.deep.equal(store.b.state)
      expect(bInitialState===store.state.b);
    });

  it('changing deep state',
    () => {
      store = createStore({ a: 1, b: { c: 2, d: {}, e: { f: 4, g: 7, h: { i: 100, x: { t: -1, }, j: { z: -0, }, }, }, }, });
      const bOrg = store.b.state;
      const dOrg = store.b.d.state;
      const eOrg = store.b.e.state;
      const hOrg = store.b.e.h.state;
      store.setState({ b: { c: 3, d: {}, e: { f: 4, g: 7, h: { i: 101, x: { t: -1, }, j: { z: -0, }, }, }, }, });
      expect(store.b.state!==bOrg, 'b').to.be.ok;
      expect(store.b.d.state!==dOrg, 'd').to.be.ok;
      expect(store.b.e.state!==eOrg, 'e').to.be.ok;
      expect(store.b.e.h.state!==hOrg, 'h').to.be.ok;
    });

  it('changing deep state via children', () => {
    store = createStore({ a: 1, b: { c: 2, d: {}, e: { f: 4, g: 7, h: { i: 100, x: { t: -1, }, j: { z: -0, }, }, }, }, });
    const bOrg = store.b.state;
    const dOrg = store.b.d.state;
    const eOrg = store.b.e.state;
    const hOrg = store.b.e.h.state;

    const { b, } = store;
    b.setState({ c: 3, });
    b.e.h.setState({ i: 101, });

    expect(store.b.state!==bOrg, 'b').to.be.ok;
    expect(store.b.d.state===dOrg, 'd').to.be.ok;
    expect(store.b.e.state!==eOrg, 'e').to.be.ok;
    expect(store.b.e.h.state!==hOrg, 'h').to.be.ok;
  });
});