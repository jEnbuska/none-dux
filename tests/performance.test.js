
import createStore from '../src/createStore';
import SubStore from '../src/SubStore';
import { data, data2, } from './resources';

const { keys, } = Object;
describe('performance', () => {
  test('performance simple', function () {
    const even = data;
    const odd = data2;
    const firstCompany = keys(even.companies)[0];
    const firstChildOdd = keys(odd)[0];
    const root = createStore({});
    root.setState(even);
    const time = new Date();
    for (let i = 0; i < 1000; i++) {
      if (i%7 === 0) {
        root.clearState({});
      }
      if (i % 2 === 0) {
        root.setState(even);
        root.companies[firstCompany].setState(odd[firstChildOdd]);
        root.companies[firstCompany].removeSelf();
      } else {
        root.setState(odd);
        root[firstChildOdd].setState(even.companies[firstCompany]);
        root[firstChildOdd].remove();
      }
    }
    console.log('~ 1000 node merges, 1000 resets, 1 000  000 substore nodes removals, 1 000 000 substore nodes created. Took total of: ', new Date() - time, 'ms');
  },15000) ;

  test('memory management after set state', function () {
    const data = { a: 1, b: { c: { d: 2, }, e: [ 1, 2, { f: { g: 1, }, }, ], }, };
    const store = createStore(data);
    const { state, prevState, } = store.setState({ b: { c: { d: 2, }, e: [ 1, { h: 1, }, { f: { i: 1, }, }, ], j: { k: 1, }, }, l: 1, m: { n: 1, }, });
    expect(state.b === store.b.state).toBeTruthy();
    expect(state.b.c === store.b.c.state).toBeTruthy();
    expect(store.b.state.c === store.b.c.state).toBeTruthy();

    expect(prevState.b === store.b.prevState).toBeTruthy();
    expect(prevState.b.c === store.b.c.prevState).toBeTruthy();
    expect(store.b.prevState.c === store.b.c.prevState).toBeTruthy();

    expect(state.b.e === store.b.e.state).toBeTruthy();
    expect(prevState.b.e === store.b.e.prevState).toBeTruthy();

    expect(state.b.e[1] === store.b.e.state[1]).toBeTruthy();

    expect(state.b.e[2] === store.b.e.state[2]).toBeTruthy();
    expect(prevState.b.e[2] === store.b.e.prevState[2]).toBeTruthy();

    expect(state.b.e[2].f === store.b.e.state[2].f).toBeTruthy();
    expect(prevState.b.e[2].f === store.b.e.prevState[2].f).toBeTruthy();

    expect(state.m === store.m.state).toBeTruthy();
  });

  test('memory management after remove', function () {
    const data = { a: 1, b: { c: { d: 2, }, e: [ 1, 2, { f: { g: 1, }, }, ], }, };
    const store = createStore(data);
    store.b.e[2].remove('f');
    expect(store.b.state=== store.state.b);
    expect(store.b.prevState=== store.prevState.b);
    expect(store.b.e.state=== store.state.b.e);
    expect(store.b.e.prevState=== store.prevState.b.e);
    expect(store.b.e[2].state=== store.state.b.e[2]);
    expect(store.b.e.prevState[2]=== store.prevState.b.e[2]);
  });
});
