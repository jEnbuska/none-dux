import { createStoreWithNonedux, } from './utils';
import StateMapper from '../src/reducer/StateMapper';
import { data, data2, } from './resources';

const { keys, } = Object;
describe('performance', () => {
  test('performance simple', () => {
    const even = data;
    const odd = data2;
    const firstCompany = keys(even.companies)[0];
    const firstChildOdd = keys(odd)[0];
    const root = createStoreWithNonedux({});
    StateMapper.maxDepth = 100;
    root.setState(even);
    const time = new Date();
    for (let i = 0; i < 1000; i++) {
      if (i%7 === 0) {
        root.clearState({});
      }
      if (i % 2 === 0) {
        root.setState(even);
        root.companies[firstCompany].setState(odd[firstChildOdd]);
        root.companies.remove([ firstCompany, ]);
      } else {
        root.setState(odd);
        root[firstChildOdd].setState(even.companies[firstCompany]);
        root.remove([ firstChildOdd, ]);
      }
    }
    console.log('~ 1000 node merges, 1000 resets, 1 000  000 subsubject nodes removals, 1 000 000 subsubject nodes created. Took total of: ', new Date() - time, 'ms');
  }, 15000);

  // TODO
  test('get state', () => {
    const data = { a: {}, b: {}, c: {}, };
    const root = createStoreWithNonedux(data);
    let children = root.getChildren();
    for (let i = 0; i<7; i++) {
      children.forEach(child => child.setState(data));
      children = children.reduce((acc, child) => acc.concat(child.getChildren()), []);
    }
    children.forEach(child => child.setState({ a: {}, b: {}, c: {}, d: {}, e: {}, f: {}, g: {}, h: {}, i: {}, }));
    const allChildren = root.getChildrenRecursively();
    const time = new Date();
    for (let i = 0; i<10; i++) {
      for (let j = 0; j<allChildren.length; j++) {
        allChildren[j].state;
      }
    }
    console.log('Get state ~60000 times. Avg depth ~8. Took total of: ', new Date() - time, 'ms');
  }, 15000);
});
