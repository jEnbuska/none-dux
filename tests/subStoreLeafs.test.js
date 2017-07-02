
import nonedux from '../src/createNoneDux';
import createLeaf from '../src/SubStoreLeaf';

describe('SubStoreLeaf', () => {
  test('creating subject with SubStoreObjectLeaf', () => {
    const { subject, } = nonedux({ a: { b: createLeaf({ c: 1, d: 2, }), }, });
    expect(subject.state).toEqual({ a: { b: { c: 1, d: 2, }, }, });
    expect(subject.a.b).toBe(undefined);
    expect(subject.a.state).toEqual({ b: { c: 1, d: 2, }, });
  });

  test('creating subject with SubStoreArrayLeaf', () => {
    const { subject, } = nonedux({ a: { b: createLeaf([ 1, 2, 3, 4, ]), }, });
    expect(subject.state).toEqual({ a: { b: [ 1, 2, 3, 4, ], }, });
    expect(subject.a.state).toEqual({ b: [ 1, 2, 3, 4, ], });
    expect(subject.a.b.state).toEqual([ 1, 2, 3, 4, ]);
    expect(subject.a.b[0]).toBe(undefined);
  });

  test('setState with SubStoreObjectLeaf', () => {
    const { subject, } = nonedux({ a: { b: {}, }, });
    expect(subject.state).toEqual({ a: { b: { }, }, });
    expect(subject.a.b.state).toEqual({});
    subject.a._onSetState({ b: createLeaf({ c: 1, d: 2, }), });
    expect(subject.a.b).toBe(undefined);
    expect(subject.a.state).toEqual({ b: { c: 1, d: 2, }, });
    subject.a._onSetState({ e: createLeaf({ f: 3, g: 4, }), });
    expect(subject.a.b).toBe(undefined);
    expect(subject.a.e).toBe(undefined);
    expect(subject.a.state).toEqual({ b: { c: 1, d: 2, }, e: { f: 3, g: 4, }, });
  });

  test('_onClearState with SubStoreObjectLeaf', () => {
    const { subject, } = nonedux({ a: { b: {}, c: 2, d: {}, }, });
    expect(subject.state).toEqual({ a: { b: {}, c: 2, d: {}, }, });
    expect(subject.a.b.state).toEqual({});
    subject.a._onClearState({ b: createLeaf({ c: 1, d: 2, }), });
    expect(subject.a.b).toBe(undefined);
    expect(subject.a.state).toEqual({ b: { c: 1, d: 2, }, });
  });

  test('_onRemove SubStoreObjectLeaf', () => {
    const { subject, } = nonedux({ a: { b: createLeaf({ c: 1, d: 2, }), }, });
    subject.a._onRemove('b');
    expect(subject.a.state).toEqual({});
  });

  test('Add Error type', () => {
    const err = new Error('some error');
    const { subject, } = nonedux({ a: { err, }, });
    expect(subject.a.err).toBe(undefined);
    expect(subject.a.state.err).toEqual(err);
  });
});
