import { createStoreWithNonedux, } from './utils';
import { PARAM, PUBLISH_NOW, REMOVE, SET_STATE, CLEAR_STATE, TARGET, } from '../src/common';

describe('saga state branch', () => {
  test('create nonedux', () => {
    createStoreWithNonedux({ a: { b: 1, }, c: { d: {}, }, });
  });

  test('access state', () => {
    const { subject, } = createStoreWithNonedux({ a: { b: 1, }, c: { d: {}, }, });
    expect(subject.state).toEqual({ a: { b: 1, }, c: { d: {}, }, });
    expect(subject.a.state).toEqual({ b: 1, });
    expect(subject.c.state).toEqual({ d: {}, });
    expect(subject.c.d.state).toEqual({});
  });

  test('call setState', () => {
    const { subject, } = createStoreWithNonedux({ a: { b: 1, }, c: { d: {}, }, }, undefined, true);
    expect(subject.a.setState({ x: { y: {}, }, z: 1, })).toEqual({
      type: SET_STATE,
      [TARGET]: [ 'a', ],
      [PARAM]: { x: { y: {}, }, z: 1, },
      [PUBLISH_NOW]: true,
    });
  });

  test('call clearState', () => {
    const { subject, } = createStoreWithNonedux({ a: { b: 1, }, c: { d: {}, }, }, undefined, true);
    expect(subject.a.clearState({ x: { y: {}, }, z: 1, })).toEqual({
      type: CLEAR_STATE,
      [TARGET]: [ 'a', ],
      [PARAM]: { x: { y: {}, }, z: 1, },
      [PUBLISH_NOW]: true,
    });
  });

  test('call remove', () => {
    const { subject, } = createStoreWithNonedux({ a: { b: 1, }, c: { d: {}, }, }, undefined, true);
    expect(subject.a.remove('x', 'z')).toEqual({
      type: REMOVE,
      [TARGET]: [ 'a', ],
      [PARAM]: [ 'x', 'z', ],
      [PUBLISH_NOW]: true,
    });
  });

  test('call removeSelf', () => {
    const { subject, } = createStoreWithNonedux({ a: { b: 1, }, c: { d: {}, }, }, undefined, true);
    expect(subject.a.removeSelf()).toEqual({
      type: REMOVE,
      [TARGET]: [ ],
      [PARAM]: [ 'a', ],
      [PUBLISH_NOW]: true,
    });
  });
});
