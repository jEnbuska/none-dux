
import createStore from '../src/createStore';

describe('Single update', () => {
  let root;
  test('should create only 1 Provider update per singleUpdate function call', () => {
    root = createStore({ a: { b: { c: 2, d: {}, }, }, e: {}, });
    let updates = 0;
    root.subscribe(() => {
      updates++;
    });
    root.singleUpdate(({ e, }) => {
      e.setState({ a: 2, });
      e.setState({ a: 1, b: { x: 100, }, c: 3, });
      e.b.removeSelf();
    });
    expect(updates).toBe(1);
  });

  test('state should correspond to the result after all function calls', () => {
    root = createStore({ a: { b: { c: 2, d: {}, }, }, e: { a: 1, }, });
    const { state, } = root.e.singleUpdate((e => {
      e.remove('a');
      e.setState({ a: 1, b: { x: 100, }, c: 3, });
      e.b.removeSelf();
    }));
    expect(state).toEqual({ a: 1, c: 3, });
  });
});
