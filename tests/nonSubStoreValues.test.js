import { expect, } from 'chai';
import createStore from '../src/createStore';

describe('arrays as state', () => {
  it('sub state should stay as array', () => {
    const store = createStore({ a: [ new Date(), ], b: new Date(), c: { d: new Date(), }, });
    expect(store.getChildren().length).to.equal(2);
  });
});
