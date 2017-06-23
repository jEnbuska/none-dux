import { expect, } from 'chai';
import createStore from '../src/createStore';

describe('get children', () => {
  let root;
  // noinspection JSAnnotator
  it('should return all immediate children', () => {
    root = createStore({ a: { b: { c: 2, d: {}, }, }, e: 1, f: {}, });
    const { a, f, ..._ } = root;
    const [ first, second, ...rootNone ]= root.getChildren();
    expect(rootNone.length).to.equal(0);
    expect(a.getId()).to.equal(first.getId());
    expect(a === first).to.be.ok;
    expect(f.getId()).to.equal(second.getId());
    expect(f=== second).to.be.ok;
    const [ b, ...aNone ] = a.getChildren();
    expect(b).to.be.ok;
    expect(aNone.length).to.equal(0);
    const [ d, ...bNone ] = b.getChildren();
    expect(d).to.be.ok;
    expect(bNone.length).to.equal(0);
  });

  it('should return children recursively', () => {
    root = createStore({ a: { b: { c: 2, d: { x: { t: 0, }, }, }, }, e: 1, f: {}, });
    const [ a, f, ...rootNone ]= root.getChildren();
    const [ b, ...aNone ] = a.getChildren();
    const [ d, ...bNone ]= b.getChildren();
    const [ x, ...dNone ]= d.getChildren();
    const [ ...xNone ] = x.getChildren();
    const [ expectA, expectB, expectD, expectX, expectF, ...expectEmpty ]= root.getChildrenRecursively();

    [ rootNone, aNone, bNone, dNone, xNone, ].forEach(arr => {
      expect(arr.length).to.equal(0);
    });

    expect(expectEmpty.length).to.equal(0);

    expect(a.getId()).to.equal(expectA.getId());
    expect(a=== expectA).to.be.ok;

    expect(b.getId()).to.equal(expectB.getId());
    expect(b=== expectB).to.be.ok;

    expect(d.getId()).to.equal(expectD.getId());
    expect(d=== expectD).to.be.ok;

    expect(f.getId()).to.equal(expectF.getId());
    expect(f=== expectF).to.be.ok;

    expect(x.getId()).to.equal(expectX.getId());
    expect(x=== expectX).to.be.ok;
  });
});
