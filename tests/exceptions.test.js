import { createStoreWithNonedux, } from './utils';
import AutoReducer from '../src/AutoReducer';
import { invalidReferenceHandler, } from '../src/createNonedux';
import { SET_STATE, CLEAR_STATE, REMOVE, GET_STATE, GET_PREV_STATE, } from '../src/common';

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
  let subject;
  test('Kill switch should trigger when depth > 100 ',
    () => {
      let killSwitchIsTriggered = false;

      subject = createStoreWithNonedux({});
      AutoReducer.__kill = () => { killSwitchIsTriggered = true; };
      let ref = subject;
      for (let i = 0; i<45; i++) {
        ref.setState({ a: {}, });
        ref = ref.a;
        expect(killSwitchIsTriggered).toBeFalsy();
      }
      ref.setState({ a: {}, });
      expect(killSwitchIsTriggered).toBeTruthy();
    });
  test('changing __applyRemoved sub subject should throw an exception',
    () => {
      subject = createStoreWithNonedux({ a: { val: 1, }, b: 2, c: { d: { e: 3, }, }, });
      const { a, c, } = subject;
      const { d, } = c;
      subject.remove('a');
      subject.remove([ 'c', ]);
      verifyErrorOnChange(a, c, d);
    });

  test('accessing remove sub subject should throw an exception', () => {
    subject = createStoreWithNonedux({ a: { b: 1, }, b: { val: 2, }, c: { d: { val: 3, }, }, });
    const { a, b, c, } = subject;
    const { d, } = c;
    subject.remove('a','b','c');
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

    expect(() => a.state).toThrow(Error);
    expect(() => b.state).toThrow(Error);
    expect(() => c.state).toThrow(Error);
    expect(() => d.state).toThrow(Error);

    expect(() => a.prevState).toThrow(Error);
    expect(() => b.prevState).toThrow(Error);
    expect(() => c.prevState).toThrow(Error);
    expect(() => d.prevState).toThrow(Error);
  });
});