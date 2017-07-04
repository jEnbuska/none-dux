import ReducerParent from '../src/ReducerParent';
import SubStore from '../src/SubStore';
import { data, data2, } from './resources';

const { keys, } = Object;
describe('performance', () => {
  test('performance simple', function () {
    const even = data;
    const odd = data2;
    const firstCompany = keys(even.companies)[0];
    const firstChildOdd = keys(odd)[0];
    const root = new ReducerParent({});
    SubStore.maxDepth = 100;
    root._onSetState(even);
    const time = new Date();
    for (let i = 0; i < 1000; i++) {
      if (i%7 === 0) {
        root._onClearState({});
      }
      if (i % 2 === 0) {
        root._onSetState(even);
        root.companies[firstCompany]._onSetState(odd[firstChildOdd]);
        root.companies._onRemove([ firstCompany, ]);
      } else {
        root._onSetState(odd);
        root[firstChildOdd]._onSetState(even.companies[firstCompany]);
        root._onRemove([ firstChildOdd, ]);
      }
    }
    console.log('~ 1000 node merges, 1000 resets, 1 000  000 subsubject nodes removals, 1 000 000 subsubject nodes created. Took total of: ', new Date() - time, 'ms');
  }, 15000);

  test('memory management after set state', function () {
    const data = { a: 1, b: { c: { d: 2, }, e: [ 1, 2, { f: { g: 1, }, }, ], }, };
    const subject = new ReducerParent(data);
    const { state, prevState, } = subject._onSetState({ b: { c: { d: 2, }, e: [ 1, { h: 1, }, { f: { i: 1, }, }, ], j: { k: 1, }, }, l: 1, m: { n: 1, }, });
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

  test('memory management after _onRemove', function () {
    const data = { a: 1, b: { c: { d: 2, }, e: [ 1, 2, { f: { g: 1, }, }, ], }, };
    const subject = new ReducerParent(data);
    subject.b.e[2]._onRemove('f');
    expect(subject.b.state=== subject.state.b);
    expect(subject.b.prevState=== subject.prevState.b);
    expect(subject.b.e.state=== subject.state.b.e);
    expect(subject.b.e.prevState=== subject.prevState.b.e);
    expect(subject.b.e[2].state=== subject.state.b.e[2]);
    expect(subject.b.e.prevState[2]=== subject.prevState.b.e[2]);
  });
});
