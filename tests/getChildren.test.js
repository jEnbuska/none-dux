import { expect, } from 'chai';
import createStore from '../src/createStore';

describe('get children', () => {
  let root;
  it('should return all immediate children', () => {
    root = createStore({ a: { b: { c: 2, d: {}, }, }, e: 1, f: {}, });
    const { a, e, f, } = root;
    const [ first, second, third, ...rest ]= root.getChildren();
    expect(rest.length).to.equal(0);
    expect(a.getId()).to.equal(first.getId());
    expect(a === first).to.be.ok;
    expect(e.getId()).to.equal(second.getId());
    expect(e=== second).to.be.ok;
    expect(f.getId()).to.equal(third.getId());
    expect(f=== third).to.be.ok;
  });

  it('should return children recursively', () => {
    root = createStore({ a: { b: { c: 2, d: { x: { t: 0, }, }, }, }, e: 1, f: {}, });
    const { a, e, f, } = root;
    const { b, } = a;
    const { c, d, } = b;
    const { x, } = d;
    const { t, }=x;
    const [ expectA, expectB, expectC, expectD, expectX, expectT, expectE, expectF, ...expectEmpty ]= root.getChildrenRecursively();

    expect(expectEmpty.length===0).to.be.ok;

    expect(a.getId()).to.equal(expectA.getId());
    expect(a=== expectA).to.be.ok;

    expect(b.getId()).to.equal(expectB.getId());
    expect(b=== expectB).to.be.ok;

    expect(c.getId()).to.equal(expectC.getId());
    expect(c=== expectC).to.be.ok;

    expect(d.getId()).to.equal(expectD.getId());
    expect(d=== expectD).to.be.ok;

    expect(e.getId()).to.equal(expectE.getId());
    expect(e=== expectE).to.be.ok;

    expect(f.getId()).to.equal(expectF.getId());
    expect(f=== expectF).to.be.ok;

    expect(t.getId()).to.equal(expectT.getId());
    expect(t=== expectT).to.be.ok;

    expect(x.getId()).to.equal(expectX.getId());
    expect(x=== expectX).to.be.ok;

  });
});
