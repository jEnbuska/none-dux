
import createStore from '../src/createStore';

describe('Still attatched', () => {
  let root;
  test('substore return false after it or its parent has been removed', () => {
    root = createStore({ a: { b: { c: 2, d: {}, }, }, e: {f: 3}, });
    const { a, e, } = root;
    const { b, } = a;
    const { d, } =b;
    root.a.b.removeSelf();
    expect(a.stillAttatched()).toBeTruthy();
    expect(!b.stillAttatched()).toBeTruthy();
    expect(!d.stillAttatched()).toBeTruthy();
    expect(e.stillAttatched()).toBeTruthy();
  });

});
