import { expect, } from 'chai';
import createStore from '../src/createStore';

describe('arrays as state', () => {
  let store;

  it('sub state should stay as array', () => {
    store = createStore({ a: [ 1, 2, 3, ], });
    expect(store.state).to.deep.equal({ a: [ 1, 2, 3, ], });
    expect(store.a[0].state).to.equal(1);
  });

  it('remove from array in arbitrary order', () => {
    store = createStore([ 1, 2, 3, 4, 5, 6, 7, 8, ]);
    store.remove(3, 1, 0, 7);
    expect(store.state).to.deep.equal([ 3, 5, 6, 7, ]);
    expect(store[0].state).to.equal(3);
    expect(store[1].state).to.equal(5);
    expect(store[2].state).to.equal(6);
    expect(store[3].state).to.equal(7);
    expect(store[4]).to.equal(undefined);
    expect(store[5]).to.equal(undefined);
    expect(store[6]).to.equal(undefined);
    expect(store[7]).to.equal(undefined);
  });

  it('should replace current array sub state with a array', () => {
    store = createStore({ a: [ 1, 2, { b: 2, }, ], });
    expect(store.state).to.deep.equal({ a: [ 1, 2, { b: 2, }, ], });
    store.setState({ a: [ 'abc', { test: 'empty', }, 2, 3, 4, ], });
    expect(store.state).to.deep.equal({ a: [ 'abc', { test: 'empty', }, 2, 3, 4, ], });
    expect(store.a[1].test.state).to.equal('empty');
    store.setState({ a: [ 1, 2, [], ], });
    expect(store.state).to.deep.equal({ a: [ 1, 2, [], ], });
    expect(store.a.state).to.deep.equal([ 1, 2, [], ]);
  });

  it('calling set state to array state should erase old array', () => {
    store = createStore([]);
    store.setState([ 1, 2, { b: 2, }, ]);
    expect(store.state).to.deep.equal([ 1, 2, { b: 2, }, ]);
    store.setState([ 'abc', { test: 'empty', }, 2, 3, 4, ]);
    expect(store.state).to.deep.equal([ 'abc', { test: 'empty', }, 2, 3, 4, ]);
    store.setState([ 1, 2, [], ]);
    expect(store.state).to.deep.equal([ 1, 2, [], ]);
  });

  it('kill old references', () => {
    store = createStore([ 'abc', { test: 'empty', }, 2, 3, 4, ]);
    expect(store.state).to.deep.equal([ 'abc', { test: 'empty', }, 2, 3, 4, ]);
    const fourth = store[3];
    store.setState([ 1, 2, [], ]);
    expect(store.state).to.deep.equal([ 1, 2, [], ]);
    expect(fourth._parent).to.equal(undefined);
    expect(store[3]).to.equal(undefined);
  });

  it('array to object should not merge', () => {
    store = createStore([ 1, 2, { b: 2, }, ]);
    expect(store.state).to.deep.equal([ 1, 2, { b: 2, }, ]);
    store.setState({ 0: 'abc', obj: { test: 'empty', }, 2: '1b', x: 3, });
    expect(store.state).to.deep.equal({ 0: 'abc', obj: { test: 'empty', }, 2: '1b', x: 3, });
  });

  it('object to array should not merge', () => {
    store = createStore({ 0: 1, 1: 'b', 2: { c: 3, }, });
    expect(store.state).to.deep.equal({ 0: 1, 1: 'b', 2: { c: 3, }, });
    store.setState([ 3, 2, ]);
    expect(store.state).to.deep.equal([ 3, 2, ]);
  });

  it('array to array should not merge', () => {
    store = createStore([ 1, 2, 3, 4, ]);
    expect(store.state).to.deep.equal([ 1, 2, 3, 4, ]);
    store.setState([ 3, 2, ]);
    expect(store.state).to.deep.equal([ 3, 2, ]);
  });

  it('removing from array', () => {
    store = createStore([ 0, 1, 2, 3, 4, 5, 6, ]);
    store.remove(0, 2, 6);
    expect(store.state).to.deep.equal([ 1, 3, 4, 5, ]);
    expect(store[0].state).to.equal(1);
    expect(store[1].state).to.equal(3);
    expect(store[2].state).to.equal(4);
    expect(store[3].state).to.equal(5);
  });

  it('arrays child removing self', () => {
    store = createStore([ 0, 1, 2, 3, 4, 5, 6, ]);
    const third = store[2];
    third.removeSelf();
    expect(store.state).to.deep.equal([ 0, 1, 3, 4, 5, 6, ]);
    expect(third._parent).to.equal(undefined);
    expect(store[2].state).to.equal(3);
  });

  it('changing children of array', () => {
    store = createStore([ { a: { b: 2, }, }, 1, ]);
    store[0].a.setState({ b: 100, });
    expect(store.state).to.deep.equal([ { a: { b: 100, }, }, 1, ]);
  });

  it('leaf state to array', () => {
    let s = createStore({ s: null, }).s;
    expect(s.state).to.deep.equal(null);
    s.setState([ 1, 2, { a: 3, }, ]);
    expect(s.state).to.deep.equal([ 1, 2, { a: 3, }, ]);
    s = createStore({ s: 0, }).s;
    expect(s.state).to.deep.equal(0);
    s.setState([ 1, 2, { a: 3, }, ]);
    expect(s.state).to.deep.equal([ 1, 2, { a: 3, }, ]);
    s = createStore({ s: /test/, }).s;
    expect(s.state.toString()).to.deep.equal('/test/');
    s.setState([ 1, 2, { a: 3, }, ]);
    expect(s.state).to.deep.equal([ 1, 2, { a: 3, }, ]);
    const symbol = Symbol('test');
    s = createStore({ s: symbol, }).s;
    expect(s.state).to.deep.equal(symbol);
    s.setState([ 1, 2, { a: 3, }, ]);
    expect(s.state).to.deep.equal([ 1, 2, { a: 3, }, ]);
  });

  it('array to leaf', () => {
    let store = createStore([ 1, 2, { a: 3, }, ]);
    expect(store.state).to.deep.equal([ 1, 2, { a: 3, }, ]);
    store.setState(null);
    expect(store.state).to.deep.equal(null);
    store = createStore([ 1, 2, { a: 3, }, ]);
    expect(store.state).to.deep.equal([ 1, 2, { a: 3, }, ]);
    store.setState(0);
    expect(store.state).to.deep.equal(0);
    store = createStore([ 1, 2, { a: 3, }, ]);
    expect(store.state).to.deep.equal([ 1, 2, { a: 3, }, ]);
    store.setState(/test/);
    expect(store.state.toString()).to.deep.equal('/test/');

    store = createStore([ 1, 2, { a: 3, }, ]);
    const symbol = Symbol('test');
    expect(store.state).to.deep.equal([ 1, 2, { a: 3, }, ]);
    store.setState(symbol);
    expect(store.state).to.deep.equal(symbol);
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
