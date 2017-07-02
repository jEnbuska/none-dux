import nonedux from '../src/createNonedux';

describe('onClearState', () => {
  test('clearing state', () => {
    const bPart = { b: { c: 2, x: { y: 12, }, }, };
    const { subject, } = nonedux({ a: {}, ...bPart, d: { e: { f: 5, }, }, g: { h: 11, }, });
    const { state, } = subject._onClearState({ a: 11, ...bPart, g: { h: 12, i: {}, }, j: {}, });
    expect(state).toEqual({ a: 11, b: { c: 2, x: { y: 12, }, }, g: { h: 12, i: {}, }, j: {}, });
  });
});
