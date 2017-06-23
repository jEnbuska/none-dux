import { expect, } from 'chai';
import createStore from '../src/createStore';

describe('arrays as state', () => {
  it('sub state should stay as array', () => {
    const store = createStore({ a: [ 1, 2, 3, ], });
    expect(store.state).to.deep.equal({ a: [ 1, 2, 3, ], });
    expect(store.a.state[0]).to.equal(1);
  });

  it('remove from array in arbitrary order', () => {
    const store = createStore([ { a: 1, }, { b: 2, }, { c: 3, }, { d: 4, }, { e: 5, }, { f: 6, }, { g: 7, }, { h: 8, }, ]);
    store.remove(3, 1, 0, 7);
    expect(store.state).to.deep.equal([ { c: 3, }, { e: 5, }, { f: 6, }, { g: 7, }, ]);
    expect(store[0].state).to.deep.equal({ c: 3, });
    expect(store[1].state).to.deep.equal({ e: 5, });
    expect(store[2].state).to.deep.equal({ f: 6, });
    expect(store[3].state).to.deep.equal({ g: 7, });
    expect(store[4]).to.equal(undefined);
    expect(store[5]).to.equal(undefined);
    expect(store[6]).to.equal(undefined);
    expect(store[7]).to.equal(undefined);
  });

  it('should replace current array sub state with a array', () => {
    const store = createStore({ a: [ 1, 2, { b: 2, }, ], });
    expect(store.state).to.deep.equal({ a: [ 1, 2, { b: 2, }, ], });
    store.setState({ a: [ 'abc', { test: 'empty', }, 2, 3, 4, ], });
    expect(store.state).to.deep.equal({ a: [ 'abc', { test: 'empty', }, 2, 3, 4, ], });
    expect(store.a[1].state.test).to.equal('empty');
    store.setState({ a: [ 1, 2, [], ], });
    expect(store.state).to.deep.equal({ a: [ 1, 2, [], ], });
    expect(store.a.state).to.deep.equal([ 1, 2, [], ]);
  });

  it('calling set state to array state should erase old array', () => {
    const store = createStore([]);
    store.setState([ 1, 2, { b: 2, }, ]);
    expect(store.state).to.deep.equal([ 1, 2, { b: 2, }, ]);
    store.setState([ 'abc', { test: 'empty', }, 2, 3, 4, ]);
    expect(store.state).to.deep.equal([ 'abc', { test: 'empty', }, 2, 3, 4, ]);
    store.setState([ 1, 2, [], ]);
    expect(store.state).to.deep.equal([ 1, 2, [], ]);
  });

  it('kill old references', () => {
    const store = createStore([ 'abc', 1, { test: 'empty', }, { toBeRmd: 0, }, 3, 4, ]);
    expect(store.state).to.deep.equal([ 'abc', 1, { test: 'empty', }, { toBeRmd: 0, }, 3, 4, ]);
    const fourth = store[3];
    store.setState([ 1, 2, [], ]);
    expect(store.state).to.deep.equal([ 1, 2, [], ]);
    expect(fourth.__substore_parent__).to.equal(undefined);
    expect(store[3]).to.equal(undefined);
  });

  it('array to object should not merge', () => {
    const store = createStore([ { a: 1, }, { b: 2, }, { c: 3, }, ]);
    expect(store.state).to.deep.equal([ { a: 1, }, { b: 2, }, { c: 3, }, ]);
    store.setState({ 0: { a: 1, }, obj: { test: 'empty', }, 2: '1b', x: 3, });
    expect(store.state).to.deep.equal({ 0: { a: 1, }, obj: { test: 'empty', }, 2: '1b', x: 3, });
  });

  it('object to array should not merge', () => {
    const store = createStore({ 0: 1, 1: { b: 2, }, 2: { c: 3, }, });
    expect(store.state).to.deep.equal({ 0: 1, 1: { b: 2, }, 2: { c: 3, }, });
    const last = store[2];
    store.setState([ 3, 2, ]);
    expect(store.state).to.deep.equal([ 3, 2, ]);
    expect(last.state).to.equal(undefined);
    expect(last.prevState).to.deep.equal({ c: 3, });
  });

  it('array to array should not merge', () => {
    const store = createStore([ 1, { a: 1, }, 3, 4, ]);
    expect(store.state).to.deep.equal([ 1, { a: 1, }, 3, 4, ]);
    store.setState([ { x: 2, }, 2, ]);
    expect(store.state).to.deep.equal([ { x: 2, }, 2, ]);
  });

  it('removing from array', () => {
    const store = createStore([ { a: 1, }, { b: 2, }, { c: 3, }, 3, 4, 5, 6, ]);
    store.remove(0, 2, 6);
    expect(store.state).to.deep.equal([ { b: 2, }, 3, 4, 5, ]);
    expect(store.state[0]).to.deep.equal({ b: 2, });
    expect(store.state[1]).to.deep.equal(3);
    expect(store.state[2]).to.equal(4);
    expect(store.state[3]).to.equal(5);
  });

  it('arrays child removing self', () => {
    const store = createStore([ 0, 1, { toBeRemoved: 2, }, 3, { toBeKept: 4, }, 5, 6, ]);
    const third = store[2];
    third.removeSelf();
    expect(store.state).to.deep.equal([ 0, 1, 3, { toBeKept: 4, }, 5, 6, ]);
    expect(third.state).to.equal(undefined);
    expect(third.prevState).to.deep.equal({ toBeRemoved: 2, });
    expect(third.__substore_parent__).to.equal(undefined);
    expect(store.state[2]).to.equal(3);
    expect(store[3].state).to.deep.equal({ toBeKept: 4, });
  });

  it('changing children of array', () => {
    const store = createStore([ { a: { b: 2, }, }, 1, ]);
    store[0].a.setState({ b: 100, });
    expect(store.state).to.deep.equal([ { a: { b: 100, }, }, 1, ]);
  });

  it('leaf state to array', () => {
    {
      const store = createStore({ s: null, });
      expect(store.state.s).to.deep.equal(null);
      store.setState({ s: [ 1, 2, { a: 3, }, ], });
      expect(store.s.state).to.deep.equal([ 1, 2, { a: 3, }, ]);
    }
    {
      const store = createStore({ s: 0, });
      expect(store.state.s).to.deep.equal(0);
      store.setState({ s: [ 1, 2, { a: 3, }, ], });
      expect(store.s.state).to.deep.equal([ 1, 2, { a: 3, }, ]);
    }
    {
      const store = createStore({ s: /test/, });
      expect(store.state.s.toString()).to.equal('/test/');
      store.setState({ s: [ 1, 2, { a: 3, }, ], });
      expect(store.s.state).to.deep.equal([ 1, 2, { a: 3, }, ]);
    }
    {
      const symbol = Symbol('test');
      const store = createStore({ s: symbol, });
      expect(store.state.s).to.deep.equal(symbol);
      store.setState({ s: [ 1, 2, { a: 3, }, ], });
      expect(store.s.state).to.deep.equal([ 1, 2, { a: 3, }, ]);
    }
  });

  it('array to leaf', () => {
    {
      const store = createStore({ content: [ 1, 2, { a: 3, }, ], });
      expect(store.state).to.deep.equal({ content: [ 1, 2, { a: 3, }, ], });
      store.content.setState(null);
      expect(store.state.content).to.deep.equal(null);
    }
    {
      const store = createStore({ content: [ 1, 2, { a: 3, }, ], });
      expect(store.state).to.deep.equal({ content: [ 1, 2, { a: 3, }, ], });
      store.setState({ content: 0, });
      expect(store.state.content).to.deep.equal(0);
    }
    {
      const store = createStore([ 1, 2, { a: 3, }, ]);
      expect(store.state).to.deep.equal([ 1, 2, { a: 3, }, ]);
      store.setState(/test/);
      expect(store.state.toString()).to.deep.equal('/test/');
    }
    {
      const store = createStore([ 1, 2, { a: 3, }, ]);
      const symbol = Symbol('test');
      expect(store.state).to.deep.equal([ 1, 2, { a: 3, }, ]);
      store.setState(symbol);
      expect(store.state).to.deep.equal(symbol);
    }
  });

  it('shift array values', () => {
    const store = createStore([ { a: 1, }, { b: 2, }, { c: 3, }, ]);
    expect(store.state).to.deep.equal([ { a: 1, }, { b: 2, }, { c: 3, }, ]);
    const { 0: a, 1: b, 2: c, } = store;
    store.setState([ { c: 3, }, { a: 1, }, { b: 2, }, ]);
    expect(a.state).to.deep.equal({ c: 3, });
    expect(b.state).to.deep.equal({ a: 1, });
    expect(c.state).to.deep.equal({ b: 2, });
    // This is unintuitive. Creating new stores every time store gets changed brings it's own challenges
  });

  it('change identity when moved', () => {
    const store = createStore([ { a: 1, }, { b: 2, }, { c: 3, }, ]);
    store.remove(1);
    expect(store[1].getIdentity()).to.deep.equal([ 'root', 1, ]);
    // This is unintuitive. Creating new stores every time store gets changed brings it's own challenges
  });
});
