import { createStoreWithNonedux as init, } from './utils';

const { keys, } = Object;
describe('get children', () => {
  test('should return all immediate children', () => {
    const { subject, }= init({ a: { b: { c: 2, d: {}, }, }, e: 1, f: {}, });
    const { a: fA, f: fF, } = subject;
    const { a, f, ...rootNone }= subject.getChildren();
    expect(keys(rootNone).length).toBe(0);
    const { b, ...aNone } = a.getChildren();
    expect(!!b).toBeTruthy();

    expect(keys(aNone).length).toBe(0);
    const { d, ...bNone } = b.getChildren();
    expect(d).toBeTruthy();
    expect(keys(bNone).length).toBe(0);
  });

  test('should return children recursively', () => {
    const { subject, }= init({ a: { b: { c: 2, d: { x: { t: 0, }, }, }, }, e: 1, f: {}, });

    const { a, f, ...rootNone } = subject.getChildren();
    expect(keys(rootNone).length).toBe(0);
    const { b, ...aNone } = a.getChildren();
    expect(keys(aNone).length).toBe(0);
    const { d, ...bNone }= b.getChildren();
    expect(keys(bNone).length).toBe(0);
    const { x, ...dNone }= d.getChildren();
    expect(keys(dNone).length).toBe(0);
    const { ...xNone }= x.getChildren();
    expect(keys(xNone).length).toBe(0);
    const [ expectA, expectB, expectD, expectX, expectF, ...expectEmpty ]= subject._getChildrenRecursively();

    expect(expectEmpty.length).toBe(0);

    expect(a.getId()).toBe(expectA.getId());

    expect(b.getId()).toBe(expectB.getId());

    expect(d.getId()).toBe(expectD.getId());

    expect(f.getId()).toBe(expectF.getId());

    expect(x.getId()).toBe(expectX.getId());
  });
});
