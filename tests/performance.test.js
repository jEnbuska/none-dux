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
    const { subject, }= createStoreWithNonedux({});
    StateMapper.maxDepth = 100;
    subject.setState(even);
    const time = new Date();
    for (let i = 0; i < 1000; i++) {
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
    console.log('~ 1000 node merges, 1000 resets, 1 000  000 subsubject nodes removals, 1 000 000 subsubject nodes created. Took total of: ', new Date() - time, 'ms');
  }, 15000);

  // TODO
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
    console.log('Get state 885720 times. Avg depth ~8.5. Took total of: ', new Date() - time, 'ms');
  }, 15000);
});
