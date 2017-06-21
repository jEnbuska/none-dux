import { expect, } from 'chai';
import createStore from '../src/createStore';

describe('Still attatched', () => {
  let root;
  it('substore return false after it or its parent has been removed', () => {
    root = createStore({ a: { b: { c: 2, d: {}, }, }, e: 1, });
    const { a, e, } = root;
    const { b, } = a;
    const { c, d, } =b;
    root.a.b.remove();
    expect(a.stillAttatched()).to.be.ok;
    expect(!b.stillAttatched()).to.be.ok;
    expect(!c.stillAttatched()).to.be.ok;
    expect(!d.stillAttatched()).to.be.ok;
    expect(e.stillAttatched()).to.be.ok;
  });

});
