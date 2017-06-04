import React from 'react';
import { func, object, } from 'prop-types';
import createStore from './createStore';
import SubStore from './SubStore';

export default class Provider extends React.Component {

  static propTypes = {
    initialState: object,
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
    const { initialState, onChange, } = props;
    const store = createStore({ ...initialState, });
    this.subsriptION = store.subscribe(function (store) {
      for (const key in this) {
        this[key](store);
      }
    }.bind(subscribERS, store));
    if (onChange) { onChange(store.state); }
    createDebugger(store);
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

function createDebugger(store) {
  if (process.env.NODE_ENV==='development') {
    System.import('redux').then(it => {
      const { createStore, combineReducers, } = it;
      const reducers = combineReducers({ root: () => store.state, });
      const reduxStore = createStore(reducers, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());
      store.subscribe(function (reduxStore) {
        const { func, target, param, } = this.lastInteraction;
        reduxStore.dispatch({ type: func.toString(), target, param, });
      }.bind(SubStore, reduxStore));
    }).catch(() => console.error('no redux dependency'));
  }
}
