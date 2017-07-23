import { createStoreWithNonedux, } from './utils';

const now = require('nano-time');

describe('performance', () => {
  [ 'proxy', 'legacy', ].forEach(name => {
    const init = state => createStoreWithNonedux(state, undefined, undefined, name === 'proxy');

    describe('run ' + name + ' configuration', () => {
      test('get state', () => {
        const f= init({ root: { a: { b: { c: { d: { e: { f: {}, }, }, }, }, }, }, }).subject.root.a.b.c.d.e.f;
        const t = Date.now();
        const {...all} =f;
        console.log('----------------------------------------')
        f.state;
        console.log(now()-t);
        f.setState({ something: {}, });
        console.log(now()-t);
      }, 15000);
    });
  });
});
