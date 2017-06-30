import React from 'react';
import { string, object, array, func, bool, } from 'prop-types';
import createStore from '../createStore';
import { getComponentTypeOf, } from './utils';

export default class Store extends React.Component {

  static propTypes = {
    initial: object,
  };

  static contextTypes = {
    onStoreCreated: func,
  };

  static defaultProps= {
    onStoreCreated: () => {},
  };

  static childContextTypes = {
    identity: array,
    shape: object,
    build: object,
    attached: bool,
  };

  state = {};

  getChildContext() {
    return {
      identity: [ 'root', ],
      attached: true,
      build: this.build,
      shape: this.shape,
    };
  }

  componentWillMount() {
    this.build = createStore(this.props.initial || {});
    if (process.env.NODE_ENV!=='production') {
      this.shape = createStore({});
    }
  }

  render() {
    return this.props.children;
  }

  componentDidMount() {
    const { shape, build, } = this;
    this.props.onStoreCreated(build, Object.keys(shape.state).length && shape.state);
  }

  static checkPropsSanity(identity, initial, build, isRequired, name, many) {
    if ((name === null || name === undefined) && !many) {
      throw new Error(getComponentTypeOf(this) + ' of' + identity.join(', ') + '\n is missing a name');
    } else if (initial && !build) {
      Store.onInitializeWarn(getComponentTypeOf(this) + ' of' + this.identity.join(' ,') + '\n is not attached in initial, so it cannot be given initial state');
    } else if (many && name) {
      Store.onInitializeWarn('Type: '+getComponentTypeOf(this) + '\nTarget:'+this.identity.join(' ,') + '\n Got both "name" and "many" using "many" instead');
    }
  }

  static onInitializeWarn(msg) {
    console.error(msg)
  }

}
