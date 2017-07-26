import { createStoreWithNonedux as init, } from './utils';
import Branch from '../src/immutability/Branch';

describe('accessing remove node', () => {
  let invalidAccessCalls = [];
  beforeAll(() => {
    Object.defineProperty(Branch, 'onAccessingRemovedBranch', {
      configurable: true,
      writable: true,
      value: (identity, propertyName) => {
        invalidAccessCalls.push({ identity, name: propertyName, });
      },
    });
  });
  beforeEach(() => { invalidAccessCalls = []; });

  test('accessing remove object children', () => {
    const { subject, } = init({ root: { a: [ 1, 2, 3, ], b: { c: 1, d: {}, }, }, });
    const { a, b, } = subject.root;
    const { c, } = b;
    expect(a.state).toBeDefined();
    subject.root.remove('a');
    expect(invalidAccessCalls).toEqual([]);
    expect(a.state).toBeUndefined();
    subject.root.remove('b');
    expect(c.state).toBeUndefined();
    expect(invalidAccessCalls).toEqual([ { identity: 'c, b, root', name: 'state', }, ]);
  });

  test('accessing removed array children', () => {
    const { subject, } = init({ root: [ {}, {child: {subChild: {}}}, {}, {}, ], });
    const { root, } = subject;
    const first = root[0];
    const second = root[1];
    const {subChild} = second.child;
    const fourth = root[3];

    root.remove('1');
    expect(first.state).toBeDefined();
    expect(invalidAccessCalls.length).toEqual(0);
    expect(second.state).toEqual({});

    expect(subChild.state).toBeUndefined()
    expect(invalidAccessCalls).toEqual([ { identity: subChild.getIdentity().join(', '), name: 'state', }, ]);
  });

  test('accessing children of removed value', () => {
    const { subject, } = init({ root: { a: { b: {}, c: { d: { e: {}, }, }, }, x: [ { y: { z: {}, }, }, ], i: [ { j: [], }, ], }, });

    const { a, } = subject.root;
    const { c, } = a;
    const { d, } =c;
    const { e, } = d;
    const firstGroup = [ c, d, e, ];
    firstGroup.forEach(({ state, }) => expect(state).toBeDefined());
    expect(invalidAccessCalls).toEqual([]);
    subject.root.remove('a');
    firstGroup.forEach(({ state, }) => expect(state).toBeUndefined());

    expect(invalidAccessCalls).toEqual(firstGroup
          .reduce((acc, it) => acc
            .concat([ { identity: it.getIdentity().join(', '), name: 'state', }, ]), []));

    invalidAccessCalls = [];
    const { x, } = subject.root;
    const xFirst = x[0];
    const { y, } = xFirst;
    const { z, } = y;
    const secondGroup = [ y, z, ];
    secondGroup.forEach(({ state, }) => expect(state).toBeDefined());
    subject.root.remove('x');

    secondGroup.forEach(({ state, }) => expect(state).toBeUndefined());
    expect(invalidAccessCalls).toEqual(secondGroup.map(it => ({ name: 'state', identity: it.getIdentity().join(', '), })));

    invalidAccessCalls = [];
    const { i, } = subject.root;
    const iFirst = i[0];
    const { j, } = iFirst;
    const thirdGroup = [ i[0], iFirst, j, ];
    thirdGroup.forEach(({ state, }) => expect(state).toBeDefined());

    expect(invalidAccessCalls).toEqual([]);
    subject.root.remove('i');
    thirdGroup.forEach(({ state, }) => expect(state).toBeUndefined());
    expect(invalidAccessCalls)
          .toEqual(thirdGroup
            .reduce((acc, it) => acc
              .concat({ name: 'state', identity: it.getIdentity().join(', '), }), []));
  });
});

