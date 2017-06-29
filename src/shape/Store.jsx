import React from 'react';
import { string, object, array, func, bool, } from 'prop-types';
import createStore from '../createStore';
import { NONE, } from './utils';

export default class Store extends React.Component {

  static propTypes = {
    name: string,
    initialState: object,
  };

  static contextTypes = {
    onStoreCreated: func,
  };

  static childContextTypes = {
    identity: array,
    shape: object,
    store: object,
    predefinedState: bool,
    attached: bool,
  };

  state = {};

  getChildContext() {
    return {
      identity: [ 'root', ],
      attached: true,
      store: this.store,
      shape: this.shape,
      predefinedState: !!this.props.initialState,
    };
  }

  componentWillMount() {
    const { initialState, } = this.props;
    if (process.env.NODE_ENV==='production') {
      if (initialState) { return; }
      this.store = createStore({});
    } else {
      this.store = createStore(initialState || {});
      this.shape = createStore({});
    }
  }

  render() {
    if (this.props.initialState && process.env.NODE_ENV==='production') {
      return null;
    }
    return this.props.children;
  }

  componentDidMount() {
    const { onStoreCreated, } = this.context;
    if (process.env.NODE_ENV=== 'production') {
      if (this.props.initialState) {
        onStoreCreated(createStore(this.props.initialState));
      }
    } else {
      const { shape, store, } = this;
      const initialState = this.context.initialState || store.state;
      onStoreCreated(createStore(initialState, Object.keys(shape.state).length && shape.state));
    }
  }

}
