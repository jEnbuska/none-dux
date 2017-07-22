import Legacy from '../src/reducer/Legacy';
import { createStoreWithNonedux, } from './utils';
import createLeaf from '../src/reducer/leafs';
import { data, data2, } from './resources';

const { keys, values, } = Object;
describe('performance', () => {
  const results = {
    setSameShapeData: {},
    addAndRemove: {},
    createAndAccess: {},
    addRemoveAndInit: {},
    getState: {},
    removeSemi: {},
    removeGood: {},
    removeBest: {},
    create: {},
    createLeafs: {},
  };
  [ 'legacy', 'proxy', ].forEach(name => {
    const init = state => createStoreWithNonedux(state, undefined, undefined, name === 'proxy');

    describe('run ' + name + ' configuration',
      () => {

        test('add and remove', () => {
          const even = data;
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
          results.addAndRemove[name] = new Date()-time;
          console.log(name + ' = ~ 3000 nodes merges, 3000 resets, 3000 removes Took total of: ', new Date() - time, 'ms');
        }, 15000);

        test('create and access lot of children', () => {
          const time = Date.now();
          for (let i = 0; i<300; i++) {
            const { subject: { root, }, } = init({ root: data, });
            root._getChildrenRecursively();
          }
          results.createAndAccess[name] = new Date() - time;
          console.log(name + ' = create and access 132 000 children: ', new Date() - time, 'ms');
        }, 15000);

        test('add, remove and init lazy immediate children', () => {
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
          results.addRemoveAndInit[name] = new Date()-time;
          // MacBook Pro  2,2 GHz Intel Core i7 --- ~650ms
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
          for (let i = 0; i<3; i++) {
            for (let j = 0; j<allChildren.length; j++) {
              const ignore = allChildren[j].state;
            }
          }
          results.getState[name] = new Date()-time;
          console.log('Get state ~265700 times. Avg depth ~8.5. Took total of: ', new Date() - time, 'ms');
        }, 15000);

        test('remove children semi performance', () => {
          const { subject, }= init({ a: { b: { c: { d: { e: { f: { g: { h: {}, }, }, }, }, }, }, }, });
          const h = subject.a.b.c.d.e.f.g.h;
          const data = {};
          for (let i = 0; i<20000; i++) {
            data[i] = { a: 1, };
          }
          h.setState(data);

          const toBeRemoved = Object.entries(h.state).filter(function ([ k, v, ]) { return true; })
            .map(([ k, ]) => k);
          const time = new Date();
          h.remove(toBeRemoved);
          results.removeSemi[name] = new Date()-time;
          // MacBook Pro  2,2 GHz Intel Core i7 --- 53-156ms
          console.log(name + ' = Remove 20000 children semi performance. Took total of: ', new Date() - time, 'ms');
        }, 15000);

        test('remove children good performance', () => {
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
          results.removeGood[name] = new Date()-time;
          // MacBook Pro  2,2 GHz Intel Core i7 --- 50-200ms
          console.log(name + ' = Remove 20000 leaf children, good performance. Took total of: ', new Date() - time, 'ms');
        }, 15000);

        test('remove children best performance', () => {
          const { subject, }= init({ a: { b: { c: { d: { e: { f: { g: { h: {}, }, }, }, }, }, }, }, });
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
          results.removeBest[name] = new Date()-time;
          // MacBook Pro  2,2 GHz Intel Core i7 --- 18-33ms
          console.log(name + ' = Remove 20000 leaf children, best performance. Took total of: ', new Date() - time, 'ms');
        }, 15000);

        test('create 50000 lazy children', () => {
          const { subject: { root, }, }= init({ root: {}, });
          const data = {};
          for (let i = 0; i<50000; i++) {
            data[i] = { a: 1, b: {}, c: 3, d: { e: {}, }, };
          }
          const time = new Date();
          root.setState(data);
          results.create[name] = new Date()-time;
          // MacBook Pro  2,2 GHz Intel Core i7 --- 130-250ms
          console.log(name + ' = create 50000 lazy children. Took total of: ', new Date() - time, 'ms');
        }, 15000);

        test('create 50000 leaf children', () => {
          const { subject: { root, }, }= init({ root: {}, });
          const data = {};
          for (let i = 0; i<50000; i++) {
            data[i] = createLeaf({ a: 1, b: {}, c: 3, d: { e: {}, }, });
          }
          const time = new Date();
          root.setState(data);
          results.createLeafs[name] = new Date()-time;
          // MacBook Pro  2,2 GHz Intel Core i7 --- 20-67ms
          console.log(name + ' = create 50000 leaf children. Took total of: ', new Date() - time, 'ms');
        }, 15000);
      });
  });

  afterAll(() => {
    console.log(JSON.stringify(results, null, 2));
  });
});
