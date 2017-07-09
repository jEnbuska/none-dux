import { createStoreWithNonedux, } from './utils';
import AutoReducer from '../src/AutoReducer';
import { data, data2, } from './resources';

const { keys, } = Object;
describe('performance', () => {
  test('performance simple', () => {
    const even = data;
    const odd = data2;
    const firstCompany = keys(even.companies)[0];
    const firstChildOdd = keys(odd)[0];
    const root = createStoreWithNonedux({});
    AutoReducer.maxDepth = 100;
    root.setState(even);
    const time = new Date();
    for (let i = 0; i < 1000; i++) {
      if (i%7 === 0) {
        root.clearState({});
      }
      if (i % 2 === 0) {
        root.setState(even);
        root.companies[firstCompany].setState(odd[firstChildOdd]);
        root.companies.remove([ firstCompany, ]);
      } else {
        root.setState(odd);
        root[firstChildOdd].setState(even.companies[firstCompany]);
        root.remove([ firstChildOdd, ]);
      }
    }
    console.log('~ 1000 node merges, 1000 resets, 1 000  000 subsubject nodes removals, 1 000 000 subsubject nodes created. Took total of: ', new Date() - time, 'ms');
  }, 15000);

  test('memory management after set state', () => {
    const data = { a: 1, b: { c: { d: 2, }, e: [ 1, 2, { f: { g: 1, }, }, ], }, };
    const subject = createStoreWithNonedux(data);
    const { state, prevState, } = subject.setState({ b: { c: { d: 2, }, e: [ 1, { h: 1, }, { f: { i: 1, }, }, ], j: { k: 1, }, }, l: 1, m: { n: 1, }, });
    expect(state.b === subject.b.state).toBeTruthy();
    expect(state.b.c === subject.b.c.state).toBeTruthy();
    expect(subject.b.state.c === subject.b.c.state).toBeTruthy();

    expect(prevState.b === subject.b.prevState).toBeTruthy();
    expect(prevState.b.c === subject.b.c.prevState).toBeTruthy();
    expect(subject.b.prevState.c === subject.b.c.prevState).toBeTruthy();

    expect(state.b.e === subject.b.e.state).toBeTruthy();
    expect(prevState.b.e === subject.b.e.prevState).toBeTruthy();

    expect(state.b.e[1] === subject.b.e.state[1]).toBeTruthy();

    expect(state.b.e[2] === subject.b.e.state[2]).toBeTruthy();
    expect(prevState.b.e[2] === subject.b.e.prevState[2]).toBeTruthy();

    expect(state.b.e[2].f === subject.b.e.state[2].f).toBeTruthy();
    expect(prevState.b.e[2].f === subject.b.e.prevState[2].f).toBeTruthy();

    expect(state.m === subject.m.state).toBeTruthy();
  });

});
