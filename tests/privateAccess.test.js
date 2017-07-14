import { createStoreWithNonedux, } from './utils';

const { keys, } = Object;
describe('access', () => {
  test('private properties should not be accessable', () => {
    const { subject } = createStoreWithNonedux({ a: {}, b: {}, c: {}, });
    const { ...all } = subject;
    const children = [ 'a', 'b', 'c', ];
    expect(keys(all)).toEqual([ 'a', 'b', 'c', ]);

    let i = 0;
    for (const child in subject) {
      expect(child).toBe(children[i++]);
    }
  });
});
