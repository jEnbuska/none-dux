import { createStoreWithNonedux, configs, } from './utils';

describe('Create subject', () => {
  configs.forEach(name => {
    const init = state => createStoreWithNonedux(state, undefined, undefined, name === 'proxy');
    describe('run ' + name + ' configuration', () => {
      test('should be able to reference children', () => {
        const { subject, } = init({ b: { c: 2, d: 3, e: { f: 4, }, }, });
        const { state, } = subject.b.e;
      });

      test('should return 2 level initial values', () => {
        const { subject, }= init({ b: { c: 1, }, });
        expect(subject.state).toEqual({ b: { c: 1, }, });
      });

      test('should return 3 level initial values', () => {
        const { subject, } = init({ b: { c: 2, d: 3, e: { f: 4, }, }, });
        expect(subject.state).toEqual({ b: { c: 2, d: 3, e: { f: 4, }, }, });
      });
    });
  });
});
