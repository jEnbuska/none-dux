import { createStoreWithNonedux, } from './utils';
import StateMapper from '../src/reducer/StateMapper';
import { invalidReferenceHandler, SET_STATE, CLEAR_STATE, REMOVE, GET_STATE, GET_PREV_STATE, } from '../src/common';

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
        [GET_PREV_STATE]: () => { throw new Error(); },
      }
    );
  });
  test('Kill switch should trigger when depth > 100 ',
    () => {
      let killSwitchIsTriggered = false;

      const { subject, }= createStoreWithNonedux({ a: {}, });
      StateMapper.__kill = () => { killSwitchIsTriggered = true; };
      let ref = subject;
      for (let i = 0; i<45; i++) {
        ref.setState({ a: {}, });
        ref = ref.a;
        ref.state;
        expect(killSwitchIsTriggered).toBeFalsy();
      }
      ref.setState({ a: {}, });
      ref.a.state;
      expect(killSwitchIsTriggered).toBeTruthy();
    });
  test('changing __applyRemoved sub subject should throw an exception',
    () => {
      const { subject: { root, }, }= createStoreWithNonedux({ root: { a: { val: 1, }, b: 2, c: { d: { e: 3, }, }, }, });
      const { a, c, } = root;
      const { d, } = c;
      root.remove('a');
      root.remove([ 'c', ]);
      verifyErrorOnChange(a, c, d);
    });

  test('accessing remove sub subject should throw an exception', () => {
    const { subject: { root, }, }= createStoreWithNonedux({ root: { a: { b: 1, }, b: { val: 2, }, c: { d: { val: 3, }, }, }, });
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
});