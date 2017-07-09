import { createStoreWithNonedux, } from './utils';
import { invalidReferenceHandler, SET_STATE, CLEAR_STATE, REMOVE, GET_STATE, GET_PREV_STATE, } from '../src/common';

describe('arrays as state', () => {
  beforeAll(() => {
    Object.assign(invalidReferenceHandler,
      {
        [SET_STATE]: () => { },
        [CLEAR_STATE]: () => { },
        [REMOVE]: () => { },
        [GET_STATE]: () => { },
        [GET_PREV_STATE]: () => { },
      }
    );
  });

  test('sub state should stay as array', () => {
    const subject = createStoreWithNonedux({ a: [ 1, 2, 3, ], });
    expect(subject.state).toEqual({ a: [ 1, 2, 3, ], });
    expect(subject.a.state[0]).toEqual(1);
  });

  test('onRemove from array in arbitrary order', () => {
    const subject = createStoreWithNonedux([ { a: 1, }, { b: 2, }, { c: 3, }, { d: 4, }, { e: 5, }, { f: 6, }, { g: 7, }, { h: 8, }, ]);
    subject.remove([ 3, 1, 0, 7, ]);
    expect(subject.state).toEqual([ { c: 3, }, { e: 5, }, { f: 6, }, { g: 7, }, ]);
    expect(subject[0].state).toEqual({ c: 3, });
    expect(subject[1].state).toEqual({ e: 5, });
    expect(subject[2].state).toEqual({ f: 6, });
    expect(subject[3].state).toEqual({ g: 7, });
    expect(subject[4]).toEqual(undefined);
    expect(subject[5]).toEqual(undefined);
    expect(subject[6]).toEqual(undefined);
    expect(subject[7]).toEqual(undefined);
  });

  test('should replace current array sub state with a array', () => {
    const subject = createStoreWithNonedux({ a: [ 1, 2, { b: 2, }, ], });
    expect(subject.state).toEqual({ a: [ 1, 2, { b: 2, }, ], });
    subject.setState({ a: [ 'abc', { test: 'empty', }, 2, 3, 4, ], });
    expect(subject.state).toEqual({ a: [ 'abc', { test: 'empty', }, 2, 3, 4, ], });
    expect(subject.a[1].state.test).toEqual('empty');
    subject.setState({ a: [ 1, 2, [], ], });
    expect(subject.state).toEqual({ a: [ 1, 2, [], ], });
    expect(subject.a.state).toEqual([ 1, 2, [], ]);
  });

  test('calling set state to array state should erase old array', () => {
    const subject = createStoreWithNonedux([]);
    subject.setState([ 1, 2, { b: 2, }, ]);
    expect(subject.state).toEqual([ 1, 2, { b: 2, }, ]);
    subject.setState([ 'abc', { test: 'empty', }, 2, 3, 4, ]);
    expect(subject.state).toEqual([ 'abc', { test: 'empty', }, 2, 3, 4, ]);
    subject.setState([ 1, 2, [], ]);
    expect(subject.state).toEqual([ 1, 2, [], ]);
  });

  test('kill old references', () => {
    const subject = createStoreWithNonedux([ 'abc', 1, { test: 'empty', }, { toBeRmd: 0, }, 3, 4, ]);
    expect(subject.state).toEqual([ 'abc', 1, { test: 'empty', }, { toBeRmd: 0, }, 3, 4, ]);
    const fourth = subject[3];
    subject.setState([ 1, 2, [], ]);
    expect(subject.state).toEqual([ 1, 2, [], ]);
    expect(fourth.__subsubject_parent__).toEqual(undefined);
    expect(subject[3]).toEqual(undefined);
  });

  test('array to object should not merge', () => {
    const subject = createStoreWithNonedux([ { a: 1, }, { b: 2, }, { c: 3, }, ]);
    expect(subject.state).toEqual([ { a: 1, }, { b: 2, }, { c: 3, }, ]);
    subject.setState({ 0: { a: 1, }, obj: { test: 'empty', }, 2: '1b', x: 3, });
    expect(subject.state).toEqual({ 0: { a: 1, }, obj: { test: 'empty', }, 2: '1b', x: 3, });
  });

  test('object to array should not merge', () => {
    const subject = createStoreWithNonedux({ 0: 1, 1: { b: 2, }, 2: { c: 3, }, });
    expect(subject.state).toEqual({ 0: 1, 1: { b: 2, }, 2: { c: 3, }, });
    const last = subject[2];
    subject.setState([ 3, 2, ]);
    expect(subject.state).toEqual([ 3, 2, ]);
    expect(last.state).toEqual(undefined);
    expect(last.prevState).toEqual({ c: 3, });
  });

  test('array to array should not merge', () => {
    const subject = createStoreWithNonedux([ 1, { a: 1, }, 3, 4, ]);
    expect(subject.state).toEqual([ 1, { a: 1, }, 3, 4, ]);
    subject.setState([ { x: 2, }, 2, ]);
    expect(subject.state).toEqual([ { x: 2, }, 2, ]);
  });

  test('removing from array', () => {
    const subject = createStoreWithNonedux([ { a: 1, }, { b: 2, }, { c: 3, }, 3, 4, 5, 6, ]);
    subject.remove([ 0, 2, 6, ]);
    expect(subject.state).toEqual([ { b: 2, }, 3, 4, 5, ]);
    expect(subject.state[0]).toEqual({ b: 2, });
    expect(subject.state[1]).toEqual(3);
    expect(subject.state[2]).toEqual(4);
    expect(subject.state[3]).toEqual(5);
  });

  test('array state should shift', () => {
    const subject = createStoreWithNonedux([ 0, 1, { toBeRemoved: 2, }, 3, { toBeKept: 4, }, 5, 6, ]);
    const third = subject[2];
    subject.remove(2);
    expect(subject.state).toEqual([ 0, 1, 3, { toBeKept: 4, }, 5, 6, ]);
    expect(third.state).toEqual(3);
    expect(third.prevState).toEqual({ toBeRemoved: 2, });
    expect(subject.state[2]).toEqual(3);
    expect(subject[3].state).toEqual({ toBeKept: 4, });
  });

  test('changing children of array', () => {
    const subject = createStoreWithNonedux([ { a: { b: 2, }, }, 1, ]);
    subject[0].a.setState({ b: 100, });
    expect(subject.state).toEqual([ { a: { b: 100, }, }, 1, ]);
  });

  test('leaf state to array', () => {
    {
      const subject = createStoreWithNonedux({ reducer: { val: null, }, });
      expect(subject.state.reducer.val).toEqual(null);
      subject.reducer.setState([ 1, 2, { a: 3, }, ]);
      expect(subject.reducer.state).toEqual([ 1, 2, { a: 3, }, ]);
    }
    {
      const subject = createStoreWithNonedux({ reducer: { s: 0, }, });
      expect(subject.state.reducer.s).toEqual(0);
      subject.reducer.setState({ s: [ 1, 2, { a: 3, }, ], });
      expect(subject.reducer.s.state).toEqual([ 1, 2, { a: 3, }, ]);
    }
    {
      const subject = createStoreWithNonedux({ s: /test/, });
      expect(subject.state.s.toString()).toEqual('/test/');
      subject.setState({ s: [ 1, 2, { a: 3, }, ], });
      expect(subject.s.state).toEqual([ 1, 2, { a: 3, }, ]);
    }
    {
      const symbol = Symbol('test');
      const subject = createStoreWithNonedux({ s: symbol, });
      expect(subject.state.s).toEqual(symbol);
      subject.setState({ s: [ 1, 2, { a: 3, }, ], });
      expect(subject.s.state).toEqual([ 1, 2, { a: 3, }, ]);
    }
  });

  test('array to leaf', () => {
    {
      const subject = createStoreWithNonedux({ content: [ 1, 2, { a: 3, }, ], });
      expect(subject.state).toEqual({ content: [ 1, 2, { a: 3, }, ], });
      subject.setState({ content: null, });
      expect(subject.state.content).toEqual(null);
    }
    {
      const subject = createStoreWithNonedux({ content: [ 1, 2, { a: 3, }, ], });
      expect(subject.state).toEqual({ content: [ 1, 2, { a: 3, }, ], });
      subject.setState({ content: 0, });
      expect(subject.state.content).toEqual(0);
    }
    {
      const subject = createStoreWithNonedux({ content: [ 1, 2, { a: 3, }, ], });
      expect(subject.state).toEqual({ content: [ 1, 2, { a: 3, }, ], });
      subject.setState({ content: /test/, });
      expect(subject.state.content.toString()).toEqual('/test/');
    }
    {
      const subject = createStoreWithNonedux({ content: [ 1, 2, { a: 3, }, ], });

      expect(subject.state).toEqual({ content: [ 1, 2, { a: 3, }, ], });
      const symbol = Symbol('test');
      subject.setState({ content: symbol, });
      expect(subject.state.content).toEqual(symbol);
    }
  });

  test('shift array values', () => {
    const subject = createStoreWithNonedux([ { a: 1, }, { b: 2, }, { c: 3, }, ]);
    expect(subject.state).toEqual([ { a: 1, }, { b: 2, }, { c: 3, }, ]);
    const { 0: a, 1: b, 2: c, } = subject;
    subject.setState([ { c: 3, }, { a: 1, }, { b: 2, }, ]);
    expect(a.state).toEqual({ c: 3, });
    expect(b.state).toEqual({ a: 1, });
    expect(c.state).toEqual({ b: 2, });
    // This is unintuitive. Creating new subjects every time subject gets changed brings it's own challenges
  });
});
