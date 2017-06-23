import { expect, } from 'chai';
import createStore from '../src/createStore';

describe('Still attatched', () => {
  let root;
  it('substore return false after it or its parent has been removed', () => {
    root = createStore({ a: { b: { c: 2, d: {}, }, }, e: {f: 3}, });
    const { a, e, } = root;
    const { b, } = a;
    const { d, } =b;
    root.a.b.removeSelf();
    expect(a.stillAttatched()).to.be.ok;
    expect(!b.stillAttatched()).to.be.ok;
    expect(!d.stillAttatched()).to.be.ok;
    expect(e.stillAttatched()).to.be.ok;
  });

});
