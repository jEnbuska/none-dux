import Legacy from '../src/immutability/Legacy';
import { createStoreWithNonedux, } from './utils';
import createLeaf from '../src/immutability/leafs';
import Proxu from '../src/immutability/ProxyBranch';
import { data, data2, } from './resources';

const { keys, values, } = Object;
describe('performance', () => {
  const results = {
    addAndRemove: {},
    createAndAccess: {},
    addRemoveAndInit: {},
    getState: {},
    removeSemi: {},
    removeGood: {},
    removeBest: {},
    create: {},
    createLeafs: {},
    clearState: {},
  };
  [ 'legacy', 'proxy', ].forEach(name => {
    const init = state => createStoreWithNonedux(state, undefined, undefined, name === 'proxy');

    describe('run ' + name + ' configuration',
      () => {
        test('mixed', () => {
          const even = data.companies;
          const odd = data2;
          const firstCompany = keys(even.companies)[0];
          const firstChildOdd = keys(odd)[0];
          const { subject: { root, }, }= init({ root: {}, });
          root.setState(even);
          const time = new Date();
          for (let i = 0; i < 3000; i++) {
            if (i%7 === 0) {
              root.clearState({});
            }
            if (i % 2 === 0) {
              root.clearState(even);
              root.companies[firstCompany].setState(odd[firstChildOdd]);
              root.companies.remove([ firstCompany, ]);
            } else {
              root.clearState(odd);
              root[firstChildOdd].setState(even.companies[firstCompany]);
              root.remove([ firstChildOdd, ]);
            }
          }
          results.addAndRemove[name] = (new Date()-time)/3000;
          console.log(name + ' = ~ 3000 nodes merges, 3000 resets, 3000 removes Took total of: ', new Date() - time, 'ms');
        }, 15000);

        test('create and access lot of children', () => {
          const time = Date.now();
          for (let i = 0; i<300; i++) {
            const { subject: { root, }, } = init({ root: data, });
            root._getChildrenRecursively();
          }
          results.createAndAccess[name] = (new Date() - time)/300;
          console.log(name + ' = create and access 132 000 children: ', new Date() - time, 'ms');
        }, 15000);

        test('clearState', () => {
          const even = data;
          const odd = data2;
          const { subject: { root, }, }= init({ root: {}, });
          const time = Date.now();
          for (let i = 0; i < 3000; i++) {
            if (i % 2 === 0) {
              root.clearState(even);
            } else {
              root.clearState(odd);
            }
          }
          results.clearState[name] = (new Date() - time)/300;
        });

        test('mixed + init children', () => {
          const even = data;
          const odd = data2;
          const firstCompany = keys(even.companies)[0];
          const firstChildOdd = keys(odd)[0];
          const { subject: { root, }, }= init({ root: {}, });
          root.setState(even);
          const time = new Date();
          for (let i = 0; i < 1500; i++) {
            if (i%7 === 0) {
              root.clearState({});
            }
            if (i % 2 === 0) {
              root.clearState(even).getChildren();
              root.companies[firstCompany].setState(odd[firstChildOdd]).getChildren();
              root.companies.remove([ firstCompany, ]);
            } else {
              root.clearState(odd).getChildren();
              root[firstChildOdd].setState(even.companies[firstCompany]).getChildren();
              root.remove([ firstChildOdd, ]);
            }
          }
          results.addRemoveAndInit[name] = (new Date()-time)/1500;
          console.log(name + ' = ~ 1500 nodes merges, 1500 resets, 1500 removes, init of 8250x3 lazy children. Took total of: ', new Date() - time, 'ms');
        }, 15000);

        test('get state', () => {
          const data = { a: {}, b: {}, c: {}, };
          const { subject: { root, }, }= init({ root: data, });
          let children = values(root.getChildren());

          for (let i = 0; i<9; i++) {
            children.forEach(child => child.setState(data));
            children = values(children).reduce((acc, child) => acc.concat(values(child.getChildren())), []);
          }

          const allChildren = root._getChildrenRecursively();
          const time = new Date();
          for (let j = 0; j<allChildren.length; j++) {
            const ignore = allChildren[j].state;
          }
          results.getState[name] = (new Date()-time)/85000;
          console.log('Get state ~85000 times. Avg depth ~8.5. Took total of: ', new Date() - time, 'ms');
        }, 15000);

        test('remove children', () => {
          const { subject, }= init({ a: { b: { c: { d: { e: { f: { g: { h: {}, }, }, }, }, }, }, }, });
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
          results.removeSemi[name] = (new Date() - time);
          console.log(name + ' = Remove 20000 children semi performance. Took total of: ', new Date() - time, 'ms');
        }, 15000);

        test('create 50000 children', () => {
          const { subject: { root, }, }= init({ root: {}, });
          const data = {};
          for (let i = 0; i<50000; i++) {
            data[i] = { a: 1, b: {}, c: 3, d: { e: {}, }, };
          }
          const time = new Date();
          root.setState(data);
          results.create[name] = (new Date()-time);
          console.log(name + ' = create 50000 lazy children. Took total of: ', new Date() - time, 'ms');
        }, 15000);

        test('create 50000 leaf children', () => {
          const { subject: { root, }, }= init({ root: {}, });
          const data = {};
          for (let i = 0; i<50000; i++) {
            data[i] = i;
          }
          const time = new Date();
          root.setState(data);
          results.createLeafs[name] = (new Date()-time);
          console.log(name + ' = create 50000 leaf children. Took total of: ', new Date() - time, 'ms');
        }, 15000);
      });
  });

  afterAll(() => {
    console.log(JSON.stringify(results, null, 2));
  });
});
