import React from 'react';
import { func, object, node, } from 'prop-types';
import createStore from './createStore';
import SubStore from './SubStore';

export default class Provider extends React.Component {

  static propTypes = {
    definition: node,
    initialState: object,
    shape: object,
    onChange: func,
  };

  static childContextTypes = {
    store: object,
    subscribe: func,
    onStoreReady: func,
  };

  store;

  getChildContext() {
    const { store, subscribe, onStoreReady, } = this;
    return {
      store,
      subscribe,
      onStoreReady,
    };
  }

  subscriptionCount=0;
  subscribers={};

  componentWillMount() {
    const { initialState, shape, definition, } = this.props;
    if (initialState) {
      this.onStoreReady(initialState, shape, true);
    } else if (!definition) {
      throw new Error('No definition nor initialState given to Provider');
    }
  }

  onStoreReady = (stateStore, shapeStore, initial) => {
    if (!shapeStore) {
      this.store = stateStore;
    } else {
      this.store = createStore({ ...stateStore.state, }, shapeStore.state);
    }
    const { subscribers, store, } = this;
    useReduxDevtools(store);
    const { onChange, } = this.props;
    if (onChange) {
      store.subscribe(() => onChange(store, SubStore.lastChange));
    }
    this.subsription = store.subscribe(() => {
      for (const key in subscribers) {
        subscribers[key]();
      }
    });
    if (!initial) {
      this.forceUpdate();
    }
  };

  render() {
    if (this.store) {
      return this.props.children;
    }
    return this.props.definition;
  }

  subscribe = (callback) => {
    const { subscriptionCount, subscribers, } = this;
    subscribers[subscriptionCount] = callback;
    this.subscriptionCount++;
    return function (subscriptionCount) {
      delete this[subscriptionCount];
    }.bind(subscribers, subscriptionCount);
  };

  componentWillUnmount() {
    this.subsription();
  }
}

function useReduxDevtools(store) {
  if (process.env.NODE_ENV !== 'production' && window.__REDUX_DEVTOOLS_EXTENSION__) {
    try {
      const redux = require.resolve('redux') && require('redux');
      const { createStore, } = redux;

      const reduxStore = createStore(() => store.state, window.__REDUX_DEVTOOLS_EXTENSION__());
      let emittedByOther = false;
      store.subscribe(() => {
        if (!emittedByOther) {
          const { func, target, param, } = SubStore.lastChange;
          const [ _, ...rest ] = target;
          emittedByOther = true;
          reduxStore.dispatch({ type: func.toString(), target: rest, param, });
          emittedByOther = false;
        }
      });
      reduxStore.subscribe(() => {
        if (!emittedByOther) {
          emittedByOther = true;
          const { state, } = store.clearState(reduxStore.getState());
          emittedByOther = false;
        }
      });
    } catch (Exception) {
      console.warn('"npm install --save-dev redux" is recommended');
    }
  }
}
