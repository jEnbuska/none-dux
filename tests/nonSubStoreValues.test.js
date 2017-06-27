
import createStore from '../src/createStore';

describe('arrays as state', () => {
  test('sub state should stay as array', () => {
    const store = createStore({ a: [ new Date(), ], b: new Date(), c: { d: new Date(), }, });
    expect(store.getChildren().length).toBe(2);
  });
});
