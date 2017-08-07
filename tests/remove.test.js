import { createStoreWithNonedux, configs, } from './utils';

describe('remove', () => {
  configs.forEach(name => {
    const init = state => createStoreWithNonedux(state, undefined, undefined, name==='proxy');
    describe('run ' + name +' configuration', () => {
      test(name + ' removing the child subject should throw error',
        () => {
          const { subject, } = init({ a: {}, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, x: { t: -1, }, j: { z: -0, }, }, }, }, });
          expect(() => subject.remove([ 'b', ])).toThrow(Error);
        });

      test(name + ' removing leaf from object', () => {
        const { subject, } = init({ a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, x: { t: -1, }, j: { z: -0, }, }, }, }, });
        subject.b.remove([ 'd', ]);
        expect(subject.state).toEqual({ a: 1, b: { c: 2, e: { f: 4, g: 7, h: { i: 100, x: { t: -1, }, j: { z: -0, }, }, }, }, });
      });

      test(name + ' remove sub object', () => {
        const { subject, } = init({ child: { a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, x: { t: -1, }, j: { z: -0, }, }, }, }, }, });
        subject.child.b.e.h.remove('x');
        expect(subject.state).toEqual({ child: { a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, j: { z: -0, }, }, }, }, }, });
        subject.child.b.remove([ 'd', ]);
        subject.child.remove([ 'b', ]);
        expect(subject.state).toEqual({ child: { a: 1, }, });
      });

      test(name + ' should be able to remove an empty child', () => {
        const { subject, } = init({ a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, x: {}, j: { z: -0, }, }, }, }, });
        subject.b.e.h.remove([ 'x', ]);
        expect(subject.state).toEqual({ a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, j: { z: -0, }, }, }, }, });
      });

      test(name + ' should be able to remove undefined value', () => {
        const { subject, } = init({ a: 1, b: { c: undefined, d: undefined, e: { f: 4, g: 7, }, }, });
        subject.b.remove([ 'd', ]);
        expect(subject.state).toEqual({ a: 1, b: { c: undefined, e: { f: 4, g: 7, }, }, });
      });

      test(name + ' should be able to remove multiple children at ones', () => {
        const { subject, } = init({ a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, x: {}, j: { z: -0, }, }, }, }, });
        subject.b.e.h.remove([ 'x', 'j', ]);
        expect(subject.state).toEqual({ a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, }, }, }, });
      });

      test(name + ' should be able to remove multiple children little by little', () => {
        const { subject, } = init({ a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, x: { t: -1, }, j: { z: -0, }, }, }, }, });
        subject.b.e.h.remove([ 'x', ]);
        expect(subject.state).toEqual({ a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, j: { z: -0, }, }, }, }, });
        subject.b.e.remove([ 'h', ]);
        subject.b.remove([ 'e', ]);
        expect(subject.state).toEqual({ a: 1, b: { c: 2, d: 3, }, });
      });

      test(name + ' sub subject should be removed', () => {
        const { subject, } = init({ child: { a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, x: { t: -1, }, j: { z: -0, }, }, }, }, }, });
        subject.child.remove([ 'b', ]);
        expect(subject.b).toEqual(undefined);
        expect(subject.child.state.b).toEqual(undefined);
      });
    });
  });
});