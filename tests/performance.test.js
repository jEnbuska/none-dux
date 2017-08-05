import Legacy from '../src/immutability/Legacy';
import { createStoreWithNonedux, createReduxStore, } from './utils';
import { subjects, triggers, } from './reduxReducers/types';
import { data, data2, } from './resources';

const now = require('nano-time');

const { keys, values, } = Object;
describe('performance', () => {
  const results = {
    addAndRemove: {},
    createAndAccess: {},
    addRemoveAndInit: {},
    getState: {},
    removeWorst: {},
    removeSemi: {},
    create: {},
    createLeafs: {},
    clearState: {},
    clearAccessedState: {},
    getNewChildren: {},
    reduxComparison: {},
    access: {},
    setState: {},
    setStateBetter: {},
    setStateBetterBadCase: {},
    setStateWithClearReferences: {},
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
          const { subject: { child, }, }= init({ child: {}, });
          child.setState(even);
          const time = new Date();
          for (let i = 0; i < 3000; i++) {
            if (i%7 === 0) {
              child.clearState({});
            }
            if (i % 2 === 0) {
              child.clearState(even);
              child.companies[firstCompany].setState(odd[firstChildOdd]);
              child.companies.remove([ firstCompany, ]);
            } else {
              child.clearState(odd);
              child[firstChildOdd].setState(even.companies[firstCompany]);
              child.remove([ firstChildOdd, ]);
            }
          }
          results.addAndRemove[name] = (new Date()-time)/3000;
          console.log(name + ' = ~ 3000 nodes merges, 3000 resets, 3000 removes Took total of: ', new Date() - time, 'ms');
        }, 15000);

        test('get new Children', () => {
          const even = data.companies;
          const odd = data2;
          const { subject: { child, }, }= init({ child: {}, });
          child.setState(even);
          let total = 0;
          const time = new Date();
          for (let i = 0; i < 200; i++) {
            if (i % 2 === 0) {
              child.clearState(even);
              const time = Date.now();
              child._getChildrenRecursively();
              total+=Date.now()-time;
            } else {
              child.clearState(odd);
              const time = Date.now();
              child._getChildrenRecursively();
              total+=Date.now()-time;
            }
          }
          results.getNewChildren[name] = total/200;
        }, 15000);

        test('create and access lot of children', () => {
          const time = Date.now();
          for (let i = 0; i<300; i++) {
            const { subject: { child, }, } = init({ child: data, });
            child._getChildrenRecursively();
          }
          results.createAndAccess[name] = (new Date() - time)/300;
          console.log(name + ' = create and access 132 000 children: ', new Date() - time, 'ms');
        }, 15000);

        test('clearState', () => {
          const even = data;
          const odd = data2;
          const { subject: { child, }, }= init({ child: {}, });
          const time = Date.now();
          for (let i = 0; i < 3000; i++) {
            if (i % 2 === 0) {
              child.clearState(even);
            } else {
              child.clearState(odd);
            }
          }
          results.clearState[name] = (new Date() - time)/300;
        });

        test('clearState accessed state', () => {
          const even = data;
          const odd = data2;
          const { subject: { child, }, }= init({ child: {}, });
          let total = 0;
          for (let i = 0; i < 200; i++) {
            if (i % 2 === 0) {
              child._getChildrenRecursively();
              const time = Date.now();
              child.clearState(even);
              total+=Date.now()-time;
            } else {
              child._getChildrenRecursively();
              const time = Date.now();
              child.clearState(odd);
              total+=Date.now()-time;
            }
          }
          results.clearAccessedState[name] = total/200;
        });

        test('mixed + init children', () => {
          const even = data;
          const odd = data2;
          const firstCompany = keys(even.companies)[0];
          const firstChildOdd = keys(odd)[0];
          const { subject: { child, }, }= init({ child: {}, });
          child.setState(even);
          const time = new Date();
          for (let i = 0; i < 1500; i++) {
            if (i%7 === 0) {
              child.clearState({});
            }
            if (i % 2 === 0) {
              child.clearState(even).getChildren();
              child.companies[firstCompany].setState(odd[firstChildOdd]).getChildren();
              child.companies.remove([ firstCompany, ]);
            } else {
              child.clearState(odd).getChildren();
              child[firstChildOdd].setState(even.companies[firstCompany]).getChildren();
              child.remove([ firstChildOdd, ]);
            }
          }
          results.addRemoveAndInit[name] = (new Date()-time)/1500;
          console.log(name + ' = ~ 1500 nodes merges, 1500 resets, 1500 removes, init of 8250x3 lazy children. Took total of: ', new Date() - time, 'ms');
        }, 15000);

        test('access', () => {
          const { subject, }= init({ a: { b: { c: { d: { e: { f: { g: { h: {}, }, }, }, }, }, }, }, });
          const h = subject.a.b.c.d.e.f.g.h;
          const data = {};
          for (let i = 0; i<3000; i++) {
            data[i] = { a: {}, b: {}, c: {}, d: { a: {}, b: {}, c: {}, d: {}, e: {}, }, };
          }
          h.setState(data);
          const time = Date.now();
          for (let i = 0; i<3000; i++) {
            const accessed = h[i];
          }
          results.access[name] = (Date.now()-time);
        }, 15000);
        test('setState better', () => {
          const { subject, }= init({ a: { b: { c: { d: { e: { f: { g: { h: {}, }, }, }, }, }, }, }, });
          const h = subject.a.b.c.d.e.f.g.h;
          const data = {};
          for (let i = 0; i<1000; i++) {
            data[i] = { a: {}, b: {}, c: {}, d: { a: {}, b: {}, c: {}, d: {}, e: {}, }, };
          }
          const time = now();
          h.setState(data);
          results.setState[name] = (now()-time)+' ns';
        }, 15000);

        test('setState better bad case', () => {
          const { subject, }= init({ a: { b: { c: { d: { e: { f: { g: { h: {}, }, }, }, }, }, }, }, });
          const h = subject.a.b.c.d.e.f.g.h;
          let data = {};
          for (let i = 0; i<1000; i++) {
            data[i] = { a: {}, b: {}, c: {}, d: { a: {}, b: {}, c: {}, d: {}, e: {}, }, };
          }

          h.setState(data);
          const children = h._getChildrenRecursively();

          data = {};
          for (let i = 0; i<1000; i++) {
            data[i] = { a: {}, b: {}, c: {}, d: { a: {}, b: {}, c: {}, d: {}, e: {}, }, };
          }
          const time = now();
          h.setState(data);
          results.setStateBetterBadCase[name] = (now()-time) + ' ns';
        }, 15000);

        test('setState after clearReferences', () => {
          const { subject, }= init({ a: { b: { c: { d: { e: { f: { g: { h: {}, }, }, }, }, }, }, }, });
          const h = subject.a.b.c.d.e.f.g.h;
          let data = {};
          for (let i = 0; i<1000; i++) {
            data[i] = { a: {}, b: {}, c: {}, d: { a: {}, b: {}, c: {}, d: {}, e: {}, }, };
          }

          h.setState(data);
          const children = h._getChildrenRecursively();
          data = {};
          for (let i = 0; i<1000; i++) {
            data[i] = { a: {}, b: {}, c: {}, d: { a: {}, b: {}, c: {}, d: {}, e: {}, }, };
          }

          const time = now();
          h.clearReferences(true);
          h.setState(data);
          results.setStateWithClearReferences[name] = (now()-time) + ' ns';
        }, 15000);

        test('get state', () => {
          const data = { a: {}, b: {}, c: {}, };
          const { subject: { child, }, }= init({ child: data, });
          let children = values(child.getChildren());
          for (let i = 0; i<9; i++) {
            children.forEach(child => child.setState(data));
            children = values(children).reduce((acc, child) => acc.concat(values(child.getChildren())), []);
          }

          const allChildren = child._getChildrenRecursively();
          const time = new Date();
          for (let j = 0; j<allChildren.length; j++) {
            const ignore = allChildren[j].state;
          }
          results.getState[name] = (new Date()-time)/85000;
          console.log('Get state ~85000 times. Avg depth ~8.5. Took total of: ', new Date() - time, 'ms');
        }, 15000);

        test('remove worst', () => {
          const { subject, }= init({ a: { b: { c: { d: { e: { f: { g: { h: {}, }, }, }, }, }, }, }, });
          const h = subject.a.b.c.d.e.f.g.h;
          const data = {};
          for (let i = 0; i<3000; i++) {
            data[i] = { a: {}, b: {}, c: {}, d: { a: {}, b: {}, c: {}, d: {}, e: {}, }, };
          }
          h.setState(data);

          const time = new Date();
          Object.keys(h.state)
            .map(k => h[k])
            .filter(({ state, }) => true)
            .map((it) => h.remove(it.getId()));
          results.removeWorst[name] = (new Date() - time);
          console.log(name + ' = Remove 20000 children semi performance. Took total of: ', new Date() - time, 'ms');
        }, 15000);

        test('remove children semi', () => {
          const { subject, }= init({ a: { b: { c: { d: { e: { f: { g: { h: {}, }, }, }, }, }, }, }, });
          const h = subject.a.b.c.d.e.f.g.h;
          const data = {};
          for (let i = 0; i<3000; i++) {
            data[i] = { a: {}, b: {}, c: {}, d: { a: {}, b: {}, c: {}, d: {}, e: {}, }, };
          }
          h.setState(data);
          h._getChildrenRecursively();

          const time = new Date();
          const toBeRemoved = Object.entries(h.state).filter(function ([ k, v, ]) { return true; })
            .map(([ k, ]) => k);
          h.remove(toBeRemoved);
          results.removeSemi[name] = (new Date() - time);
          console.log(name + ' = Remove 3000 children semi performance. Took total of: ', new Date() - time, 'ms');
        }, 15000);

        test('create 50000 children', () => {
          const { subject: { child, }, }= init({ child: {}, });
          const data = {};
          for (let i = 0; i<50000; i++) {
            data[i] = { a: 1, b: {}, c: 3, d: { e: {}, }, };
          }
          const time = new Date();
          child.setState(data);
          results.create[name] = (new Date()-time);
          console.log(name + ' = create 50000 lazy children. Took total of: ', new Date() - time, 'ms');
        }, 15000);

        test('create 50000 leaf children', () => {
          const { subject: { child, }, }= init({ child: {}, });
          const data = {};
          for (let i = 0; i<50000; i++) {
            data[i] = i;
          }
          const time = new Date();
          child.setState(data);
          results.createLeafs[name] = (new Date()-time);
          console.log(name + ' = create 50000 leaf children. Took total of: ', new Date() - time, 'ms');
        }, 15000);

        test('redux comparison', () => {
          results.reduxComparison[name] = {};
          const store = createReduxStore();
          const data = {};
          for (let i = 0; i<1000; i++) {
            data[i] = { id: i, content: { name: 'test', age: 100, }, };
          }
          subjects.forEach(s => {
            store.dispatch({ type: 'RESET_'+s, payload: data, });
          });
          let time = Date.now();
          for (let i = 0; i<1; i++) {
            for (let s = 0; s<subjects.length; s++) {
              const current = subjects[s];
              store.dispatch({ type: 'REMOVE_'+current, payload: i, });
              store.dispatch({ type: 'ADD_'+current, payload: { id: i, content: { name: 'test', age: 100, }, }, });
              store.dispatch({ type: 'UPDATE_'+current, payload: { id: i, content: { name: 'test2', age: 10, }, }, });
              store.dispatch({ type: 'RESET_'+current, payload: data, });
            }
          }
          results.reduxComparison[name].redux = Date.now()-time;
          const initialState = {};
          initialState.A = { A_A: data, A_B: data, };
          initialState.B = data;
          initialState.C = data;
          initialState.D = data;
          initialState.E = { E_A: data, E_B: data, };
          initialState.F = data;
          initialState.G = data;
          initialState.H = data;
          const { subject, } = createStoreWithNonedux(initialState, undefined, false, name==='proxy');
          const children = [ [ 'A', 'A_A', ], [ 'A', 'A_B', ], [ 'B', ], [ 'C', ], [ 'D', ], [ 'E', 'E_A', ], [ 'E', 'E_B', ], [ 'F', ], [ 'G', ], [ 'H', ], ];
          time = Date.now();
          for (let i = 0; i<1; i++) {
            for (let c = 0; c<children.length; c++) {
              const current = children[c].reduce((target, k) => target[k], subject);
              current.remove(i);
              current.setState({ [i]: { id: i, content: { name: 'test', age: 100, }, }, });
              current.setState({ [i]: { id: i, content: { name: 'tes2', age: 10, }, }, });
              current.clearState(data);
            }
          }
          results.reduxComparison[name].nonedux = Date.now()-time;
        }, 15000);
      });
  });

  afterAll(() => {
    console.log(JSON.stringify(results, null, 2));
  });
});
