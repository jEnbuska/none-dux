import Mapper from '../src/reducer/ProxyStateMapper';
import { createStoreWithNonedux } from './utils';
import { stateMapperPrivates } from '../src/common';
import Tree from '../src/reducer/KnotTree';

const { createProxy } = stateMapperPrivates;

describe('proxy', () => {

  test('create proxy without crash',
    () => {
      const mapper = new Mapper(1, new Tree(), { dispatch: () => { }, })[createProxy]();
      mapper.a;
    });

  test('create proxy with util',
    () => {
      const { subject } = createStoreWithNonedux({ a: 1, b: { c: 1, d: { e: 1 } } }, undefined, false, true);
    });

  test('access proxy children', () => {
    const { subject } = createStoreWithNonedux({ a: 1, b: { c: 1, d: { e: 1 } } }, undefined, false, true);
    subject.a;
    const { b } = subject;
    const { c, d }= b;
    const { e } = d;
    expect(e.x).toBeUndefined();
  });

  test('access proxy states', () => {
    const { subject } = createStoreWithNonedux({ a: 1, b: { c: 1, d: { e: 1 } } }, undefined, false, true);
    expect(subject.state).toEqual({ a: 1, b: { c: 1, d: { e: 1 } } });
    expect(subject.a.state).toEqual(1);
    const { b } = subject;
    expect(b.state).toEqual({ c: 1, d: { e: 1 } });
    const { c, d }= b;
    expect(c.state).toEqual(1);
    expect(d.state).toEqual({ e: 1 });
    const { e } = d;
    expect(e.state).toEqual(1);
  });

  test('apply setState', () => {
    const { subject } = createStoreWithNonedux({ a: 1, b: { c: 1, d: { e: 1 } } }, undefined, false, true);
    subject.setState({ a: 2 });
  });
});