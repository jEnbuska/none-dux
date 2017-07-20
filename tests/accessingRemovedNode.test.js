import { createStoreWithNonedux, } from './utils';
import StateMapper from '../src/reducer/StateMapper';

describe('arrays as state', () => {
  let invalidAccessCalls = [];

  [ 'legacy', 'proxy' ].forEach(name => {
    const init = state => createStoreWithNonedux(state, undefined, undefined, name==='proxy');
    describe('run ' + name +' configuration', () => {
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
        const { subject, } = init({ root: { a: [ 1, 2, 3, ], b: { c: 1, d: {}, }, }, });
        const { a, } = subject.root;
        expect(a.state).toBeDefined();
        subject.root.remove('a');
        expect(invalidAccessCalls.length).toBe(0);
        expect(a.state).toBeUndefined();
        expect(invalidAccessCalls).toEqual([ { id: 'a', name: 'state', }, ]);
        expect(invalidAccessCalls).toEqual([ { id: 'a', name: 'state', }, ]);

        const { d, } = subject.root.b;
        subject.root.b.remove('d');
        expect(d.state).toBeUndefined();
        expect(invalidAccessCalls).toEqual([ { id: 'a', name: 'state', }, { id: 'd', name: 'state', }, ]);
      });

      test('accessing removed array children', () => {
        const { subject, } = init({ root: [ {}, {}, {}, {}, ], });
        const { root, } = subject;
        const first = root[0];
        const second = root[1];
        const third = root[2];
        const fourth = root[3];

        root.remove('1');
        expect(first.state).toBeDefined();
        expect(invalidAccessCalls.length).toEqual(0);
        expect(second.state).toBeUndefined();
        expect(invalidAccessCalls).toEqual([ { id: '1', name: 'state', }, ]);
        expect(third.state).toBeDefined();
        expect(fourth.state).toBeDefined();
        expect(invalidAccessCalls).toEqual([ { id: '1', name: 'state', }, ]);
      });

      test('accessing children of removed value', () => {
        const { subject, } = init({ root: { a: { b: {}, c: { d: { e: {}, }, }, }, x: [ { y: { z: {}, }, }, ], i: [ { j: [], }, ], } });

        const { a: { c, }, } = subject.root;
        const { d, } =c;
        const { e, } = d;
        const firstGroup = [ c, d, e, ];
        firstGroup.forEach(({ state, }) => expect(state).toBeDefined());
        expect(invalidAccessCalls).toEqual([]);
        c.removeSelf();

        firstGroup.forEach(({ state, }) => expect(state).toBeUndefined());

        expect(invalidAccessCalls).toEqual(firstGroup
          .reduce((acc, it) => acc
            .concat([ { id: it.getId(), name: 'state', }, ]), []));

        invalidAccessCalls = [];
        const { x, } = subject.root;
        const xFirst = x[0];
        const { y, } = xFirst;
        const { z, } = y;
        const secondGroup = [ x, xFirst, y, z, ];
        secondGroup.forEach(({ state, }) => expect(state).toBeDefined());
        x.removeSelf();

        secondGroup.forEach(({ state, }) => expect(state).toBeUndefined());
        expect(invalidAccessCalls).toEqual(secondGroup.map(it => ({ name: 'state', id: it.getId(), })));

        invalidAccessCalls = [];
        const { i, } = subject.root;
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
  });
});

