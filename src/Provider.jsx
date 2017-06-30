import React from 'react';
import { func, object, node, bool, } from 'prop-types';
import createStore from './createStore';
import SubStore from './SubStore';

export default class Provider extends React.Component {

  static propTypes = {
    definition: node,
    initialState: object,
    shape: object,
    onChange: func,
    eager: bool,
  };

  static defaultProps = {
    eager: false,
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
  state = { lastChange: null, };

  componentWillMount() {
    const { initialState, definition, } = this.props;
    if (initialState) {
      this.onStoreReady(createStore(initialState), true);
    } else if (!definition) {
      throw new Error('No definition nor initialState given to Provider');
    }
  }

  onStoreReady = (store, beforeMount) => {
    this.store = store;
    console.log(store)
    const { subscribers, } = this;
    if (process.env.NODE_ENV!=='production') {
      useReduxDevtools(store);
    }
    const { onChange, eager, } = this.props;
    if (onChange) {
      store.subscribe(() => onChange(store, SubStore.lastChange));
    }
    if (eager) {
      this.subsription = store.subscribe(() => {
        for (const key in subscribers) {
          subscribers[key]();
        }
      });
    } else {
      this.subsription = store.subscribe(() => {
        const { lastChange, } = SubStore;
        this.setState({ lastChange, });
      });
    }
    if (!beforeMount) {
      this.forceUpdate();
    }
  };

  componentWillUpdate({ eager, }) {
    const { subscribers, } = this;
    if (!eager) {
      for (const key in subscribers) {
        subscribers[key]();
      }
    }
  }

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
