
import createStore from '../src/createStore';

describe('arrays as state', () => {
  test('sub state should stay as array', () => {
    const store = createStore({ a: [ 1, 2, 3, ], });
    expect(store.state).toEqual({ a: [ 1, 2, 3, ], });
    expect(store.a.state[0]).toEqual(1);
  });

  test('remove from array in arbitrary order', () => {
    const store = createStore([ { a: 1, }, { b: 2, }, { c: 3, }, { d: 4, }, { e: 5, }, { f: 6, }, { g: 7, }, { h: 8, }, ]);
    store.remove(3, 1, 0, 7);
    expect(store.state).toEqual([ { c: 3, }, { e: 5, }, { f: 6, }, { g: 7, }, ]);
    expect(store[0].state).toEqual({ c: 3, });
    expect(store[1].state).toEqual({ e: 5, });
    expect(store[2].state).toEqual({ f: 6, });
    expect(store[3].state).toEqual({ g: 7, });
    expect(store[4]).toEqual(undefined);
    expect(store[5]).toEqual(undefined);
    expect(store[6]).toEqual(undefined);
    expect(store[7]).toEqual(undefined);
  });

  test('should replace current array sub state with a array', () => {
    const store = createStore({ a: [ 1, 2, { b: 2, }, ], });
    expect(store.state).toEqual({ a: [ 1, 2, { b: 2, }, ], });
    store.setState({ a: [ 'abc', { test: 'empty', }, 2, 3, 4, ], });
    expect(store.state).toEqual({ a: [ 'abc', { test: 'empty', }, 2, 3, 4, ], });
    expect(store.a[1].state.test).toEqual('empty');
    store.setState({ a: [ 1, 2, [], ], });
    expect(store.state).toEqual({ a: [ 1, 2, [], ], });
    expect(store.a.state).toEqual([ 1, 2, [], ]);
  });

  test('calling set state to array state should erase old array', () => {
    const store = createStore([]);
    store.setState([ 1, 2, { b: 2, }, ]);
    expect(store.state).toEqual([ 1, 2, { b: 2, }, ]);
    store.setState([ 'abc', { test: 'empty', }, 2, 3, 4, ]);
    expect(store.state).toEqual([ 'abc', { test: 'empty', }, 2, 3, 4, ]);
    store.setState([ 1, 2, [], ]);
    expect(store.state).toEqual([ 1, 2, [], ]);
  });

  test('kill old references', () => {
    const store = createStore([ 'abc', 1, { test: 'empty', }, { toBeRmd: 0, }, 3, 4, ]);
    expect(store.state).toEqual([ 'abc', 1, { test: 'empty', }, { toBeRmd: 0, }, 3, 4, ]);
    const fourth = store[3];
    store.setState([ 1, 2, [], ]);
    expect(store.state).toEqual([ 1, 2, [], ]);
    expect(fourth.__substore_parent__).toEqual(undefined);
    expect(store[3]).toEqual(undefined);
  });

  test('array to object should not merge', () => {
    const store = createStore([ { a: 1, }, { b: 2, }, { c: 3, }, ]);
    expect(store.state).toEqual([ { a: 1, }, { b: 2, }, { c: 3, }, ]);
    store.setState({ 0: { a: 1, }, obj: { test: 'empty', }, 2: '1b', x: 3, });
    expect(store.state).toEqual({ 0: { a: 1, }, obj: { test: 'empty', }, 2: '1b', x: 3, });
  });

  test('object to array should not merge', () => {
    const store = createStore({ 0: 1, 1: { b: 2, }, 2: { c: 3, }, });
    expect(store.state).toEqual({ 0: 1, 1: { b: 2, }, 2: { c: 3, }, });
    const last = store[2];
    store.setState([ 3, 2, ]);
    expect(store.state).toEqual([ 3, 2, ]);
    expect(last.state).toEqual(undefined);
    expect(last.prevState).toEqual({ c: 3, });
  });

  test('array to array should not merge', () => {
    const store = createStore([ 1, { a: 1, }, 3, 4, ]);
    expect(store.state).toEqual([ 1, { a: 1, }, 3, 4, ]);
    store.setState([ { x: 2, }, 2, ]);
    expect(store.state).toEqual([ { x: 2, }, 2, ]);
  });

  test('removing from array', () => {
    const store = createStore([ { a: 1, }, { b: 2, }, { c: 3, }, 3, 4, 5, 6, ]);
    store.remove(0, 2, 6);
    expect(store.state).toEqual([ { b: 2, }, 3, 4, 5, ]);
    expect(store.state[0]).toEqual({ b: 2, });
    expect(store.state[1]).toEqual(3);
    expect(store.state[2]).toEqual(4);
    expect(store.state[3]).toEqual(5);
  });

  test('arrays child removing self', () => {
    const store = createStore([ 0, 1, { toBeRemoved: 2, }, 3, { toBeKept: 4, }, 5, 6, ]);
    const third = store[2];
    third.removeSelf();
    expect(store.state).toEqual([ 0, 1, 3, { toBeKept: 4, }, 5, 6, ]);
    expect(third.state).toEqual(undefined);
    expect(third.prevState).toEqual({ toBeRemoved: 2, });
    expect(third.__substore_parent__).toEqual(undefined);
    expect(store.state[2]).toEqual(3);
    expect(store[3].state).toEqual({ toBeKept: 4, });
  });

  test('changing children of array', () => {
    const store = createStore([ { a: { b: 2, }, }, 1, ]);
    store[0].a.setState({ b: 100, });
    expect(store.state).toEqual([ { a: { b: 100, }, }, 1, ]);
  });

  test('leaf state to array', () => {
    {
      const store = createStore({ s: null, });
      expect(store.state.s).toEqual(null);
      store.setState({ s: [ 1, 2, { a: 3, }, ], });
      expect(store.s.state).toEqual([ 1, 2, { a: 3, }, ]);
    }
    {
      const store = createStore({ s: 0, });
      expect(store.state.s).toEqual(0);
      store.setState({ s: [ 1, 2, { a: 3, }, ], });
      expect(store.s.state).toEqual([ 1, 2, { a: 3, }, ]);
    }
    {
      const store = createStore({ s: /test/, });
      expect(store.state.s.toString()).toEqual('/test/');
      store.setState({ s: [ 1, 2, { a: 3, }, ], });
      expect(store.s.state).toEqual([ 1, 2, { a: 3, }, ]);
    }
    {
      const symbol = Symbol('test');
      const store = createStore({ s: symbol, });
      expect(store.state.s).toEqual(symbol);
      store.setState({ s: [ 1, 2, { a: 3, }, ], });
      expect(store.s.state).toEqual([ 1, 2, { a: 3, }, ]);
    }
  });

  test('array to leaf', () => {
    {
      const store = createStore({ content: [ 1, 2, { a: 3, }, ], });
      expect(store.state).toEqual({ content: [ 1, 2, { a: 3, }, ], });
      store.setState({ content: null, });
      expect(store.state.content).toEqual(null);
    }
    {
      const store = createStore({ content: [ 1, 2, { a: 3, }, ], });
      expect(store.state).toEqual({ content: [ 1, 2, { a: 3, }, ], });
      store.setState({ content: 0, });
      expect(store.state.content).toEqual(0);
    }
    {
      const store = createStore({ content: [ 1, 2, { a: 3, }, ], });
      expect(store.state).toEqual({ content: [ 1, 2, { a: 3, }, ], });
      store.setState({ content: /test/, });
      expect(store.state.content.toString()).toEqual('/test/');
    }
    {
      const store = createStore({ content: [ 1, 2, { a: 3, }, ], });

      expect(store.state).toEqual({ content: [ 1, 2, { a: 3, }, ], });
      const symbol = Symbol('test');
      store.setState({ content: symbol, });
      expect(store.state.content).toEqual(symbol);
    }
  });

  test('shift array values', () => {
    const store = createStore([ { a: 1, }, { b: 2, }, { c: 3, }, ]);
    expect(store.state).toEqual([ { a: 1, }, { b: 2, }, { c: 3, }, ]);
    const { 0: a, 1: b, 2: c, } = store;
    store.setState([ { c: 3, }, { a: 1, }, { b: 2, }, ]);
    expect(a.state).toEqual({ c: 3, });
    expect(b.state).toEqual({ a: 1, });
    expect(c.state).toEqual({ b: 2, });
    // This is unintuitive. Creating new stores every time store gets changed brings it's own challenges
  });

  test('prevState of SubStore remains the SubNodes own prevState when an index before gets removed', () => {
    const store = createStore([ { a: 1, }, { b: 2, }, { c: 3, }, ]);
    store[2].setState({ c: 4, });
    store.remove(1);
    expect(store[1].state).toEqual({ c: 4, });
    expect(store[1].prevState).toEqual({ c: 3, });
    // This is unintuitive. Creating new stores every time store gets changed brings it's own challenges
  });
});
