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

  store;

  getChildContext() {
    const { store, subscribe, } = this;
    return {
      store,
      subscribe,
    };
  }

  subscriptionCount=0;
  subscribERS={};
  state = { changes: null, };

  componentWillMount() {
    const { props, } = this;
    const { initialState, shape, } = props;
    const store = createStore({ ...initialState, }, shape);
    useReduxDevtools(store);
    this.setState({ changes: SubStore.lastChange, });
    this.store = store;
  }

  render() {
    return <span>{this.props.children}</span>;
  }

  subscribe = (callback) => {
    const { subscriptionCount, subscribERS, } = this;
    subscribERS[subscriptionCount] = callback;
    this.subscriptionCount++;
    return function (subscriptionCount) {
      delete this[subscriptionCount];
    }.bind(subscribERS, subscriptionCount);
  };

  componentDidMount() {
    const { props, store, } = this;
    const { onChange, } = props;
    if (onChange) {
      store.subscribe(function (onChange) {
        onChange(this, SubStore.lastChange);
      }.bind(store, onChange));
    }
    this.subsriptION = store.subscribe(() => {
      this.setState({ changes: SubStore.lastChange, });
    });
  }

  shouldComponentUpdate() {
    const { subscribERS, } = this;
    for (const key in subscribERS) {
      subscribERS[key]();
    }
    return false;
  }

  componentWillUnmount() {
    this.subsriptION();
  }
}

function useReduxDevtools(store) {
  if (process.env.NODE_ENV !== 'production' && window.__REDUX_DEVTOOLS_EXTENSION__) {
    try {
      const redux = require.resolve('redux') && require('redux');
      const { createStore, combineReducers, } = redux;
      const rootReducer = combineReducers({ root: () => store.state, });
      const reduxStore = createStore(rootReducer, window.__REDUX_DEVTOOLS_EXTENSION__());
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
    } catch (Exception) {
      console.warn('"npm install --save-dev redux" is recommended');
    }
  }
}
