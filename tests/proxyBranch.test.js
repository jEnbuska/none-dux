import { createStoreWithNonedux as init, } from './utils';
import Branch from '../src/immutability/Branch';

describe('arrays as state', () => {
  let invalidAccessCalls = [];

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
    const { subject, } = init({ root: { a: [ 1, 2, 3, ], b: { c: 1, d: {}, }, }, });
    const { a, } = subject.root;
    expect(a.state).toBeDefined();
    subject.root.remove('a');
    expect(invalidAccessCalls.length).toBe(0);
    expect(a.state).toBeUndefined();
  });
});

