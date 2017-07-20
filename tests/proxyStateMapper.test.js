import { createStoreWithNonedux, } from './utils';
import StateMapper from '../src/reducer/StateMapper';

describe('arrays as state', () => {
  let invalidAccessCalls = [];

  [ 'proxy' ].forEach(name => {
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
        console.log('-----------REMOVE A')
        subject.root.remove('a');
        expect(invalidAccessCalls.length).toBe(0);
        console.log('do access invalid')
        expect(a.state).toBeUndefined();
        console.log('--------------')
      });
    });
  });
});

