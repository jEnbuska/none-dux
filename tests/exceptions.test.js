import { createStoreWithNonedux, } from './utils';
import { invalidReferenceHandler, SET_STATE, CLEAR_STATE, REMOVE, GET_STATE, } from '../src/common';

function verifyErrorOnChange(...params) {
  params.forEach(next => {
    expect(() => next.setState(1)).toThrow(Error);
    expect(() => next.setState({ x: 100, })).toThrow(Error);
    expect(() => next.clearState(1)).toThrow(Error);
    expect(() => next.clearState({ x: 100, })).toThrow(Error);
    expect(() => next.remove('b')).toThrow(Error);
  });
}

describe('exception', () => {
  beforeAll(() => {
    Object.assign(invalidReferenceHandler,
      {
        [SET_STATE]: () => { throw new Error(); },
        [CLEAR_STATE]: () => { throw new Error(); },
        [REMOVE]: () => { throw new Error(); },
        [GET_STATE]: () => { throw new Error(); },
      }
    );
  });

  [ 'legacy', 'proxy', ].forEach(name => {
    const init = state => createStoreWithNonedux(state, undefined, undefined, name === 'proxy');
    describe('run ' + name + ' configuration', () => {
      test('changing removed child subject should throw an exception',
        () => {
          const { subject: { child, }, }= init({ child: { a: { val: 1, }, b: 2, c: { d: { e: 3, }, }, }, });
          const { a, c, } = child;
          const { d, } = c;
          child.remove('a');
          child.remove([ 'c', ]);
          verifyErrorOnChange(a, c, d);
        });

      test('accessing remove sub subject should throw an exception', () => {
        const { subject: { child, }, }= init({ child: { a: { b: 1, }, b: { val: 2, }, c: { d: { val: 3, }, }, }, });
        const { a, b, c, } = child;
        const { d, } = c;
        child.remove('a', 'b', 'c');
        expect(() => a.setState({})).toThrow(Error);
        expect(() => b.setState({})).toThrow(Error);
        expect(() => c.setState({})).toThrow(Error);
        expect(() => a.clearState({})).toThrow(Error);
        expect(() => b.clearState({})).toThrow(Error);
        expect(() => c.clearState({})).toThrow(Error);

        expect(() => a.remove('b')).toThrow(Error);
        expect(() => b.remove('val')).toThrow(Error);
        expect(() => c.remove('d')).toThrow(Error);
        expect(() => d.remove('val')).toThrow(Error);
      });

      test('clearReferences', () => {
        const { subject: { child, }, }= init({ child: { a: { valA: {}, }, b: { valB: {}, }, c: { valC: {}, }, }, });
        const { a, b, c, } = child;
        const { valA, } = a;
        const { valB, } = b;
        const { valC, } = c;
        child.clearReferences(true);
        expect(() => valA.state).toThrow();
        expect(() => valB.state).toThrow();
        expect(() => valC.state).toThrow();
        expect(() => valA.remove('a')).toThrow();
        expect(() => valB.remove('b')).toThrow();
        expect(() => valC.remove('c')).toThrow();
        expect(() => valA.setState({ abc: 1, })).toThrow();
        expect(() => valB.setState({ abc: 1, })).toThrow();
        expect(() => valC.setState({ abc: 1, })).toThrow();
        expect(() => valA.clearState({ abc: 1, })).toThrow();
        expect(() => valB.clearState({ abc: 1, })).toThrow();
        expect(() => valC.clearState({ abc: 1, })).toThrow();
      });

      test('invalid modification of root branch', () => {
        const { subject, }= init({ child: { a: { b: 1, }, b: { val: 2, }, c: { d: { val: 3, }, }, }, });
        expect(() => subject.setState({ x: 1, })).toThrow();
        expect(() => subject.clearState({})).toThrow();
        expect(() => subject.remove('a')).toThrow();
      });

      test('invalid setState param', () => {
        const { subject: { child, }, }= init({ child: { a: { b: 1, }, b: { val: 2, }, c: { d: { val: 3, }, }, }, });
        expect(() => child.setState(1)).toThrow();
        expect(() => child.setState(child.a)).toThrow();
      });
    });
  });
});