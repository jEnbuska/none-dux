import { ReducerParent, } from '../src/createNoneDux';

describe('immutability', () => {
  let subject;
  test('previous states should not be changed',
    () => {
      subject = new ReducerParent({ a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, x: { t: -1, }, j: { z: -0, }, }, }, }, }).subject;
      const { state: initialState, } = subject;
      const { state: bInitialState, } = subject.b;
      subject._onSetState({ a: 2, });
      expect(initialState).not.toEqual(subject.state);
      expect(bInitialState).toEqual(subject.b.state);
    });

  test('subjects other children should remain unchanged',
    () => {
      subject = new ReducerParent({ a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, x: { t: -1, }, j: { z: -0, }, }, }, }, }).subject;
      const { state: bInitialState, } = subject.b;
      subject._onSetState({ a: 2, });
      expect(bInitialState).toEqual(subject.b.state);
      expect(bInitialState===subject.state.b);
    });

  test('changing deep state',
    () => {
      subject = new ReducerParent({ a: 1, b: { c: 2, d: {}, e: { f: 4, g: 7, h: { i: 100, x: { t: -1, }, j: { z: -0, }, }, }, }, }).subject;
      const bOrg = subject.b.state;
      const dOrg = subject.b.d.state;
      const eOrg = subject.b.e.state;
      const hOrg = subject.b.e.h.state;
      subject._onSetState({ b: { c: 3, d: {}, e: { f: 4, g: 7, h: { i: 101, x: { t: -1, }, j: { z: -0, }, }, }, }, });
      expect(subject.b.state!==bOrg, 'b').toBeTruthy();
      expect(subject.b.d.state!==dOrg, 'd').toBeTruthy();
      expect(subject.b.e.state!==eOrg, 'e').toBeTruthy();
      expect(subject.b.e.h.state!==hOrg, 'h').toBeTruthy();
    });

  test('changing deep state by children', () => {
    subject = new ReducerParent({ a: 1, b: { c: 2, d: {}, e: { f: 4, g: 7, h: { i: 100, x: { t: -1, }, j: { z: -0, }, }, }, }, }).subject;
    const bOrg = subject.b.state;
    const dOrg = subject.b.d.state;
    const eOrg = subject.b.e.state;
    const hOrg = subject.b.e.h.state;

    const { b, } = subject;
    b._onSetState({ c: 3, });
    b.e.h._onSetState({ i: 101, });

    expect(subject.b.state!==bOrg, 'b').toBeTruthy();
    expect(subject.b.d.state===dOrg, 'd').toBeTruthy();
    expect(subject.b.e.state!==eOrg, 'e').toBeTruthy();
    expect(subject.b.e.h.state!==hOrg, 'h').toBeTruthy();
  });

  test('parameters passed to subject should never mutate any values', () => {
    const initialState = { a: 1, b: { c: 2, d: { e: 3, }, }, };
    Object.defineProperty(initialState.b.d, 'e', {
      writable: false,
      value: initialState.b.d.e,
    });
    Object.defineProperty(initialState, 'a', {
      writable: false,
      value: initialState.a,
    });
    Object.defineProperty(initialState.b, 'c', {
      writable: false,
      value: initialState.b.c,
    });
    Object.defineProperty(initialState.b, 'd', {
      writable: false,
      value: initialState.b.d,
    });
    Object.defineProperty(initialState, 'b', {
      writable: false,
      value: initialState.b,
    });
    expect(() => initialState.b.d.e='').toThrow(Error);
    expect(() => initialState.b.d='').toThrow(Error);
    expect(() => initialState.b.c='').toThrow(Error);
    expect(() => initialState.b='').toThrow(Error);
    expect(() => initialState.a='').toThrow(Error);
    const { subject, } = new ReducerParent(initialState);
    const nextState = { a: 2, b: { c: { x: 1, }, d: 1, }, e: 3, };
    Object.defineProperty(nextState, 'a', {
      writable: false,
      value: nextState.a,
    });
    Object.defineProperty(nextState, 'e', {
      writable: false,
      value: nextState.e,
    });
    Object.defineProperty(nextState.b.c, 'x', {
      writable: false,
      value: nextState.b.c.x,
    });
    Object.defineProperty(nextState.b, 'd', {
      writable: false,
      value: nextState.b.d,
    });
    Object.defineProperty(nextState.b, 'c', {
      writable: false,
      value: nextState.b.c,
    });
    Object.defineProperty(nextState, 'b', {
      writable: false,
      value: nextState.b,
    });
    expect(() => nextState.a='').toThrow(Error);
    expect(() => nextState.e='').toThrow(Error);
    expect(() => nextState.b.c.x='').toThrow(Error);
    expect(() => nextState.b.d='').toThrow(Error);
    expect(() => nextState.b='').toThrow(Error);
    subject._onSetState(nextState);

    Object.defineProperty(subject.state.b.c, 'x', {
      writable: false,
      value: subject.state.b.c.x,
    });
    Object.defineProperty(subject.state.b, 'c', {
      writable: false,
      value: subject.state.b.c,
    });
    Object.defineProperty(subject.state, 'b', {
      writable: false,
      value: subject.state.b,
    });
    subject.b.c._onRemove('x');

    Object.defineProperty(subject.state, 'e', {
      writable: false,
      value: subject.state.e,
    });
    subject._onRemove('e');

    Object.defineProperty(subject.state.b.c, 'x', {
      writable: false,
      value: subject.state.b.c.x,
    });
    Object.defineProperty(subject.state.b, 'd', {
      writable: false,
      value: subject.state.b.d,
    });
    Object.defineProperty(subject.state.b, 'c', {
      writable: false,
      value: subject.state.b.c,
    });
    Object.defineProperty(subject.state, 'b', {
      writable: false,
      value: subject.state.b,
    });
    subject._onSetState({ b: { c: 1, }, });
  });
});