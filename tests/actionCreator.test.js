import { createStoreWithNonedux, configs, } from './utils';

function actionCreator(apply) {
  return function (dux) {
    apply(dux);
  };
}

describe('using action creators', () => {
  configs.forEach(name => {
    const init = state => createStoreWithNonedux(state, undefined, undefined, name==='proxy');
    describe('run ' + name +' configuration', () => {
      test('should be able to dispatch action creator actions after clearReferences', () => {
        const { store, } = init({ a: { b: {}, }, });
        store.dispatch(actionCreator(dux => dux.a.setState({ b: { c: {}, d: {}, }, })));
        return new Promise(res => {
          expect(() => store.dispatch(actionCreator(dux => dux.a.b.remove('c')))).not.toThrow();
          res();
        });
      });

      test('all action creators should return a promise', () => {
        const { store, } = init({ a: { b: {}, }, });
        const res = store.dispatch(actionCreator(dux => dux.a.setState({ b: { c: {}, d: {}, }, })));
        expect(res).toBeInstanceOf(Promise);
      });

      test('action should be applied without awaiting them', () => {
        const { store, subject, } = init({ a: { b: {}, }, });
        store.dispatch(actionCreator(dux => dux.a.setState({ b: { c: {}, d: {}, }, })));
        expect(subject.state).toEqual({ a: { b: { c: {}, d: {}, }, }, });
      });
    });
  });
});

