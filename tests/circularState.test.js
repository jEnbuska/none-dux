import { createStoreWithNonedux, } from './utils';

describe('circular state', () => {
  [ 'legacy', 'proxy' ].forEach(name => {
    const init = state => createStoreWithNonedux(state, undefined, undefined, name === 'proxy');
    describe('run ' + name + ' configuration',
      () => {
        test('circular state should not be cause exception',
          () => {
            const circular = {};
            circular.circular = circular;
            const { subject, } = init(circular);
            let child = subject;
            for (let i = 0; i < 43; i++) {
              child = child.circular;
            }
          });
      })
  })
});