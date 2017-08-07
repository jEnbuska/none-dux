import { createStoreWithNonedux, configs} from './utils';

describe('onClearState', () => {
  configs.forEach(name => {
    const init = state => createStoreWithNonedux(state, undefined, undefined, name === 'proxy');
    describe('run ' + name + ' configuration', () => {
      test('clearing state', () => {
        const bPart = { b: { c: 2, x: { y: 12, }, }, };
        const { subject: { child, }, } = init({ child: { a: {}, ...bPart, d: { e: { f: 5, }, }, g: { h: 11, }, }, });
        const { state, } = child.clearState({ a: 11, ...bPart, g: { h: 12, i: {}, }, j: {}, });
        expect(state).toEqual({ a: 11, b: { c: 2, x: { y: 12, }, }, g: { h: 12, i: {}, }, j: {}, });
      });
    });
  });
});
