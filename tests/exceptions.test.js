
import createStore, { StoreCreator, } from '../src/createStore';

function verifyErrorOnChange(...params) {
  params.forEach(next => {
    expect(() => next.setState(1)).toThrow(Error);
    expect(() => next.setState({ x: 100, })).toThrow(Error);
    expect(() => next.clearState(1)).toThrow(Error);
    expect(() => next.clearState({ x: 100, })).toThrow(Error);
    expect(() => next.removeSelf()).toThrow(Error);
    expect(() => next.remove('b')).toThrow(Error);
  });
}

describe('killSwitch', () => {
  let store;
  test('Kill switch should trigger when depth > 100 ',
    () => {
      let killSwitchIsTriggered = false;
      StoreCreator.killSwitch = () => { killSwitchIsTriggered = true; };
      store = createStore({});
      let ref = store;
      for (let i = 0; i<100; i++) {
        ref.setState({ a: {}, });
        ref = ref.a;
        expect(!killSwitchIsTriggered).toBeTruthy();
      }
      ref.setState({ a: {}, });
      expect(killSwitchIsTriggered).toBeTruthy();
    });
  test('changing removed sub store should throw an exception',
    () => {
      store = createStore({ a: { val: 1, }, b: 2, c: { d: { e: 3, }, }, });
      const { a, c, } = store;
      const { d, } = c;
      store.remove('a');
      store.c.removeSelf();
      verifyErrorOnChange(a, c, d);
    });

  test('changing excluded sub store should throw an exception', () => {
    store = createStore({ a: { b: 1, }, b: { val: 2, }, c: { d: { val: 3, }, }, });
    const { a, c, } = store;
    const { d, } = c;
    store.clearState({ b: 2, });
    verifyErrorOnChange(a, c, d);
  });
});