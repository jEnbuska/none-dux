import { createStoreWithNonedux } from './utils';

describe('get children', () => {
  let subject;
  [ 'legacy', 'proxy' ].forEach(name => {
    const init = state => createStoreWithNonedux(state, undefined, undefined, name === 'proxy');
    describe('run ' + name + ' configuration',
      () => {
        test('should return all immediate children', () => {
          const { subject }= init({ a: { b: { c: 2, d: {}, }, }, e: 1, f: {}, });
          const { a, f, ..._ } = subject;
          const [ first, second, ...rootNone ]= subject._getChildren();
          expect(rootNone.length).toBe(0);
          expect(a.getId()).toBe(first.getId());
          expect(f.getId()).toBe(second.getId());
          const [ b, ...aNone ] = a._getChildren();
          expect(!!b).toBeTruthy();
          expect(aNone.length).toBe(0);
          const [ d, ...bNone ] = b._getChildren();
          expect(d).toBeTruthy();
          expect(bNone.length).toBe(0);
        });

        test('should return children recursively', () => {
          const { subject }= init({ a: { b: { c: 2, d: { x: { t: 0, }, }, }, }, e: 1, f: {}, });
          const [ a, f, ...rootNone ]= subject._getChildren();
          const [ b, ...aNone ] = a._getChildren();
          const [ d, ...bNone ]= b._getChildren();
          const [ x, ...dNone ]= d._getChildren();
          const [ ...xNone ] = x._getChildren();
          const [ expectA, expectB, expectD, expectX, expectF, ...expectEmpty ]= subject._getChildrenRecursively();

          [ rootNone, aNone, bNone, dNone, xNone, ].forEach(arr => {
            expect(arr.length).toBe(0);
          });

          expect(expectEmpty.length).toBe(0);

          expect(a.getId()).toBe(expectA.getId());

          expect(b.getId()).toBe(expectB.getId());

          expect(d.getId()).toBe(expectD.getId());

          expect(f.getId()).toBe(expectF.getId());

          expect(x.getId()).toBe(expectX.getId());
        });
      });
  });
});
