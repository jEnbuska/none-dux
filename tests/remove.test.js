
import nonedux from '../src/createNoneDux';

describe('_onRemove', () => {
  let subject;
  test('removing the root subject should be ok',
    () => {
      subject = nonedux({ a: {}, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, x: { t: -1, }, j: { z: -0, }, }, }, }, }).subject;
      subject._onRemove([ 'b', ]);
      expect(subject.state).toEqual({ a: {}, });
    });

  test('removing leaf from object',
    () => {
      subject = nonedux({ a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, x: { t: -1, }, j: { z: -0, }, }, }, }, }).subject;
      subject.b._onRemove([ 'd', ]);
      expect(subject.state).toEqual({ a: 1, b: { c: 2, e: { f: 4, g: 7, h: { i: 100, x: { t: -1, }, j: { z: -0, }, }, }, }, });
    });

  test('the number of children should match the non _onRemoved children',
    () => {
      subject = nonedux({}).subject;
      subject._onSetState({ a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, x: {}, j: { z: -0, }, }, }, }, }).subject;
      let children = subject.getChildrenRecursively();
      expect(children.length).toEqual(5);
      subject.b.e._onRemove([ 'h', ]);
      children = subject.getChildrenRecursively();
      expect(children.length).toEqual(2);
    });

  test('_onRemove sub object',
    () => {
      subject = nonedux({ a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, x: { t: -1, }, j: { z: -0, }, }, }, }, }).subject;
      subject.b.e.h._onRemove([ 'x', ]);
      expect(subject.state).toEqual({ a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, j: { z: -0, }, }, }, }, });
      subject.b._onRemove([ 'd', ]);
      subject._onRemove([ 'b', ]);
      expect(subject.state).toEqual({ a: 1, });
    });

  test('should be able to _onRemove an empty child',
    () => {
      subject = nonedux({ a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, x: {}, j: { z: -0, }, }, }, }, }).subject;
      subject.b.e.h._onRemove([ 'x', ]);
      expect(subject.state).toEqual({ a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, j: { z: -0, }, }, }, }, });
    });

  test('should be able to _onRemove undefined value',
    () => {
      subject = nonedux({ a: 1, b: { c: undefined, d: undefined, e: { f: 4, g: 7, }, }, }).subject;
      subject.b._onRemove([ 'd', ]);
      expect(subject.state).toEqual({ a: 1, b: { c: undefined, e: { f: 4, g: 7, }, }, });
    });

  test('should be able to _onRemove multiple children at ones',
    () => {
      subject = nonedux({ a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, x: {}, j: { z: -0, }, }, }, }, }).subject;
      subject.b.e.h._onRemove([ 'x', 'j', ]);
      expect(subject.state).toEqual({ a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, }, }, }, });
    });

  test('should be able to remove multiple children little by little',
    () => {
      subject = nonedux({ a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, x: { t: -1, }, j: { z: -0, }, }, }, }, }).subject;
      subject.b.e.h._onRemove([ 'x', ]);
      expect(subject.state).toEqual({ a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, j: { z: -0, }, }, }, }, });
      subject.b.e._onRemove([ 'h', ]);
      subject.b._onRemove([ 'e', ]);
      expect(subject.state).toEqual({ a: 1, b: { c: 2, d: 3, }, });
    });

  test('sub subject should be _onRemoved',
    () => {
      subject = nonedux({ a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, h: { i: 100, x: { t: -1, }, j: { z: -0, }, }, }, }, }).subject;
      subject._onRemove([ 'b', ]);
      expect(subject.b).toEqual(undefined);
      expect(subject.state.b).toEqual(undefined);
    });

  test('state should be shift after removal',
    () => {
      subject = nonedux({ a: 1, b: { c: 'test', d: { x: 1, }, }, }).subject;
      const { b, } = subject;
      const { d, } = subject.b;
      subject._onRemove([ 'b', ]);
      expect(d.state).toBe(undefined);
      expect(d.prevState).toEqual({ x: 1, });
      expect(b.state).toBe(undefined);
      expect(b.prevState).toEqual({ c: 'test', d: { x: 1, }, });
    });
});