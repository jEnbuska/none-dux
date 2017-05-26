import { expect, } from 'chai';
import createStore from '../src/createStore';

describe('immutability', () => {
  let store;
  it('previous states should not be changed',
    () => {
      store = createStore({ a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, x: { t: -1, }, j: { z: -0, }, }, }, }, });
      const { state: initialState, } = store;
      const { state: aInitialState, } = store.a;
      store.setState({ a: 2, });
      expect(initialState).to.not.be.deep.equal(store.state);
      expect(aInitialState).to.not.be.deep.equal(store.a.state);
    });

  it('store other children should remain unchanged',
    () => {
      store = createStore({ a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, x: { t: -1, }, j: { z: -0, }, }, }, }, });
      const { state: bInitialState, } = store.b;
      store.setState({ a: 2, });
      expect(bInitialState===store.b.state).to.be.ok;
    });

  it('changing deep state',
    () => {
      store = createStore({ a: 1, b: { c: 2, d: {}, e: { f: 4, g: 7, h: { i: 100, x: { t: -1, }, j: { z: -0, }, }, }, }, });
      const aOrg = store.a.state;
      const bOrg = store.b.state;
      const cOrg = store.b.c.state;
      const dOrg = store.b.d.state;
      const eOrg = store.b.e.state;
      const fOrg = store.b.e.f.state;
      const hOrg = store.b.e.h.state;
      const iOrg = store.b.e.h.i.state;
      store.setState({ b: { c: 3, d: {}, e: { f: 4, g: 7, h: { i: 101, x: { t: -1, }, j: { z: -0, }, }, }, }, });
      expect(store.a.state===aOrg, 'a').to.be.ok;
      expect(store.b.state!==bOrg, 'b').to.be.ok;
      expect(store.b.c.state!==cOrg, 'c').to.be.ok;
      expect(store.b.d.state!==dOrg, 'd').to.be.ok;
      expect(store.b.e.state!==eOrg, 'e').to.be.ok;
      expect(store.b.e.f.state===fOrg, 'f').to.be.ok;
      expect(store.b.e.h.state!==hOrg, 'h').to.be.ok;
      expect(store.b.e.h.i.state!==iOrg, 'i').to.be.ok;
    });

  it('changing deep state via children', () => {
    store = createStore({ a: 1, b: { c: 2, d: {}, e: { f: 4, g: 7, h: { i: 100, x: { t: -1, }, j: { z: -0, }, }, }, }, });
    const aOrg = store.a.state;
    const bOrg = store.b.state;
    const cOrg = store.b.c.state;
    const dOrg = store.b.d.state;
    const eOrg = store.b.e.state;
    const fOrg = store.b.e.f.state;
    const hOrg = store.b.e.h.state;
    const iOrg = store.b.e.h.i.state;

    const { b, } = store;
    b.setState({ c: 3, });
    b.e.h.setState({ i: 101, });

    expect(store.a.state===aOrg, 'a').to.be.ok;
    expect(store.b.state!==bOrg, 'b').to.be.ok;
    expect(store.b.c.state!==cOrg, 'c').to.be.ok;
    expect(store.b.d.state===dOrg, 'd').to.be.ok;
    expect(store.b.e.state!==eOrg, 'e').to.be.ok;
    expect(store.b.e.f.state===fOrg, 'f').to.be.ok;
    expect(store.b.e.h.state!==hOrg, 'h').to.be.ok;
    expect(store.b.e.h.i.state!==iOrg, 'i').to.be.ok;
  });
});