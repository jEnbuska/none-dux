import React from 'react';
import createStore from './createStore';
import SubStore from './SubStore';

const { object, func, } = React.PropTypes;
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
  subscribers={};

  componentWillMount() {
    this.store = createStore({ ...this.props.initialState, });
    this.subsription = this.store.subscribe(() => {
      const { state, } = this.store;
      requestAnimationFrame(
          () => {
            if (state === this.store.state) {
              Object.values(this.subscribers).forEach(sub => sub());
            }
          });
      const { onChange, } = this.props;
      onChange && onChange(state);
    });
    createDebugger(this.store);
  }

  getChildContext() {
    const { store, subscribe, } = this;
    return {
      store,
      subscribe,
    };
  }

  subscribe = (callback) => {
    const { subscriptionCount, subscribers, } = this;
    subscribers[subscriptionCount] = callback;
    this.subscriptionCount++;
    return () => delete this.subscribers[subscriptionCount];
  };

  render() {
    return <span>{this.props.children}</span>;
  }

  componentWillUnmount() {
    this.subsription();
  }
}

function createDebugger(store) {
  if (process.env.NODE_ENV==='development') {
    System.import('redux').then(it => {
      const { createStore, combineReducers, } = it;
      const reducers = combineReducers({ root: () => store.state, });
      const reduxStore = createStore(reducers, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());
      store.subscribe(() => {
        const { func, target, param, } = SubStore.lastInteraction;
        reduxStore.dispatch({ type: func.toString(), target, param, });
      });
    }).catch(() => console.error('no redux dependency'));
  }
}
