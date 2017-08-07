import { createStoreWithNonedux, } from './utils';
import ProxyBranch from '../src/immutability/ProxyBranch';

const init = state => createStoreWithNonedux(state, undefined, undefined, true);

describe('proxy branch specific tests', () => {
  let invalidAccessCalls = [];

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
      const { subject, } = init({ child: { a: [ 1, 2, 3, ], b: { c: 1, d: {}, }, }, });
      const { a, } = subject.child;
      expect(a.state).toBeDefined();
      subject.child.remove('a');
      expect(invalidAccessCalls.length).toBe(0);
      expect(a.state).toBeUndefined();
    });
  });
});

