import { createStoreWithNonedux as init, } from './utils';
import { invalidReferenceHandler, SET_STATE, CLEAR_STATE, REMOVE, GET_STATE, } from '../src/common';


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

  test('changing removed child subject should throw an exception', () => {
    const { subject: { root, }, }= init({ root: { a: { val: 1, }, b: 2, c: { d: { e: 3, }, }, }, });
    const { a, c, } = root;
    const { d, } = c;
    root.remove('a');
    root.remove([ 'c', ]);
    expect(() => d.setState({ x: 100, })).toThrow(Error);
    expect(() => d.clearState(1)).toThrow(Error);
    expect(() => d.clearState({ x: 100, })).toThrow(Error);
    expect(() => d.remove('b')).toThrow(Error);
  });

  test('accessing remove sub subject should throw an exception', () => {
    const { subject: { root, }, }= init({ root: { a: { b: 1, }, b: { val: 2, }, c: { d: { val: 3, }, }, }, });
    const { a, b, c, } = root;
    const { d, } = c;
    root.remove('a', 'b', 'c');

    expect(() => d.remove('val')).toThrow(Error);
  });
});