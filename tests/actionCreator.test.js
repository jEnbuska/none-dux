import { createStoreWithNonedux, } from './utils';

function actionCreator(apply) {
  return function (dux) {
    return apply(dux);
  };
}

describe('using action creators', async () => {
  [ 'legacy', 'proxy', ].forEach(name => {
    const init = state => createStoreWithNonedux(state, undefined, undefined, name==='proxy');
    describe('run ' + name +' configuration', async () => {
      test('using action creator', async () => {
        const { store, } = init({ a: { b: {}, }, });
        store.dispatch(actionCreator(dux => dux.a.setState({ b: { c: {}, d: {}, }, })));
        await new Promise(res => setTimeout(() => {
          expect(() => store.dispatch(actionCreator(dux => dux.a.b.remove('c')))).not.toThrow();
          res();
        }, 0));
      });
    });
  });
});

