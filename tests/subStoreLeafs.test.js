
import nonedux from '../src/createNoneDux';
import createLeaf, { SubStoreObjectLeaf, SubStoreArrayLeaf, } from '../src/SubStoreLeaf';

describe('Leafs', () => {
  test('create substore array leaf', () => {
    const leaf = createLeaf([ 1, 2, { a: 3, b: { c: 4, }, }, 'd', ]);
    const acc = {};
    leaf.forEach((v, i) => acc[i]=v);
    expect(acc).toEqual({ 0: 1, 1: 2, 2: { a: 3, b: { c: 4, }, }, 3: 'd', });
    expect(Object.values(acc)).toEqual([ 1, 2, { a: 3, b: { c: 4, }, }, 'd', ]);
    const [ ...arr ] = leaf;
    expect(Object.values(leaf)).toEqual([ 1, 2, { a: 3, b: { c: 4, }, }, 'd', ]);
    expect(Object.keys(leaf)).toEqual([ '0', '1', '2', '3', ]);
    expect(Object.entries(leaf)).toEqual([ [ '0', 1, ], [ '1', 2, ], [ '2', { a: 3, b: { c: 4, }, }, ], [ '3', 'd', ], ]);
    expect(arr).toEqual([ 1, 2, { a: 3, b: { c: 4, }, }, 'd', ]);
    expect(leaf.reduce((acc, next, i) => Object.assign(acc, { [i]: next, }), {})).toEqual({ 0: 1, 1: 2, 2: { a: 3, b: { c: 4, }, }, 3: 'd', });
    expect(leaf.map(it => it)).toEqual([ 1, 2, { a: 3, b: { c: 4, }, }, 'd', ]);
    expect(leaf.filter((n, i) => i%2===0)).toEqual([ 1, { a: 3, b: { c: 4, }, }, ]);
    expect(leaf.every((n, i) => Number.isInteger(i))).toEqual(true);
    expect(leaf.every((n, i) => Number.isInteger(n))).toEqual(false);
    expect(leaf.some((n, i) => Number.isInteger(n))).toEqual(true);
    expect(leaf.some((n, i) => n instanceof Array)).toEqual(false);
  });

  test('creating subject with SubStoreObjectLeaf & SubStoreArrayLeafs', () => {
    const { subject, } = nonedux({ a: { b: createLeaf({ c: { x: 1, }, d: 2, }), e: createLeaf([ { f: 1, }, 2, ]), }, });
    expect(subject.state).toEqual({ a: { b: new SubStoreObjectLeaf({ c: { x: 1, }, d: 2, }), e: new SubStoreArrayLeaf([ { f: 1, }, 2, ]), }, });
    expect(subject.a.state).toEqual({ b: new SubStoreObjectLeaf({ c: { x: 1, }, d: 2, }), e: new SubStoreArrayLeaf([ { f: 1, }, 2, ]), });
    expect(subject.a.b).toBeUndefined();
    expect(subject.a.e).toBeUndefined();
    expect(subject.a.state.b).toEqual({ c: { x: 1, }, d: 2, });
    expect(subject.a.state.e).toEqual(new SubStoreArrayLeaf([ { f: 1, }, 2, ]));
  });

  test('setState with SubStoreObjectLeaf', () => {
    const { subject, } = nonedux({ a: { b: {}, }, });
    expect(subject.state).toEqual({ a: { b: { }, }, });
    expect(subject.a.b.state).toEqual({});
    subject.a._onSetState({ b: createLeaf({ c: 1, d: 2, }), });
    expect(subject.a.b).toBeUndefined();
    expect(subject.a.state).toEqual({ b: { c: 1, d: 2, }, });
    subject.a._onSetState({ e: createLeaf({ f: 3, g: 4, }), });
    expect(subject.a.b).toBeUndefined();
    expect(subject.a.e).toBeUndefined();
    expect(subject.a.state).toEqual({ b: { c: 1, d: 2, }, e: { f: 3, g: 4, }, });
  });

  test('_onClearState with SubStoreObjectLeaf', () => {
    const { subject, } = nonedux({ a: { b: {}, c: 2, d: {}, }, });
    expect(subject.state).toEqual({ a: { b: {}, c: 2, d: {}, }, });
    expect(subject.a.b.state).toEqual({});
    subject.a._onClearState({ b: createLeaf({ c: 1, d: 2, }), });
    expect(subject.a.b).toBeUndefined();
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
    expect(subject.a.err).toBeUndefined();
    expect(subject.a.state.err).toEqual(err);
  });
});
