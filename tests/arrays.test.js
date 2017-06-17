import { expect, } from 'chai';
import createStore from '../src/createStore';

describe('setState', () => {
  let store;
  it('sub state should stay as array', () => {
    store = createStore({ a: 1, });
    store.setState({ a: [ 1, 2, 3, ], });
    expect(store.state).to.deep.equal({ a: [ 1, 2, 3, ], });
  });

  it('sub should replace current array', () => {
    store = createStore({ a: 1, });
    store.setState({ a: [ 1, 2, { b: 2, }, ], });
    expect(store.state).to.deep.equal({ a: [ 1, 2, { b: 2, }, ], });
    store.setState({ a: [ 'abc', { test: 'empty', }, 2, 3, 4, ], });
    expect(store.state).to.deep.equal({ a: [ 'abc', { test: 'empty', }, 2, 3, 4, ], });
    store.setState({ a: [ 1, 2, [], ], });
    expect(store.state).to.deep.equal({ a: [ 1, 2, [], ], });
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

  it('erasing array state to object should merge the array into next state as object', () => {
    store = createStore([ 1, 2, { b: 2, }, ]);
    expect(store.state).to.deep.equal([ 1, 2, { b: 2, }, ]);
    store.setState({ 0: 'abc', obj: { test: 'empty', }, 2: '1b', x: 3, });
    expect(store.state).to.deep.equal({ 0: 'abc', 1: 2, obj: { test: 'empty', }, 2: '1b', x: 3, });
  });

  it('removing from array', () => {
    store = createStore([ 0, 1, 2, 3, 4, 5, 6, ]);
    store.remove(0, 2, 6);
    expect(store.state).to.deep.equal([ 1, 3, 4, 5, ]);
  });

  it('changing arrays objects', () => {
    store = createStore([ { a: { b: 2, }, }, 1, ]);
    store[0].a.setState({ b: 100, });
    expect(store.state).to.deep.equal([ { a: { b: 100, }, }, 1, ]);
  });
});
