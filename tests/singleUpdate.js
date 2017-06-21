import { expect, } from 'chai';
import createStore from '../src/createStore';

describe('Single update', () => {
  let root;
  it('should create only 1 Provider update per singleUpdate function call', () => {
    root = createStore({ a: { b: { c: 2, d: {}, }, }, e: 1, });
    let updates = 0;
    root.subscribe(() => {
      updates++;
    });
    root.e.singleUpdate(e => {
      e.setState(2);
      e.setState({ a: 1, b: 2, c: 3, });
      e.b.removeSelf();
    });
    expect(updates).to.equal(1);
  });

  it('state should correspond to the result after all function calls', () => {
    root = createStore({ a: { b: { c: 2, d: {}, }, }, e: 1, });
    const { state, } = root.e.singleUpdate((e => {
      e.setState(2);
      e.setState({ a: 1, b: 2, c: 3, });
      e.b.removeSelf();
    }));
    expect(state).to.deep.equal({ a: 1, c: 3, });
  });
});
