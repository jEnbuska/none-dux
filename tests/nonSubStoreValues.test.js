
import {ReducerParent} from '../src/createNoneDux';

describe('arrays as state', () => {
  test('sub state should stay as array', () => {
    const { subject, } = new ReducerParent({ a: [ new Date(), ], b: new Date(), c: { d: new Date(), }, });
    expect(subject.getChildren().length).toBe(2);
  });
});
