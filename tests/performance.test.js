import { createStoreWithNonedux, } from './utils';
import StateMapper from '../src/reducer/StateMapper';
import createLeaf from '../src/reducer/leafs';
import { data, data2, } from './resources';

const { keys, } = Object;
describe('performance', () => {
  test('setState and remove', () => {
    const even = data;
    const odd = data2;
    const firstCompany = keys(even.companies)[0];
    const firstChildOdd = keys(odd)[0];
    const { subject, }= createStoreWithNonedux({});
    StateMapper.maxDepth = 100;
    subject.setState(even);
    const time = new Date();
    for (let i = 0; i < 3000; i++) {
      if (i%7 === 0) {
        subject.clearState({});
      }
      if (i % 2 === 0) {
        subject.setState(even);
        subject.companies[firstCompany].setState(odd[firstChildOdd]);
        subject.companies.remove([ firstCompany, ]);
      } else {
        subject.setState(odd);
        subject[firstChildOdd].setState(even.companies[firstCompany]);
        subject.remove([ firstChildOdd, ]);
      }
    }
    // MacBook Pro  2,2 GHz Intel Core i7 --- 500-600ms
    console.log('~ 3000 nodes merges, 3000 resets, 3000 removes Took total of: ', new Date() - time, 'ms');
  }, 15000);

  test('force init a lot of children', () => {
    const time = Date.now();
    for (let i = 0; i<1000; i++) {
      const { subject, } = createStoreWithNonedux(data);
      subject.getChildrenRecursively();
    }~
    // MacBook Pro  2,2 GHz Intel Core i7 --- ~5000ms
    console.log('force init 442000 children: ', new Date() - time, 'ms');
  }, 15000);

  test('setState & remove and init lazy immediate children', () => {
    const even = data;
    const odd = data2;
    const firstCompany = keys(even.companies)[0];
    const firstChildOdd = keys(odd)[0];
    const { subject, }= createStoreWithNonedux({});
    StateMapper.maxDepth = 100;
    subject.setState(even);
    const time = new Date();
    for (let i = 0; i < 1500; i++) {
      if (i%7 === 0) {
        subject.clearState({});
      }
      if (i % 2 === 0) {
        const { ...all } = subject.setState(even);
        const { ...companies } = subject.companies[firstCompany].setState(odd[firstChildOdd]);
        subject.companies.remove([ firstCompany, ]);
      } else {
        const { ...all } = subject.setState(odd);
        const { ...other } = subject[firstChildOdd].setState(even.companies[firstCompany]);
        subject.remove([ firstChildOdd, ]);
      }
    }
    // MacBook Pro  2,2 GHz Intel Core i7 --- ~650ms
    console.log('~ 1500 nodes merges, 1500 resets, 1500 removes, init of 8250x3 lazy children. Took total of: ', new Date() - time, 'ms');
  }, 15000);

  test('get state', () => {
    const data = { a: {}, b: {}, c: {}, };
    const { subject, }= createStoreWithNonedux(data);
    let children = subject.getChildren();

    for (let i = 0; i<9; i++) {
      children.forEach(child => child.setState(data));
      children = children.reduce((acc, child) => acc.concat(child.getChildren()), []);
    }

    const allChildren = subject.getChildrenRecursively();
    const time = new Date();
    for (let i = 0; i<10; i++) {
      for (let j = 0; j<allChildren.length; j++) {
        allChildren[j].state;
      }
    }
    // MacBook Pro  2,2 GHz Intel Core i7 --- ~1200ms
    console.log('Get state 885720 times. Avg depth ~8.5. Took total of: ', new Date() - time, 'ms');
  }, 15000);
  test('removeSelf naive performance', () => {
    const { subject, }= createStoreWithNonedux({ a: { b: { c: { d: { e: { f: { g: { h: {}, }, }, }, }, }, }, }, });
    const h = subject.a.b.c.d.e.f.g.h;
    for (let i = 0; i<5000; i++) {
      h.setState({ [i]: { a: 1, }, });
    }
    const time = new Date();
    const { ...all } = h;
    Object.entries(all).filter(function ([ k, {state}, ]) { return true; })
      .forEach(([ k, value, ]) => value.removeSelf());
    // MacBook Pro  2,2 GHz Intel Core i7 --- 1300-2000ms
    console.log('Remove 5000 children self naive. Took total of: ', new Date() - time, 'ms');
  }, 15000);

  test('remove children semi performance', () => {
    const { subject, }= createStoreWithNonedux({ a: { b: { c: { d: { e: { f: { g: { h: {}, }, }, }, }, }, }, }, });
    const h = subject.a.b.c.d.e.f.g.h;
    const data = {};
    for (let i = 0; i<20000; i++) {
      data[i] = { a: 1, };
    }
    h.setState(data);
    const time = new Date();
    const toBeRemoved = Object.entries(h.state).filter(function ([ k, v, ]) { return true; })
      .map(([ k, ]) => k);
    h.remove(toBeRemoved);
    // MacBook Pro  2,2 GHz Intel Core i7 --- 53-156ms
    console.log('Remove 20000 children semi performance. Took total of: ', new Date() - time, 'ms');
  }, 15000);

  test('remove children good performance', () => {
    const { subject, }= createStoreWithNonedux({ a: { b: { c: { d: { e: { f: { g: { h: {}, }, }, }, }, }, }, }, });
    const h = subject.a.b.c.d.e.f.g.h;
    const data = {};
    for (let i = 0; i<20000; i++) {
      data[i] = { a: 1, };
    }
    h.setState(data);
    const time = new Date();
    const toBeRemoved = Object.entries(h.state).filter(function ([ k, v, ]) { return true; })
      .map(([ k, ]) => k);
    h.remove(toBeRemoved);
    // MacBook Pro  2,2 GHz Intel Core i7 --- 50-300ms
    console.log('Remove 20000 leaf children, good performance. Took total of: ', new Date() - time, 'ms');
  }, 15000);

  test('remove children best performance', () => {
    const { subject, }= createStoreWithNonedux({ a: { b: { c: { d: { e: { f: { g: { h: {}, }, }, }, }, }, }, }, });
    const g = subject.a.b.c.d.e.f.g;
    const data = {};
    for (let i = 0; i<20000; i++) {
      data[i] ={ a: 1, };
    }
    g.setState({ h: createLeaf(data), });
    const h = g.state.h;
    const time = new Date();
    const toBeKept = Object.entries(h).filter(function ([ k, v, ]) { return false; })
      .reduce((acc, [ k, v, ]) => Object.assign(acc, { [k]: v, }), {});
    g.setState({ h: createLeaf(toBeKept), });
    // MacBook Pro  2,2 GHz Intel Core i7 --- 18-33ms
    console.log('Remove 20000 leaf children, best performance. Took total of: ', new Date() - time, 'ms');
  }, 15000);

  test('create 50000 lazy children', () => {
    const { subject, }= createStoreWithNonedux({ });
    const data = {};
    for (let i = 0; i<50000; i++) {
      data[i] = { a: 1, b: {}, c: 3, d: { e: {}, }, };
    }
    const time = new Date();
    subject.setState(data);
    // MacBook Pro  2,2 GHz Intel Core i7 --- 130-250ms
    console.log('create 50000 lazy children. Took total of: ', new Date() - time, 'ms');
  }, 15000);

  test('create 50000 leaf children', () => {
    const { subject, }= createStoreWithNonedux({ });
    const data = {};
    for (let i = 0; i<50000; i++) {
      data[i] = createLeaf({ a: 1, b: {}, c: 3, d: { e: {}, }, });
    }
    const time = new Date();
    subject.setState(data);
    // MacBook Pro  2,2 GHz Intel Core i7 --- 20-67ms
    console.log('create 50000 leaf children. Took total of: ', new Date() - time, 'ms');
  }, 15000);
});
