
import createStore from '../src/createStore';

describe('get children', () => {
  let root;
  // noinspection JSAnnotator
  test('should return all immediate children', () => {
    root = createStore({ a: { b: { c: 2, d: {}, }, }, e: 1, f: {}, });
    const { a, f, ..._ } = root;
    const [ first, second, ...rootNone ]= root.getChildren();
    expect(rootNone.length).toBe(0);
    expect(a.getId()).toBe(first.getId());
    expect(a === first).toBeTruthy();
    expect(f.getId()).toBe(second.getId());
    expect(f=== second).toBeTruthy();
    const [ b, ...aNone ] = a.getChildren();
    expect(!!b).toBeTruthy();
    expect(aNone.length).toBe(0);
    const [ d, ...bNone ] = b.getChildren();
    expect(d).toBeTruthy();
    expect(bNone.length).toBe(0);
  });

  test('should return children recursively', () => {
    root = createStore({ a: { b: { c: 2, d: { x: { t: 0, }, }, }, }, e: 1, f: {}, });
    const [ a, f, ...rootNone ]= root.getChildren();
    const [ b, ...aNone ] = a.getChildren();
    const [ d, ...bNone ]= b.getChildren();
    const [ x, ...dNone ]= d.getChildren();
    const [ ...xNone ] = x.getChildren();
    const [ expectA, expectB, expectD, expectX, expectF, ...expectEmpty ]= root.getChildrenRecursively();

    [ rootNone, aNone, bNone, dNone, xNone, ].forEach(arr => {
      expect(arr.length).toBe(0);
    });

    expect(expectEmpty.length).toBe(0);

    expect(a.getId()).toBe(expectA.getId());
    expect(a=== expectA).toBeTruthy();

    expect(b.getId()).toBe(expectB.getId());
    expect(b=== expectB).toBeTruthy();

    expect(d.getId()).toBe(expectD.getId());
    expect(d=== expectD).toBeTruthy();

    expect(f.getId()).toBe(expectF.getId());
    expect(f=== expectF).toBeTruthy();

    expect(x.getId()).toBe(expectX.getId());
    expect(x=== expectX).toBeTruthy();
  });
});
