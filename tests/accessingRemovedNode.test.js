import { createStoreWithNonedux, } from './utils';
import AutoReducer from '../src/reducer/AutoReducer';

describe('arrays as state', () => {
  let invalidAccessCalls = [];
  beforeAll(() => {
    Object.defineProperty(AutoReducer, 'onAccessingRemovedNode', {
      configurable: true,
      writable: true,
      value: (id, propertyName) => {
        invalidAccessCalls.push({ id, name: propertyName, });
      },
    });
  });

  beforeEach(() => { invalidAccessCalls = []; });

  test('accessing remove object children', () => {
    const subject = createStoreWithNonedux({ a: [ 1, 2, 3, ], b: { c: 1, d: {}, }, });
    const { a, } = subject;
    expect(a.state).toBeDefined();
    subject.remove('a');
    expect(invalidAccessCalls.length).toBe(0);
    expect(a.state).toBeUndefined();
    expect(invalidAccessCalls).toEqual([ { id: 'a', name: 'state', }, ]);
    expect(a.prevState).toBeUndefined();
    expect(invalidAccessCalls).toEqual([ { id: 'a', name: 'state', }, { id: 'a', name: 'prevState', }, ]);

    const { d, } = subject.b;
    subject.b.remove('d');
    expect(d.state).toBeUndefined();
    expect(d.prevState).toBeUndefined();
    expect(invalidAccessCalls).toEqual([ { id: 'a', name: 'state', }, { id: 'a', name: 'prevState', }, { id: 'd', name: 'state', }, { id: 'd', name: 'prevState', }, ]);
  });

  test('accessing removed array children', () => {
    const arrSubject = createStoreWithNonedux([ {}, {}, {}, {}, ]);
    const first = arrSubject[0];
    const second = arrSubject[1];
    const third = arrSubject[2];
    const fourth = arrSubject[3];

    arrSubject.remove('1');
    expect(first.state).toBeDefined();
    expect(first.prevState).toBeDefined();
    expect(invalidAccessCalls.length).toEqual(0);
    expect(second.state).toBeUndefined();
    expect(second.prevState).toBeUndefined();
    expect(invalidAccessCalls).toEqual([ { id: '1', name: 'state', }, { id: '1', name: 'prevState', }, ]);
    expect(third.state).toBeDefined();
    expect(fourth.state).toBeDefined();
    expect(invalidAccessCalls).toEqual([ { id: '1', name: 'state', }, { id: '1', name: 'prevState', }, ]);
  });

  test('accessing children of removed value', () => {
    const subject = createStoreWithNonedux({ a: { b: {}, c: { d: { e: {}, }, }, }, x: [ { y: { z: {}, }, }, ], i: [ { j: [], }, ], });

    const { a: { c, }, } = subject;
    const { d, } =c;
    const { e, } = d;
    const firstGroup = [ c, d, e, ];
    firstGroup.forEach(({ state, }) => expect(state).toBeDefined());
    expect(invalidAccessCalls).toEqual([]);
    c.removeSelf();

    firstGroup.forEach(({ state, prevState, }) => {
      expect(state).toBeUndefined();
      expect(prevState).toBeUndefined();
    });

    expect(invalidAccessCalls).toEqual(firstGroup
      .reduce((acc, it) => acc
        .concat([ { id: it.getId(), name: 'state', }, { id: it.getId(), name: 'prevState', }, ]), []));

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

