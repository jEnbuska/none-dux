import { expect, } from 'chai';
import createStore from '../src/createStore';
import SubStoreLeaf from '../src/SubStoreLeaf';

describe('SubStoreLeaf', () => {
  it('creating store with SubStoreLeaf', () => {
    const store = createStore({ a: { b: new SubStoreLeaf({ c: 1, d: 2, }), }, });
    expect(store.state).to.deep.equal({ a: { b: { c: 1, d: 2, }, }, });
    expect(store.a.b).to.equal(undefined);
    expect(store.a.state).to.deep.equal({ b: { c: 1, d: 2, }, });
  });

  it('setState with SubStoreLeaf', () => {
    const store = createStore({ a: { b: {}, }, });
    expect(store.state).to.deep.equal({ a: { b: { }, }, });
    expect(store.a.b.state).to.deep.equal({});
    store.a.setState({ b: new SubStoreLeaf({ c: 1, d: 2, }), });
    expect(store.a.b).to.equal(undefined);
    expect(store.a.state).to.deep.equal({ b: { c: 1, d: 2, }, });
    store.a.setState({ e: new SubStoreLeaf({ f: 3, g: 4, }), });
    expect(store.a.b).to.equal(undefined);
    expect(store.a.e).to.equal(undefined);
    expect(store.a.state).to.deep.equal({ b: { c: 1, d: 2, }, e: { f: 3, g: 4, }, });
  });

  it('clearState with SubStoreLeaf', () => {
    const store = createStore({ a: { b: {}, c: 2, d: {}, }, });
    expect(store.state).to.deep.equal({ a: { b: {}, c: 2, d: {}, }, });
    expect(store.a.b.state).to.deep.equal({});
    store.a.clearState({ b: new SubStoreLeaf({ c: 1, d: 2, }), });
    expect(store.a.b).to.equal(undefined);
    expect(store.a.state).to.deep.equal({ b: { c: 1, d: 2, }, });
  });

  it('remove SubStoreLeaf', () => {
    const store = createStore({ a: { b: new SubStoreLeaf({ c: 1, d: 2, }), }, });
    store.a.remove('b');
    expect(store.a.state).to.deep.equal({})
  });
});
