import { createStoreWithNonedux as init, } from './utils';

describe('remove', () => {
  test(' removing the root subject should throw error', () => {
    const { subject, } = init({ a: {}, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, x: { t: -1, }, j: { z: -0, }, }, }, }, });
    expect(() => subject.remove([ 'b', ])).toThrow(Error);
  });

  test(' removing leaf from object', () => {
    const { subject, } = init({ a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, x: { t: -1, }, j: { z: -0, }, }, }, }, });
    subject.b.remove([ 'd', ]);
    expect(subject.state).toEqual({ a: 1, b: { c: 2, e: { f: 4, g: 7, h: { i: 100, x: { t: -1, }, j: { z: -0, }, }, }, }, });
  });

  test(' remove sub object', () => {
    const { subject, } = init({ root: { a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, x: { t: -1, }, j: { z: -0, }, }, }, }, }, });
    subject.root.b.e.h.remove('x');
    expect(subject.state).toEqual({ root: { a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, j: { z: -0, }, }, }, }, }, });
    subject.root.b.remove([ 'd', ]);
    subject.root.remove([ 'b', ]);
    expect(subject.state).toEqual({ root: { a: 1, }, });
  });

  test(' should be able to remove an empty child', () => {
    const { subject, } = init({ a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, x: {}, j: { z: -0, }, }, }, }, });
    subject.b.e.h.remove([ 'x', ]);
    expect(subject.state).toEqual({ a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, j: { z: -0, }, }, }, }, });
  });

  test(' should be able to remove undefined value', () => {
    const { subject, } = init({ a: 1, b: { c: undefined, d: undefined, e: { f: 4, g: 7, }, }, });
    subject.b.remove([ 'd', ]);
    expect(subject.state).toEqual({ a: 1, b: { c: undefined, e: { f: 4, g: 7, }, }, });
  });

  test(' should be able to remove multiple children at ones', () => {
    const { subject, } = init({ a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, x: {}, j: { z: -0, }, }, }, }, });
    subject.b.e.h.remove([ 'x', 'j', ]);
    expect(subject.state).toEqual({ a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, }, }, }, });
  });

  test(' should be able to remove multiple children little by little', () => {
    const { subject, } = init({ a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, x: { t: -1, }, j: { z: -0, }, }, }, }, });
    subject.b.e.h.remove([ 'x', ]);
    expect(subject.state).toEqual({ a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, j: { z: -0, }, }, }, }, });
    subject.b.e.remove([ 'h', ]);
    subject.b.remove([ 'e', ]);
    expect(subject.state).toEqual({ a: 1, b: { c: 2, d: 3, }, });
  });

  test(' sub subject should be removed', () => {
    const { subject, } = init({ root: { a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, x: { t: -1, }, j: { z: -0, }, }, }, }, }, });
    subject.root.remove([ 'b', ]);
    expect(subject.b.state).toEqual(undefined);
    expect(subject.root.state.b).toEqual(undefined);
  });
});