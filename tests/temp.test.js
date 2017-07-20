import { createStoreWithNonedux, } from './utils';
import StateMapper from '../src/reducer/StateMapper';
import { invalidReferenceHandler, SET_STATE, CLEAR_STATE, REMOVE, GET_STATE, GET_PREV_STATE, } from '../src/common';

describe('arrays as state', () => {
  [ 'proxy' ].forEach(name => {
    const init = state => createStoreWithNonedux(state,
      undefined,
      undefined,
      name === 'proxy');
    describe('run ' + name + ' configuration',
      () => {
        let invalidAccessCalls = [];

        beforeAll(() => {
          Object.defineProperty(StateMapper,
            'onAccessingRemovedNode',
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

        test(name + ' remove pre accessed children from array in arbitrary order',
          () => {
            const { subject: { root, }, } = init({ root: [ { a: 1, }, { b: 2, }, { c: 3, }, { d: 4, }, { e: 5, }, { f: 6, }, { g: 7, }, { h: 8, }, ], });
            for (let i = 0; i<8; i++) {
              expect(root[i]).toBeDefined();
            }
            root.remove([ 3, 1, 0, 7, ]);
            console.log('---------------')
            expect(root[0].state).toEqual({ c: 3, });
            expect(root[1].state).toEqual({ e: 5, });
            expect(root[2].state).toEqual({ f: 6, });
            expect(root[3].state).toEqual({ g: 7, });
            expect(root[4]).toEqual(undefined);
            expect(root[5]).toEqual(undefined);
            expect(root[6]).toEqual(undefined);
            expect(root[7]).toEqual(undefined);
          });
      });
  });
});
