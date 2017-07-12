import { createStoreWithNonedux, } from './utils';
import createLeaf, { StateMapperObjectLeaf, StateMapperArrayLeaf, } from '../src/reducer/StateMapperLeaf';

describe('Leafs', () => {
  test('create autoreducer array leaf', () => {
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

  test('iterate leaf', () => {
    const leaf = createLeaf([ 1, 2, 3, 4, [ { a: 1, }, ], ]);
    expect([ ...leaf, ]).toEqual([ 1, 2, 3, 4, [ { a: 1, }, ], ]);
    expect([ ...leaf, 5, ]).toEqual([ 1, 2, 3, 4, [ { a: 1, }, ], 5, ]);
    const [ first, ...rest ] = leaf;
    expect(first).toBe(1);
    expect(rest).toEqual([ 2, 3, 4, [ { a: 1, }, ], ]);
  });

  test('creating subject with StateMapperObjectLeaf & StateMapperArrayLeafs', () => {
    const { subject } = createStoreWithNonedux({ a: { b: createLeaf({ c: { x: 1, }, d: 2, }), e: createLeaf([ { f: 1, }, 2, ]), }, });
    expect(subject.state).toEqual({ a: { b: new StateMapperObjectLeaf({ c: { x: 1, }, d: 2, }), e: new StateMapperArrayLeaf([ { f: 1, }, 2, ]), }, });
    expect(subject.a.state).toEqual({ b: new StateMapperObjectLeaf({ c: { x: 1, }, d: 2, }), e: new StateMapperArrayLeaf([ { f: 1, }, 2, ]), });
    expect(subject.a.b).toBeUndefined();
    expect(subject.a.e).toBeUndefined();
    expect(subject.a.state.b).toEqual({ c: { x: 1, }, d: 2, });
    expect(subject.a.state.e).toEqual(new StateMapperArrayLeaf([ { f: 1, }, 2, ]));
  });

  test('setState with StateMapperObjectLeaf', () => {
    const { subject } = createStoreWithNonedux({ a: { b: {}, }, });
    expect(subject.state).toEqual({ a: { b: { }, }, });
    expect(subject.a.b.state).toEqual({});
    subject.a.setState({ b: createLeaf({ c: 1, d: 2, }), });
    expect(subject.a.b).toBeUndefined();
    expect(subject.a.state).toEqual({ b: { c: 1, d: 2, }, });
    subject.a.setState({ e: createLeaf({ f: 3, g: 4, }), });
    expect(subject.a.b).toBeUndefined();
    expect(subject.a.e).toBeUndefined();
    expect(subject.a.state).toEqual({ b: { c: 1, d: 2, }, e: { f: 3, g: 4, }, });
  });

  test('clearState with StateMapperObjectLeaf', () => {
    const { subject } = createStoreWithNonedux({ a: { b: {}, c: 2, d: {}, }, });
    expect(subject.state).toEqual({ a: { b: {}, c: 2, d: {}, }, });
    expect(subject.a.b.state).toEqual({});
    subject.a.clearState({ b: createLeaf({ c: 1, d: 2, }), });
    expect(subject.a.b).toBeUndefined();
    expect(subject.a.state).toEqual({ b: { c: 1, d: 2, }, });
  });

  test('remove StateMapperObjectLeaf', () => {
    const { subject } = createStoreWithNonedux({ a: { b: createLeaf({ c: 1, d: 2, }), }, });
    subject.a.remove('b');
    expect(subject.a.state).toEqual({});
  });

  test('Add Error type', () => {
    const err = new Error('some error');
    const { subject } = createStoreWithNonedux({ a: { err, }, });
    expect(subject.a.err).toBeUndefined();
    expect(subject.a.state.err).toEqual(err);
  });
});
