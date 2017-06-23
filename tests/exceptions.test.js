import { expect, } from 'chai';
import createStore, { StoreCreator, } from '../src/createStore';

function verifyErrorOnChange(...params) {
  params.forEach(next => {
    expect(() => next.setState(1)).to.throw(Error);
    expect(() => next.setState({ x: 100, })).to.throw(Error);
    expect(() => next.clearState(1)).to.throw(Error);
    expect(() => next.clearState({ x: 100, })).to.throw(Error);
    expect(() => next.removeSelf()).to.throw(Error);
    expect(() => next.remove('b')).to.throw(Error);
  });
}

describe('killSwitch', () => {
  let store;
  it('Kill switch should trigger when depth > 100 ',
    () => {
      let killSwitchIsTriggered = false;
      StoreCreator.killSwitch = () => killSwitchIsTriggered = true;
      store = createStore({});
      let ref = store;
      for (let i = 0; i<100; i++) {
        ref.setState({ a: {}, });
        ref = ref.a;
        expect(!killSwitchIsTriggered).to.be.ok;
      }
      ref.setState({ a: {}, });
      expect(killSwitchIsTriggered).to.be.ok;
    });
  it('changing removed sub store should throw an exception',
    () => {
      store = createStore({ a: { val: 1, }, b: 2, c: { d: { e: 3, }, }, });
      const { a, c, } = store;
      const { d, } = c;
      store.remove('a');
      store.c.removeSelf();
      verifyErrorOnChange(a, c, d);
    });

  it('changing excluded sub store should throw an exception', () => {
    store = createStore({ a: { b: 1, }, b: { val: 2, }, c: { d: { val: 3, }, }, });
    const { a, c, } = store;
    const { d, } = c;
    store.clearState({ b: 2, });
    verifyErrorOnChange(a, c, d);
  });
});