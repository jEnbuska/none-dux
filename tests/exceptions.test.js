import { expect, } from 'chai';
import createStore, { StoreCreator, } from '../src/createStore';

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
  it('changing detached sub store should throw an exception',
    () => {
      store = createStore({ a: 1, b: 2, c: { d: 3, }, });
      const { a, c, } = store;
      const { d, } = c;
      store.remove('a');
      store.c.remove();
      expect(() => a.setState(1)).to.throw(Error);
      expect(() => a.setState({ x: 100, })).to.throw(Error);
      expect(() => a.clearState(1)).to.throw(Error);
      expect(() => a.clearState({ x: 100, })).to.throw(Error);
      expect(() => a.remove()).to.throw(Error);
      expect(() => a.remove('b')).to.throw(Error);

      expect(() => c.setState(1)).to.throw(Error);
      expect(() => c.setState({ x: 100, })).to.throw(Error);
      expect(() => c.clearState(1)).to.throw(Error);
      expect(() => c.clearState({ x: 100, })).to.throw(Error);
      expect(() => c.remove()).to.throw(Error);
      expect(() => c.remove('b')).to.throw(Error);

      expect(() => d.setState(1)).to.throw(Error);
      expect(() => d.setState({ x: 100, })).to.throw(Error);
      expect(() => d.clearState(1)).to.throw(Error);
      expect(() => d.clearState({ x: 100, })).to.throw(Error);
      expect(() => d.remove()).to.throw(Error);
      expect(() => d.remove('b')).to.throw(Error);
    });
});