
import createStore from '../src/createStore';
import createLeaf from '../src/SubStoreLeaf';

describe('SubStoreLeaf', () => {
  test('creating store with SubStoreObjectLeaf', () => {
    const store = createStore({ a: { b: createLeaf({ c: 1, d: 2, }), }, });
    expect(store.state).toEqual({ a: { b: { c: 1, d: 2, }, }, });
    expect(store.a.b).toBe(undefined);
    expect(store.a.state).toEqual({ b: { c: 1, d: 2, }, });
  });

  test('creating store with SubStoreArrayLeaf', () => {
    const store = createStore({ a: { b: createLeaf([ 1, 2, 3, 4, ]), }, });
    expect(store.state).toEqual({ a: { b: [ 1, 2, 3, 4, ], }, });
    expect(store.a.state).toEqual({ b: [ 1, 2, 3, 4, ], });
    expect(store.a.b.state).toEqual([ 1, 2, 3, 4, ]);
    expect(store.a.b[0]).toBe(undefined);
  });

  test('setState with SubStoreObjectLeaf', () => {
    const store = createStore({ a: { b: {}, }, });
    expect(store.state).toEqual({ a: { b: { }, }, });
    expect(store.a.b.state).toEqual({});
    store.a.setState({ b: createLeaf({ c: 1, d: 2, }), });
    expect(store.a.b).toBe(undefined);
    expect(store.a.state).toEqual({ b: { c: 1, d: 2, }, });
    store.a.setState({ e: createLeaf({ f: 3, g: 4, }), });
    expect(store.a.b).toBe(undefined);
    expect(store.a.e).toBe(undefined);
    expect(store.a.state).toEqual({ b: { c: 1, d: 2, }, e: { f: 3, g: 4, }, });
  });

  test('clearState with SubStoreObjectLeaf', () => {
    const store = createStore({ a: { b: {}, c: 2, d: {}, }, });
    expect(store.state).toEqual({ a: { b: {}, c: 2, d: {}, }, });
    expect(store.a.b.state).toEqual({});
    store.a.clearState({ b: createLeaf({ c: 1, d: 2, }), });
    expect(store.a.b).toBe(undefined);
    expect(store.a.state).toEqual({ b: { c: 1, d: 2, }, });
  });

  test('remove SubStoreObjectLeaf', () => {
    const store = createStore({ a: { b: createLeaf({ c: 1, d: 2, }), }, });
    store.a.remove('b');
    expect(store.a.state).toEqual({});
  });

  test('Add Error type', () => {
    const err = new Error('some error');
    const store = createStore({ a: { err, }, });
    expect(store.a.err).toBe(undefined);
    expect(store.a.state.err).toEqual(err);
  });
});
