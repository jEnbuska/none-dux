import React from 'react';
import { func, object, } from 'prop-types';
import createStore from './createStore';
import SubStore from './SubStore';

export default class Provider extends React.Component {

  static propTypes = {
    initialState: object,
    shape: object,
    onChange: func,
  };

  static defaultProps = {
    initialState: {},
  };

  static childContextTypes = {
    store: object,
    subscribe: func,
  };

  subscriptionCount=0;
  subscribERS={};

  componentWillMount() {
    const { props, subscribERS, } = this;
    const { initialState, shape, onChange, } = props;
    const store = createStore({ ...initialState, }, shape);
    this.subsriptION = store.subscribe(function (store) {
      for (const key in this) {
        this[key](store, SubStore.lastChange);
      }
    }.bind(subscribERS, store));
    if (onChange) {
      store.subscribe(function (onChange) {
        onChange(this, SubStore.lastChange);
      }.bind(store, onChange));
    }
    useReduxDevtools(store);
    this.store = store;
  }

  getChildContext() {
    const { store, subscribe, } = this;
    return {
      store,
      subscribe,
    };
  }

  subscribe = (callback) => {
    const { subscriptionCount, subscribERS, } = this;
    subscribERS[subscriptionCount] = callback;
    this.subscriptionCount++;
    return function (subscriptionCount) {
      delete this[subscriptionCount];
    }.bind(subscribERS, subscriptionCount);
  };

  render() {
    return <span>{this.props.children}</span>;
  }

  componentWillUnmount() {
    this.subsriptION();
  }
}

function useReduxDevtools(store) {
  if (process.env.NODE_ENV !== 'production') {
    System.import('redux').then(redux => {
      const { createStore, combineReducers, } = redux;
      const rootReducer = combineReducers({ root: () => store.state, });
      const reduxStore = createStore(rootReducer, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());
      let emittedByOther = false;
      store.subscribe(() => {
        if (!emittedByOther) {
          const { func, target, param, } = SubStore.lastChange;
          emittedByOther = true;
          reduxStore.dispatch({ type: func.toString(), target, param, });
          emittedByOther = false;
        }
      });
      reduxStore.subscribe(() => {
        if (!emittedByOther) {
          emittedByOther = true;
          store.clearState(reduxStore.getState().root);
          emittedByOther = false;
        }
      });
    }).catch(() => console.warn('npm install --save-dev redux to be able to debug using redux devtools'));
  }
}
