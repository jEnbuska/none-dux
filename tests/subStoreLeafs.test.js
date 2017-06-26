import { expect, } from 'chai';
import createStore from '../src/createStore';
import createLeaf from '../src/SubStoreLeaf';

describe('SubStoreLeaf', () => {
  it('creating store with SubStoreObjectLeaf', () => {
    const store = createStore({ a: { b: createLeaf({ c: 1, d: 2, }), }, });
    expect(store.state).to.deep.equal({ a: { b: { c: 1, d: 2, }, }, });
    expect(store.a.b).to.equal(undefined);
    expect(store.a.state).to.deep.equal({ b: { c: 1, d: 2, }, });
  });

  it('creating store with SubStoreArrayLeaf', () => {
    const store = createStore({ a: { b: createLeaf([ 1, 2, 3, 4, ]), }, });
    expect(store.state).to.deep.equal({ a: { b: [ 1, 2, 3, 4, ], }, });
    expect(store.a.state).to.deep.equal({ b: [ 1, 2, 3, 4, ], });
    expect(store.a.b.state).to.deep.equal([ 1, 2, 3, 4, ]);
    expect(store.a.b[0]).to.equal(undefined);
  });

  it('setState with SubStoreObjectLeaf', () => {
    const store = createStore({ a: { b: {}, }, });
    expect(store.state).to.deep.equal({ a: { b: { }, }, });
    expect(store.a.b.state).to.deep.equal({});
    store.a.setState({ b: createLeaf({ c: 1, d: 2, }), });
    expect(store.a.b).to.equal(undefined);
    expect(store.a.state).to.deep.equal({ b: { c: 1, d: 2, }, });
    store.a.setState({ e: createLeaf({ f: 3, g: 4, }), });
    expect(store.a.b).to.equal(undefined);
    expect(store.a.e).to.equal(undefined);
    expect(store.a.state).to.deep.equal({ b: { c: 1, d: 2, }, e: { f: 3, g: 4, }, });
  });

  it('clearState with SubStoreObjectLeaf', () => {
    const store = createStore({ a: { b: {}, c: 2, d: {}, }, });
    expect(store.state).to.deep.equal({ a: { b: {}, c: 2, d: {}, }, });
    expect(store.a.b.state).to.deep.equal({});
    store.a.clearState({ b: createLeaf({ c: 1, d: 2, }), });
    expect(store.a.b).to.equal(undefined);
    expect(store.a.state).to.deep.equal({ b: { c: 1, d: 2, }, });
  });

  it('remove SubStoreObjectLeaf', () => {
    const store = createStore({ a: { b: createLeaf({ c: 1, d: 2, }), }, });
    store.a.remove('b');
    expect(store.a.state).to.deep.equal({});
  });

  it('Add Error type', () => {
    const err = new Error('some error');
    const store = createStore({ a: { err, }, });
    expect(store.a.err).to.be.equal(undefined);
    expect(store.a.state.err).to.deep.equal(err);
  });
});
