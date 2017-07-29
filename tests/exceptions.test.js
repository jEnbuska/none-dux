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

describe('killSwitch', () => {
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

  [ 'legacy', 'legacy', ].forEach(name => {
    const init = state => createStoreWithNonedux(state, undefined, undefined, name === 'proxy');
    describe('run ' + name + ' configuration', () => {
      test('changing removed child subject should throw an exception',
        () => {
          const { subject: { root, }, }= init({ root: { a: { val: 1, }, b: 2, c: { d: { e: 3, }, }, }, });
          const { a, c, } = root;
          const { d, } = c;
          root.remove('a');
          root.remove([ 'c', ]);
          verifyErrorOnChange(a, c, d);
        });

      test('accessing remove sub subject should throw an exception', () => {
        const { subject: { root, }, }= init({ root: { a: { b: 1, }, b: { val: 2, }, c: { d: { val: 3, }, }, }, });
        const { a, b, c, } = root;
        const { d, } = c;
        root.remove('a', 'b', 'c');
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
        const { subject: { root, }, }= init({ root: { a: { b: 1, }, b: { val: 2, }, c: { d: { val: 3, }, }, }, });
        const { a, b, c, } = root;
        root.clearReferences(true);
        expect(() => a.state).toThrow();
        expect(() => b.state).toThrow();
        expect(() => c.state).toThrow();
        expect(() => a.remove('b')).toThrow();
        expect(() => b.remove('val')).toThrow();
        expect(() => c.remove('d')).toThrow();
        expect(() => a.setState({ abc: 1, })).toThrow();
        expect(() => b.setState({ abc: 1, })).toThrow();
        expect(() => c.setState({ abc: 1, })).toThrow();
        expect(() => a.clearState({ abc: 1, })).toThrow();
        expect(() => b.clearState({ abc: 1, })).toThrow();
        expect(() => c.clearState({ abc: 1, })).toThrow();
      });
    });
  });
});