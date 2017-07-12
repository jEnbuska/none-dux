import { createStoreWithNonedux, } from './utils';
import StateMapper from '../src/reducer/StateMapper';

describe('arrays as state', () => {
  let invalidAccessCalls = [];
  beforeAll(() => {
    Object.defineProperty(StateMapper, 'onAccessingRemovedNode', {
      configurable: true,
      writable: true,
      value: (id, propertyName) => {
        invalidAccessCalls.push({ id, name: propertyName, });
      },
    });
  });

  beforeEach(() => { invalidAccessCalls = []; });

  test('accessing remove object children', () => {
    const { subject, } = createStoreWithNonedux({ a: [ 1, 2, 3, ], b: { c: 1, d: {}, }, });
    const { a, } = subject;
    expect(a.state).toBeDefined();
    subject.remove('a');
    expect(invalidAccessCalls.length).toBe(0);
    expect(a.state).toBeUndefined();
    expect(a.prevState).toEqual([ 1, 2, 3, ]);
    expect(invalidAccessCalls).toEqual([ { id: 'a', name: 'state', }, ]);

    expect(invalidAccessCalls).toEqual([ { id: 'a', name: 'state', }, ]);

    const { d, } = subject.b;
    subject.b.remove('d');
    expect(d.state).toBeUndefined();
    expect(d.prevState).toEqual({});
    expect(invalidAccessCalls).toEqual([ { id: 'a', name: 'state', }, { id: 'd', name: 'state', }, ]);
  });

  test('accessing removed array children', () => {
    const { subject, } = createStoreWithNonedux([ {}, {}, {}, {}, ]);
    const first = subject[0];
    const second = subject[1];
    const third = subject[2];
    const fourth = subject[3];

    subject.remove('1');
    expect(first.state).toBeDefined();
    expect(first.prevState).toBeDefined();
    expect(invalidAccessCalls.length).toEqual(0);
    expect(second.state).toBeUndefined();
    expect(second.prevState).toEqual({});
    expect(invalidAccessCalls).toEqual([ { id: '1', name: 'state', }, ]);
    expect(third.state).toBeDefined();
    expect(fourth.state).toBeDefined();
    expect(invalidAccessCalls).toEqual([ { id: '1', name: 'state', }, ]);
  });

  test('accessing children of removed value', () => {
    const { subject, } = createStoreWithNonedux({ a: { b: {}, c: { d: { e: {}, }, }, }, x: [ { y: { z: {}, }, }, ], i: [ { j: [], }, ], });

    const { a: { c, }, } = subject;
    const { d, } =c;
    const { e, } = d;
    const firstGroup = [ c, d, e, ];
    firstGroup.forEach(({ state, }) => expect(state).toBeDefined());
    expect(invalidAccessCalls).toEqual([]);
    c.removeSelf();

    firstGroup.forEach(({ state, prevState, }) => {
      expect(state).toBeUndefined();
      expect(prevState).toBeDefined();
    });

    expect(invalidAccessCalls).toEqual(firstGroup
      .reduce((acc, it) => acc
        .concat([ { id: it.getId(), name: 'state', }, ]), []));

    invalidAccessCalls = [];
    const { x, } = subject;
    const xFirst = x[0];
    const { y, } = xFirst;
    const { z, } = y;
    const secondGroup = [ x, xFirst, y, z, ];
    secondGroup.forEach(({ state, }) => expect(state).toBeDefined());
    x.removeSelf();

    secondGroup.forEach(({ state, }) => expect(state).toBeUndefined());
    expect(invalidAccessCalls).toEqual(secondGroup.map(it => ({ name: 'state', id: it.getId(), })));

    invalidAccessCalls = [];
    const { i, } = subject;
    const iFirst = i[0];
    const { j, } = iFirst;
    const thirdGroup = [ i, iFirst, j, ];
    thirdGroup.forEach(({ state, }) => expect(state).toBeDefined());

    expect(invalidAccessCalls).toEqual([]);
    i.removeSelf();
    thirdGroup.forEach(({ state, }) => expect(state).toBeUndefined());
    expect(invalidAccessCalls)
      .toEqual(thirdGroup
      .reduce((acc, it) => acc
      .concat({ name: 'state', id: it.getId(), }), []));
  });
});

