import { createStoreWithNonedux, } from './utils';
import Branch from '../src/immutability/Branch';
import { invalidReferenceHandler, SET_STATE, CLEAR_STATE, REMOVE, GET_STATE, GET_PREV_STATE, } from '../src/common';

describe('arrays', () => {
  [ 'legacy', 'proxy', ].forEach(name => {
    const init = state => createStoreWithNonedux(state, undefined, undefined, name === 'proxy');
    describe('run ' + name + ' configuration',
      () => {
        let invalidAccessCalls = [];

        beforeAll(() => {
          Object.defineProperty(Branch,
            'onAccessingRemovedBranch',
            {
              configurable: true,
              writable: true,
              value: (id, propertyName) => {
                invalidAccessCalls.push({ id, name: propertyName, });
              },
            });

          Object.assign(invalidReferenceHandler,
            {
              [SET_STATE]: () => { },
              [CLEAR_STATE]: () => { },
              [REMOVE]: () => { },
              [GET_STATE]: () => { },
              [GET_PREV_STATE]: () => { },
            }
          );
        });

        beforeEach(() => { invalidAccessCalls = []; });

        test(name + ' sub state should stay as array',
          () => {
            const { subject, } = init({ a: [ 1, 2, 3, ], });
            expect(subject.state).toEqual({ a: [ 1, 2, 3, ], });
            expect(subject.a.state[0]).toEqual(1);
          });

        test(name + ' remove from array in arbitrary order',
          () => {
            const { subject: { root, }, } = init({ root: [ { a: 1, }, { b: 2, }, { c: 3, }, { d: 4, }, { e: 5, }, { f: 6, }, { g: 7, }, { h: 8, }, ], });
            root.remove([ 3, 1, 0, 7, ]);
            expect(root.state).toEqual([ { c: 3, }, { e: 5, }, { f: 6, }, { g: 7, }, ]);
            expect(root[0].state).toEqual({ c: 3, });
            expect(root[1].state).toEqual({ e: 5, });
            expect(root[2].state).toEqual({ f: 6, });
            expect(root[3].state).toEqual({ g: 7, });
            expect(root[4]).toEqual(undefined);
            expect(root[5]).toEqual(undefined);
            expect(root[6]).toEqual(undefined);
            expect(root[7]).toEqual(undefined);
          });

        test(name + ' remove pre accessed children from array in arbitrary order',
          () => {
            const { subject: { root, }, } = init({ root: [ { a: 1, }, { b: 2, }, { c: 3, }, { d: 4, }, { e: 5, }, { f: 6, }, { g: 7, }, { h: 8, }, ], });
            for (let i = 0; i<8; i++) {
              expect(root[i]).toBeDefined();
            }
            root.remove([ 3, 1, 0, 7, ]);
            expect(root.state).toEqual([ { c: 3, }, { e: 5, }, { f: 6, }, { g: 7, }, ]);
            expect(root[0].state).toEqual({ c: 3, });
            expect(root[1].state).toEqual({ e: 5, });
            expect(root[2].state).toEqual({ f: 6, });
            expect(root[3].state).toEqual({ g: 7, });
            expect(root[4]).toEqual(undefined);
            expect(root[5]).toEqual(undefined);
            expect(root[6]).toEqual(undefined);
            expect(root[7]).toEqual(undefined);
          });

        test(name + ' remove from array in arbitrary order, preAccessed children',
          () => {
            const { subject: { root, }, } = init({ root: [ { a: 1, }, { b: 2, }, { c: 3, }, { d: 4, }, { e: 5, }, { f: 6, }, { g: 7, }, { h: 8, }, ], });
            root.remove([ 3, 1, 0, 7, ]);
            expect(root.state).toEqual([ { c: 3, }, { e: 5, }, { f: 6, }, { g: 7, }, ]);
            expect(root[0].state).toEqual({ c: 3, });
            expect(root[1].state).toEqual({ e: 5, });
            expect(root[2].state).toEqual({ f: 6, });
            expect(root[3].state).toEqual({ g: 7, });
            expect(root[4]).toEqual(undefined);
            expect(root[5]).toEqual(undefined);
            expect(root[6]).toEqual(undefined);
            expect(root[7]).toEqual(undefined);
          });

        test(name + ' should replace current array sub state with a array',
          () => {
            const { subject, } = init({ a: [ 1, 2, { b: 2, }, ], });
            expect(subject.state).toEqual({ a: [ 1, 2, { b: 2, }, ], });
            subject.clearState({ a: [ 'abc', { test: 'empty', }, 2, 3, 4, ], });
            expect(subject.state).toEqual({ a: [ 'abc', { test: 'empty', }, 2, 3, 4, ], });
            expect(subject.a[1].state.test).toEqual('empty');
            subject.clearState({ a: [ 1, 2, [], ], });
            expect(subject.state).toEqual({ a: [ 1, 2, [], ], });
            expect(subject.a.state).toEqual([ 1, 2, [], ]);
          });

        test(name + ' calling set state to array state should erase old array',
          () => {
            const { subject: { root, }, } = init({ root: [], });
            root.clearState([ 1, 2, { b: 2, }, ]);
            expect(root.state).toEqual([ 1, 2, { b: 2, }, ]);
            root.clearState([ 'abc', { test: 'empty', }, 2, 3, 4, ]);
            expect(root.state).toEqual([ 'abc', { test: 'empty', }, 2, 3, 4, ]);
            root.clearState([ 1, 2, [], ]);
            expect(root.state).toEqual([ 1, 2, [], ]);
          });

        test(name + ' kill old references',
          () => {
            const { subject: { root, }, } = init({ root: [ 'abc', 1, { test: 'empty', }, { toBeRmd: 0, }, 3, 4, ], });
            expect(root.state).toEqual([ 'abc', 1, { test: 'empty', }, { toBeRmd: 0, }, 3, 4, ]);
            root.clearState([ 1, 2, [], ]);
            expect(root.state).toEqual([ 1, 2, [], ]);
            expect(root[3]).toEqual(undefined);
          });

        test(name + ' array to object should not merge',
          () => {
            const { subject: { root, }, } = init({ root: [ { a: 1, }, { b: 2, }, { c: 3, }, ], });
            expect(root.state).toEqual([ { a: 1, }, { b: 2, }, { c: 3, }, ]);
            root.clearState({ 0: { a: 1, }, obj: { test: 'empty', }, 2: '1b', x: 3, });
            expect(root.state).toEqual({ 0: { a: 1, }, obj: { test: 'empty', }, 2: '1b', x: 3, });
          });

        test(name + ' object to array should not merge',
          () => {
            const { subject: { root, }, } = init({ root: { 0: 1, 1: { b: 2, }, 2: { c: 3, }, }, });
            expect(root.state).toEqual({ 0: 1, 1: { b: 2, }, 2: { c: 3, }, });
            root.clearState([ 3, 2, ]);
            expect(root.state).toEqual([ 3, 2, ]);
          });

        test(name + ' array to array should not merge',
          () => {
            const { subject: { root, }, } = init({ root: [ 1, { a: 1, }, 3, 4, ], });
            expect(root.state).toEqual([ 1, { a: 1, }, 3, 4, ]);
            root.clearState([ { x: 2, }, 2, ]);
            expect(root.state).toEqual([ { x: 2, }, 2, ]);
          });

        test(name + ' removing from array',
          () => {
            const { subject: { root, }, } = init({ root: [ { a: 1, }, { b: 2, }, { c: 3, }, 3, 4, 5, 6, ], });
            root.remove([ 0, 2, 6, ]);
            expect(root.state).toEqual([ { b: 2, }, 3, 4, 5, ]);
            expect(root.state[0]).toEqual({ b: 2, });
            expect(root.state[1]).toEqual(3);
            expect(root.state[2]).toEqual(4);
            expect(root.state[3]).toEqual(5);
          });

        test(name + ' array state should shift',
          () => {
            const { subject: { root, }, } = init({ root: [ 0, 1, { toBeRemoved: 2, }, 3, { toBeKept: 4, }, 5, 6, ], });
            const third = root[2];
            root.remove(2);
            expect(root.state).toEqual([ 0, 1, 3, { toBeKept: 4, }, 5, 6, ]);
            expect(third.state).toEqual(undefined);
            expect(root.state[2]).toEqual(3);
            expect(root[3].state).toEqual({ toBeKept: 4, });
          });

        test(name + ' changing children of array',
          () => {
            const { subject, } = init([ { a: { b: 2, }, }, 1, ]);
            subject[0].a.setState({ b: 100, });
            expect(subject.state).toEqual([ { a: { b: 100, }, }, 1, ]);
          });

        test(name + ' leaf state to array',
          () => {
            {
              const { subject, } = init({ reducer: { val: null, }, });
              expect(subject.state.reducer.val).toEqual(null);
              subject.reducer.clearState([ 1, 2, { a: 3, }, ]);
              expect(subject.reducer.state).toEqual([ 1, 2, { a: 3, }, ]);
            }
            {
              const { subject, } = init({ reducer: { s: 0, }, });
              expect(subject.state.reducer.s).toEqual(0);
              subject.reducer.setState({ s: [ 1, 2, { a: 3, }, ], });
              expect(subject.reducer.s.state).toEqual([ 1, 2, { a: 3, }, ]);
            }
            {
              const { subject, } = init({ s: /test/, });
              expect(subject.state.s.toString()).toEqual('/test/');
              subject.setState({ s: [ 1, 2, { a: 3, }, ], });
              expect(subject.s.state).toEqual([ 1, 2, { a: 3, }, ]);
            }
            {
              const symbol = Symbol('test');
              const { subject, } = init({ s: symbol, });
              expect(subject.state.s).toEqual(symbol);
              subject.setState({ s: [ 1, 2, { a: 3, }, ], });
              expect(subject.s.state).toEqual([ 1, 2, { a: 3, }, ]);
            }
          });

        test(name + ' array to leaf',
          () => {
            {
              const { subject, } = init({ content: [ 1, 2, { a: 3, }, ], });
              expect(subject.state).toEqual({ content: [ 1, 2, { a: 3, }, ], });
              subject.setState({ content: null, });
              expect(subject.state.content).toEqual(null);
            }
            {
              const { subject, } = init({ content: [ 1, 2, { a: 3, }, ], });
              expect(subject.state).toEqual({ content: [ 1, 2, { a: 3, }, ], });
              subject.setState({ content: 0, });
              expect(subject.state.content).toEqual(0);
            }
            {
              const { subject, } = init({ content: [ 1, 2, { a: 3, }, ], });
              expect(subject.state).toEqual({ content: [ 1, 2, { a: 3, }, ], });
              subject.setState({ content: /test/, });
              expect(subject.state.content.toString()).toEqual('/test/');
            }
            {
              const { subject, } = init({ content: [ 1, 2, { a: 3, }, ], });

              expect(subject.state).toEqual({ content: [ 1, 2, { a: 3, }, ], });
              const symbol = Symbol('test');
              subject.setState({ content: symbol, });
              expect(subject.state.content).toEqual(symbol);
            }
          });

        test(name + ' shift array values',
          () => {
            const { subject, } = init([ { a: 1, }, { b: 2, }, { c: 3, }, ]);
            expect(subject.state).toEqual([ { a: 1, }, { b: 2, }, { c: 3, }, ]);
            const { 0: a, 1: b, 2: c, } = subject;
            subject.clearState([ { c: 3, }, { a: 1, }, { b: 2, }, ]);
            expect(a.state).toEqual({ c: 3, });
            expect(b.state).toEqual({ a: 1, });
            expect(c.state).toEqual({ b: 2, });
            // This is unintuitive. Creating new subjects every time subject gets changed brings it's own challenges
          });
      });
  });
});
