import { createStoreWithNonedux, configs, } from './utils';
import Branch from '../src/immutability/Branch';

describe('accessing remove node', () => {
  let invalidAccessCalls = [];

  configs.forEach(name => {
    const init = state => createStoreWithNonedux(state, undefined, undefined, name==='proxy');
    describe('run ' + name +' configuration', () => {
      beforeAll(() => {
        Object.defineProperty(Branch, 'onAccessingRemovedBranch', {
          configurable: true,
          writable: true,
          value: (id, propertyName) => {
            invalidAccessCalls.push({ id, name: propertyName, });
          },
        });
      });
      beforeEach(() => { invalidAccessCalls = []; });

      test('accessing remove object children', () => {
        const { subject, } = init({ child: { a: [ 1, 2, 3, ], b: { c: 1, d: {}, }, }, });
        const { a, } = subject.child;
        expect(a.state).toBeDefined();
        subject.child.remove('a');
        expect(invalidAccessCalls.length).toBe(0);
        expect(a.state).toBeUndefined();
        expect(invalidAccessCalls).toEqual([ { id: 'a', name: 'state', }, ]);
        expect(invalidAccessCalls).toEqual([ { id: 'a', name: 'state', }, ]);

        const { d, } = subject.child.b;
        subject.child.b.remove('d');
        expect(d.state).toBeUndefined();
        expect(invalidAccessCalls).toEqual([ { id: 'a', name: 'state', }, { id: 'd', name: 'state', }, ]);
      });

      test('accessing removed array children', () => {
        const { subject, } = init({ child: [ {}, {}, {}, {}, ], });
        const { child, } = subject;
        const first = child[0];
        const second = child[1];
        const third = child[2];
        const fourth = child[3];

        child.remove('1');
        expect(first.state).toBeDefined();
        expect(invalidAccessCalls.length).toEqual(0);
        expect(second.state).toBeUndefined();
        expect(invalidAccessCalls).toEqual([ { id: '1', name: 'state', }, ]);
        expect(third.state).toBeDefined();
        expect(fourth.state).toBeDefined();
        expect(invalidAccessCalls).toEqual([ { id: '1', name: 'state', }, ]);
      });

      test('accessing children of removed value', () => {
        const { subject, } = init({ child: { a: { b: {}, c: { d: { e: {}, }, }, }, x: [ { y: { z: {}, }, }, ], i: [ { j: [], }, ], }, });

        const { a: { c, }, } = subject.child;
        const { d, } =c;
        const { e, } = d;
        const firstGroup = [ c, d, e, ];
        firstGroup.forEach(({ state, }) => expect(state).toBeDefined());
        expect(invalidAccessCalls).toEqual([]);
        subject.child.a.remove('c');
        firstGroup.forEach(({ state, }) => expect(state).toBeUndefined());

        expect(invalidAccessCalls).toEqual(firstGroup
          .reduce((acc, it) => acc
            .concat([ { id: it.getId(), name: 'state', }, ]), []));

        invalidAccessCalls = [];
        const { x, } = subject.child;
        const xFirst = x[0];
        const { y, } = xFirst;
        const { z, } = y;
        const secondGroup = [ x, xFirst, y, z, ];
        secondGroup.forEach(({ state, }) => expect(state).toBeDefined());
        subject.child.remove('x');

        secondGroup.forEach(({ state, }) => expect(state).toBeUndefined());
        expect(invalidAccessCalls).toEqual(secondGroup.map(it => ({ name: 'state', id: it.getId(), })));

        invalidAccessCalls = [];
        const { i, } = subject.child;
        const iFirst = i[0];
        const { j, } = iFirst;
        const thirdGroup = [ i, iFirst, j, ];
        thirdGroup.forEach(({ state, }) => expect(state).toBeDefined());

        expect(invalidAccessCalls).toEqual([]);
        subject.child.remove('i');
        thirdGroup.forEach(({ state, }) => expect(state).toBeUndefined());
        expect(invalidAccessCalls)
          .toEqual(thirdGroup
            .reduce((acc, it) => acc
              .concat({ name: 'state', id: it.getId(), }), []));
      });
    });
  });
});

