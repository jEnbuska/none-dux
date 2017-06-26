import { expect, } from 'chai';
import createStore from '../src/createStore';

describe('clearState', () => {
  it('clearing state', () => {
    const bPart = { b: { c: 2, x: { y: 12, }, }, };
    const store = createStore({ a: {}, ...bPart, d: { e: { f: 5, }, }, g: { h: 11, }, });
    const { state, } = store.clearState({ a: 11, ...bPart, g: { h: 12, i: {}, }, j: {}, });
    expect(state).to.deep.equal({ a: 11, b: { c: 2, x: { y: 12, }, }, g: { h: 12, i: {}, }, j: {}, });
  });
});
