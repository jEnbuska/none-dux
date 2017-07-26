import { createStoreWithNonedux as init, } from './utils';

describe('circular state', () => {
  test('circular state should not be cause exception', () => {
    const circular = {};
    circular.circular = circular;
    const { subject, } = init(circular);
    let child = subject;
    for (let i = 0; i < 43; i++) {
      child = child.circular;
    }
  });
});