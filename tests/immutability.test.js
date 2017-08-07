import { createStoreWithNonedux, configs} from './utils';

describe('immutability', () => {
  configs.forEach(name => {
    const init = state => createStoreWithNonedux(state, undefined, undefined, name === 'proxy');
    describe('run ' + name + ' configuration', () => {
      test('previous states should not be changed',
        () => {
          const { subject, }= init({ a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, x: { t: -1, }, j: { z: -0, }, }, }, }, });
          const { state: initialState, } = subject;
          const { state: bInitialState, } = subject.b;
          subject.setState({ a: 2, });
          expect(initialState).not.toEqual(subject.state);
          expect(bInitialState).toEqual(subject.b.state);
        });

      test('subjects other children should remain unchanged',
        () => {
          const { subject, }= createStoreWithNonedux({ a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, x: { t: -1, }, j: { z: -0, }, }, }, }, });
          const { state: bInitialState, } = subject.b;
          subject.setState({ a: 2, });
          expect(bInitialState).toEqual(subject.b.state);
          expect(bInitialState===subject.state.b);
        });

      test('changing deep state',
        () => {
          const { subject, }= init({ a: 1, b: { c: 2, d: {}, e: { f: 4, g: 7, h: { i: 100, x: { t: -1, }, j: { z: -0, }, }, }, }, });
          const bOrg = subject.b.state;
          const dOrg = subject.b.d.state;
          const eOrg = subject.b.e.state;
          const hOrg = subject.b.e.h.state;
          subject.setState({ b: { c: 3, d: {}, e: { f: 4, g: 7, h: { i: 101, x: { t: -1, }, j: { z: -0, }, }, }, }, });
          expect(subject.b.state!==bOrg, 'b').toBeTruthy();
          expect(subject.b.d.state!==dOrg, 'd').toBeTruthy();
          expect(subject.b.e.state!==eOrg, 'e').toBeTruthy();
          expect(subject.b.e.h.state!==hOrg, 'h').toBeTruthy();
        });

      test('changing deep state by children', () => {
        const { subject, }= init({ a: 1, b: { c: 2, d: {}, e: { f: 4, g: 7, h: { i: 100, x: { t: -1, }, j: { z: -0, }, }, }, }, });
        const bOrg = subject.b.state;
        const dOrg = subject.b.d.state;
        const eOrg = subject.b.e.state;
        const hOrg = subject.b.e.h.state;

        const { b, } = subject;
        b.setState({ c: 3, });
        b.e.h.setState({ i: 101, });

        expect(subject.b.state!==bOrg, 'b').toBeTruthy();
        expect(subject.b.d.state===dOrg, 'd').toBeTruthy();
        expect(subject.b.e.state!==eOrg, 'e').toBeTruthy();
        expect(subject.b.e.h.state!==hOrg, 'h').toBeTruthy();
      });

      test('parameters passed to subject should never mutate any values', () => {
        const initialState = { val: { a: 1, b: { c: 2, d: { e: 3, }, }, }, };
        const { val: valState, } = initialState;
        Object.defineProperty(valState.b.d, 'e', {
          writable: false,
          value: initialState.val.b.d.e,
        });
        Object.defineProperty(valState, 'a', {
          writable: false,
          value: initialState.val.a,
        });
        Object.defineProperty(valState.b, 'c', {
          writable: false,
          value: initialState.val.b.c,
        });
        Object.defineProperty(valState.b, 'd', {
          writable: false,
          value: initialState.val.b.d,
        });
        Object.defineProperty(valState, 'b', {
          writable: false,
          value: initialState.val.b,
        });
        expect(() => valState.b.d.e='').toThrow(Error);
        expect(() => valState.b.d='').toThrow(Error);
        expect(() => valState.b.c='').toThrow(Error);
        expect(() => valState.b='').toThrow(Error);
        expect(() => valState.a='').toThrow(Error);
        const { subject: { val, }, } = init(initialState);
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
        val.setState(nextState);

        Object.defineProperty(val.state.b.c, 'x', {
          writable: false,
          value: val.state.b.c.x,
        });
        Object.defineProperty(val.state.b, 'c', {
          writable: false,
          value: val.state.b.c,
        });
        Object.defineProperty(val.state, 'b', {
          writable: false,
          value: val.state.b,
        });
        val.b.c.remove('x');

        Object.defineProperty(val.state, 'e', {
          writable: false,
          value: val.state.e,
        });
        val.remove('e');

        Object.defineProperty(val.state.b.c, 'x', {
          writable: false,
          value: val.state.b.c.x,
        });
        Object.defineProperty(val.state.b, 'd', {
          writable: false,
          value: val.state.b.d,
        });
        Object.defineProperty(val.state.b, 'c', {
          writable: false,
          value: val.state.b.c,
        });
        Object.defineProperty(val.state, 'b', {
          writable: false,
          value: val.state.b,
        });
        val.setState({ b: { c: 1, }, });
      });
    });
  });
});