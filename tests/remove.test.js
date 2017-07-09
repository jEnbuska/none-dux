import { createStoreWithNonedux, } from './utils';

describe('remove', () => {
  let subject;
  test('removing the root subject should be ok',
    () => {
      subject = createStoreWithNonedux({ a: {}, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, x: { t: -1, }, j: { z: -0, }, }, }, }, });
      subject.remove([ 'b', ]);
      expect(subject.state).toEqual({ a: {}, });
    });

  test('removing leaf from object',
    () => {
      subject = createStoreWithNonedux({ a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, x: { t: -1, }, j: { z: -0, }, }, }, }, });
      subject.b.remove([ 'd', ]);
      expect(subject.state).toEqual({ a: 1, b: { c: 2, e: { f: 4, g: 7, h: { i: 100, x: { t: -1, }, j: { z: -0, }, }, }, }, });
    });

  test('the number of children should match the non removed children',
    () => {
      subject = createStoreWithNonedux({});
      subject.setState({ a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, x: {}, j: { z: -0, }, }, }, }, });
      let children = subject.getChildrenRecursively();
      expect(children.length).toEqual(5);
      subject.b.e.remove([ 'h', ]);
      children = subject.getChildrenRecursively();
      expect(children.length).toEqual(2);
    });

  test('remove sub object',
    () => {
      subject = createStoreWithNonedux({ a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, x: { t: -1, }, j: { z: -0, }, }, }, }, });
      subject.b.e.h.remove('x');
      expect(subject.state).toEqual({ a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, j: { z: -0, }, }, }, }, });
      subject.b.remove([ 'd', ]);
      subject.remove([ 'b', ]);
      expect(subject.state).toEqual({ a: 1, });
    });

  test('should be able to remove an empty child',
    () => {
      subject = createStoreWithNonedux({ a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, x: {}, j: { z: -0, }, }, }, }, });
      subject.b.e.h.remove([ 'x', ]);
      expect(subject.state).toEqual({ a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, j: { z: -0, }, }, }, }, });
    });

  test('should be able to remove undefined value',
    () => {
      subject = createStoreWithNonedux({ a: 1, b: { c: undefined, d: undefined, e: { f: 4, g: 7, }, }, });
      subject.b.remove([ 'd', ]);
      expect(subject.state).toEqual({ a: 1, b: { c: undefined, e: { f: 4, g: 7, }, }, });
    });

  test('should be able to remove multiple children at ones',
    () => {
      subject = createStoreWithNonedux({ a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, x: {}, j: { z: -0, }, }, }, }, });
      subject.b.e.h.remove([ 'x', 'j', ]);
      expect(subject.state).toEqual({ a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, }, }, }, });
    });

  test('should be able to remove multiple children little by little',
    () => {
      subject = createStoreWithNonedux({ a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, x: { t: -1, }, j: { z: -0, }, }, }, }, });
      subject.b.e.h.remove([ 'x', ]);
      expect(subject.state).toEqual({ a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, j: { z: -0, }, }, }, }, });
      subject.b.e.remove([ 'h', ]);
      subject.b.remove([ 'e', ]);
      expect(subject.state).toEqual({ a: 1, b: { c: 2, d: 3, }, });
    });

  test('sub subject should be removed',
    () => {
      subject = createStoreWithNonedux({ a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, x: { t: -1, }, j: { z: -0, }, }, }, }, });
      subject.remove([ 'b', ]);
      expect(subject.b).toEqual(undefined);
      expect(subject.state.b).toEqual(undefined);
    });
});