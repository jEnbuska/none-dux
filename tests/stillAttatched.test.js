
import nonedux from '../src/createNoneDux';

describe('Still attatched', () => {
  let root;
  test('subsubject return false after it or its parent has been _onRemoved', () => {
    root = nonedux({ a: { b: { c: 2, d: {}, }, }, e: { f: 3, }, }).subject;
    const { a, e, } = root;
    const { b, } = a;
    const { d, } =b;
    root.a._onRemove([ 'b', ]);
    expect(a.stillAttatched()).toBeTruthy();
    expect(!b.stillAttatched()).toBeTruthy();
    expect(!d.stillAttatched()).toBeTruthy();
    expect(e.stillAttatched()).toBeTruthy();
  });
});
