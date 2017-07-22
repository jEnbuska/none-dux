import { createStoreWithNonedux, } from './utils';
import ProxyBranch from '../src/immutability/ProxyBranch';

describe('arrays as state', () => {
  let invalidAccessCalls = [];

  [ 'proxy', ].forEach(name => {
    const init = state => createStoreWithNonedux(state, undefined, undefined, name==='proxy');
    describe('run ' + name +' configuration', () => {
      beforeAll(() => {
        Object.defineProperty(ProxyBranch, 'onAccessingRemovedBranch', {
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
      });
    });
  });
});

