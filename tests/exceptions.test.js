import { ReducerParent, } from '../src/createNoneDux';
import SubStore from '../src/SubStore';

function verifyErrorOnChange(...params) {
  params.forEach(next => {
    expect(() => next._onSetState(1)).toThrow(Error);
    expect(() => next._onSetState({ x: 100, })).toThrow(Error);
    expect(() => next._onClearState(1)).toThrow(Error);
    expect(() => next._onClearState({ x: 100, })).toThrow(Error);
    expect(() => next._onRemove('b')).toThrow(Error);
  });
}

describe('killSwitch', () => {
  let subject;
  test('Kill switch should trigger when depth > 100 ',
    () => {
      let killSwitchIsTriggered = false;

      subject = new ReducerParent({}).subject;
      SubStore.__kill = () => { killSwitchIsTriggered = true; };
      let ref = subject;
      for (let i = 0; i<45; i++) {
        ref._onSetState({ a: {}, });
        ref = ref.a;
        expect(!killSwitchIsTriggered).toBeTruthy();
      }
      ref._onSetState({ a: {}, });
      expect(killSwitchIsTriggered).toBeTruthy();
    });
  test('changing _onRemoved sub subject should throw an exception',
    () => {
      subject = new ReducerParent({ a: { val: 1, }, b: 2, c: { d: { e: 3, }, }, }).subject;
      const { a, c, } = subject;
      const { d, } = c;
      subject._onRemove('a');
      subject._onRemove([ 'c', ]);
      verifyErrorOnChange(a, c, d);
    });

  test('changing excluded sub subject should throw an exception', () => {
    subject = new ReducerParent({ a: { b: 1, }, b: { val: 2, }, c: { d: { val: 3, }, }, }).subject;
    const { a, c, } = subject;
    const { d, } = c;
    subject._onClearState({ b: 2, });
    verifyErrorOnChange(a, c, d);
  });
});