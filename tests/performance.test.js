import { expect, } from 'chai';
import createStore from '../src/createStore';
import SubStore from '../src/SubStore'
import { data, data2, } from './resources';

const { keys, } = Object;
describe('performance', () => {
  it('performance simple', function () {
    this.timeout(15000);
    const even = data;
    const odd = data2;
    const firstCompany = keys(even.companies)[0];
    const firstChildOdd = keys(odd)[0];
    const root = createStore({});
    root.setState(even);
    const time = new Date();
    for (let i = 0; i < 10000; i++) {
      if (i%7 === 0) {
        root.clearState({});
      }
      if (i % 2 === 0) {
        root.setState(even);
        root.companies[firstCompany].setState(odd[firstChildOdd]);
        root.companies[firstCompany].remove();
      } else {
        root.setState(odd);
        root[firstChildOdd].setState(even.companies[firstCompany]);
        root[firstChildOdd].remove();
      }
    }
    console.log('~ 10000 merges, 10000 resets, 5000 removes, 1 000 000 SubStores created. Took total of: ', new Date() - time, 'ms');
  });
});
