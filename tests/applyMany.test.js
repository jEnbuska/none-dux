import { createStoreWithNonedux, } from './utils';

describe('applyMany', () => {
  beforeAll(() => {

  });

  function throwError() {
    throw new Error();
  }/*

  test('apply many no nested', () => {
    const states = new Set();
    const { store, subject, } = createStoreWithNonedux({ a: {}, b: {}, });
    store.subscribe(() => states.add(store.getState()));
    subject.applyMany(({ a, b, }) => {
      a.setState({ x: 1, });
      b.setState({ y: 2, });
      a.setState({ x: { z: {}, }, });
      b.setState({ y: { q: {}, }, });
    });
    expect([ ...states, ].length).toBe(2);
    expect([ ...states, ]).toEqual([
      { a: {}, b: {}, },
      { a: { x: { z: {}, }, }, b: { y: { q: {}, }, }, }, ]);
  });

  test('apply many nested', () => {
    const states = new Set();
    const { store, subject, } = createStoreWithNonedux({ a: {}, b: {}, });
    store.subscribe(() => {
      states.add(store.getState());
    });
    subject.applyMany(({ a, b, }) => {
      a.setState({ x: {}, });
      b.setState({ y: {}, });
      a.applyMany(({ x, }) => x.setState({ i: {}, }));
      b.applyMany(({ y, }) => y.setState({ j: {}, }));
      subject.applyMany(({ a, }) => {
        a.applyMany(({ x, }) => {
          x.applyMany(({ i, }) => {
            i.setState([ 1, 2, 3, 4, 5, ]);
          });
        });
      });
    });
    expect([ ...states, ].length).toBe(2);
    expect([ ...states, ]).toEqual([
      { a: {}, b: {}, },
      { a: { x: { i: [ 1, 2, 3, 4, 5, ], }, }, b: { y: { j: {}, }, }, }, ]);
  });

  test('apply many nested rollbacks', () => {
    const states = new Set();
    const { store, subject, } = createStoreWithNonedux({ a: {}, b: {}, });
    store.subscribe(() => states.add(store.getState()));
    for (let index = 11; index<12; index++) {
      try {
        subject.applyMany(({ a, b, }) => {
          index===0 && throwError();
          a.setState({ x: {}, });
          index===1 && throwError();
          b.setState({ y: {}, });
          index===2 && throwError();
          a.applyMany(({ x, }) => {
            index===3 && throwError();
            x.setState({ i: {}, });
            index===4 && throwError();
          });
          index===5 && throwError();
          b.applyMany(({ y, }) => {
            index===6 && throwError();
            y.setState({ j: {}, });
            index===7 && throwError();
          });
          index===8 && throwError();
          subject.applyMany(({ a, }) => {
            index===9 && throwError();
            a.applyMany(({ x, }) => {
              index===10 && throwError();
              x.applyMany(({ i, }) => {
                index===11 && throwError();
                index.setState([ 1, 2, 3, 4, 5, ]);
                index===12 && throwError();
              });
              index===13 && throwError();
            });
            index===14 && throwError();
          });
          index===15 && throwError();
        });
      } catch (e) {}
    }

    expect([ ...states, ]).toEqual([ { a: {}, b: {}, }, ]);
    expect([ ...states, ].length).toBe(1);
  });*/

  test('apply many partial rollbacks', () => {
    const states = new Set();
    const { store, subject, } = createStoreWithNonedux({ a: {}, b: {}, });
    store.subscribe(() => {
      states.add(store.getState());
    });
    subject.applyMany(({ a, b, }) => {
      a.setState({ x: {}, });
      b.setState({ y: {}, });
      try {
        subject.applyMany(({ a, }) => {
          a.applyMany(({ x, }) => {
            x.applyMany(({ i, }) => {
              i.setState([ 1, 2, 3, 4, 5, ]);
            });
          });
        });
        throwError();
      } catch (e) {

      }
    });
    expect([ ...states, ].length).toBe(2);
    expect([ ...states, ]).toEqual([
      { a: {}, b: {}, },
      { a: { x: { }, }, b: { y: {}, }, }, ]);
  });
});

