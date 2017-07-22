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
            const { subject: {child}, } = init({child: { a: [ 1, 2, { b: 2, }, ], }});
            expect(child.state).toEqual({ a: [ 1, 2, { b: 2, }, ], });
            child.clearState({ a: [ 'abc', { test: 'empty', }, 2, 3, 4, ], });
            expect(child.state).toEqual({ a: [ 'abc', { test: 'empty', }, 2, 3, 4, ], });
            expect(child.a[1].state.test).toEqual('empty');
            child.clearState({ a: [ 1, 2, [], ], });
            expect(child.state).toEqual({ a: [ 1, 2, [], ], });
            expect(child.a.state).toEqual([ 1, 2, [], ]);
          });

        test(name + ' calling set state to array state should erase old array',
          () => {
            const { subject: { child, }, } = init({ child: [], });
            child.clearState([ 1, 2, { b: 2, }, ]);
            expect(child.state).toEqual([ 1, 2, { b: 2, }, ]);
            child.clearState([ 'abc', { test: 'empty', }, 2, 3, 4, ]);
            expect(child.state).toEqual([ 'abc', { test: 'empty', }, 2, 3, 4, ]);
            child.clearState([ 1, 2, [], ]);
            expect(child.state).toEqual([ 1, 2, [], ]);
          });

        test(name + ' kill old references',
          () => {
            const { subject: { child, }, } = init({ child: [ 'abc', 1, { test: 'empty', }, { toBeRmd: 0, }, 3, 4, ], });
            expect(child.state).toEqual([ 'abc', 1, { test: 'empty', }, { toBeRmd: 0, }, 3, 4, ]);
            child.clearState([ 1, 2, [], ]);
            expect(child.state).toEqual([ 1, 2, [], ]);
            expect(child[3]).toEqual(undefined);
          });

        test(name + ' array to object should not merge',
          () => {
            const { subject: { child, }, } = init({ child: [ { a: 1, }, { b: 2, }, { c: 3, }, ], });
            expect(child.state).toEqual([ { a: 1, }, { b: 2, }, { c: 3, }, ]);
            child.clearState({ 0: { a: 1, }, obj: { test: 'empty', }, 2: '1b', x: 3, });
            expect(child.state).toEqual({ 0: { a: 1, }, obj: { test: 'empty', }, 2: '1b', x: 3, });
          });

        test(name + ' object to array should not merge',
          () => {
            const { subject: { child, }, } = init({ child: { 0: 1, 1: { b: 2, }, 2: { c: 3, }, }, });
            expect(child.state).toEqual({ 0: 1, 1: { b: 2, }, 2: { c: 3, }, });
            child.clearState([ 3, 2, ]);
            expect(child.state).toEqual([ 3, 2, ]);
          });

        test(name + ' array to array should not merge',
          () => {
            const { subject: { child, }, } = init({ child: [ 1, { a: 1, }, 3, 4, ], });
            expect(child.state).toEqual([ 1, { a: 1, }, 3, 4, ]);
            child.clearState([ { x: 2, }, 2, ]);
            expect(child.state).toEqual([ { x: 2, }, 2, ]);
          });

        test(name + ' removing from array',
          () => {
            const { subject: { child, }, } = init({ child: [ { a: 1, }, { b: 2, }, { c: 3, }, 3, 4, 5, 6, ], });
            child.remove([ 0, 2, 6, ]);
            expect(child.state).toEqual([ { b: 2, }, 3, 4, 5, ]);
            expect(child.state[0]).toEqual({ b: 2, });
            expect(child.state[1]).toEqual(3);
            expect(child.state[2]).toEqual(4);
            expect(child.state[3]).toEqual(5);
          });

        test(name + ' array state should shift',
          () => {
            const { subject: { child, }, } = init({ child: [ 0, 1, { toBeRemoved: 2, }, 3, { toBeKept: 4, }, 5, 6, ], });
            const third = child[2];
            child.remove(2);
            expect(child.state).toEqual([ 0, 1, 3, { toBeKept: 4, }, 5, 6, ]);
            expect(third.state).toEqual(undefined);
            expect(child.state[2]).toEqual(3);
            expect(child[3].state).toEqual({ toBeKept: 4, });
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
              const { subject, } = init({ child: { val: null, }, });
              expect(subject.state.child.val).toEqual(null);
              subject.child.clearState([ 1, 2, { a: 3, }, ]);
              expect(subject.child.state).toEqual([ 1, 2, { a: 3, }, ]);
            }
            {
              const { subject, } = init({ child: { s: 0, }, });
              expect(subject.state.child.s).toEqual(0);
              subject.child.setState({ s: [ 1, 2, { a: 3, }, ], });
              expect(subject.child.s.state).toEqual([ 1, 2, { a: 3, }, ]);
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
            const { subject: {child}, } = init({child: [ { a: 1, }, { b: 2, }, { c: 3, }, ]});
            expect(child.state).toEqual([ { a: 1, }, { b: 2, }, { c: 3, }, ]);
            const { 0: a, 1: b, 2: c, } = child;
            child.clearState([ { c: 3, }, { a: 1, }, { b: 2, }, ]);
            expect(a.state).toEqual({ c: 3, });
            expect(b.state).toEqual({ a: 1, });
            expect(c.state).toEqual({ b: 2, });
            // This is unintuitive. Creating new subjects every time subject gets changed brings it's own challenges
          });
      });
  });
});
