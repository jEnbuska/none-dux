import React from 'react';
import { string, object, array, func, bool, } from 'prop-types';
import createStore from '../createStore';
import { getComponentTypeOf, } from './utils';
import { strict, type, } from './shapeTypes';
import DisplayNone from './DisplayNone';

export default class Definition extends React.Component {

  static propTypes = {
    initial: object,
  };

  static contextTypes = {
    onStoreReady: func,
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
    this.build = createStore(this.props.initial);
    if (process.env.NODE_ENV!=='production') {
      this.shape = createStore({ [strict]: !this.props.loose, [type]: 'Object', });
    }
  }

  render() {
    return <DisplayNone>{this.props.children}</DisplayNone>;
  }

  componentDidMount() {
    const { build, shape, } = this;
    this.context.onStoreReady(build, shape);
  }

  static checkPropsSanity(component, initial, build, name, many) {
    if ((name === null || name === undefined) && !many) {
      throw new Error('Type: "'+ getComponentTypeOf(component) + '" of "' + component.identity.join(', ') + '" is missing a name');
    } else if (initial && !build) {
      Definition.onInitializeWarn('Type: "'+ getComponentTypeOf(component) + '" of "' + component.identity.join(', ') + '" is not attached in initial, so it cannot be given initial state');
    } else if (many && name) {
      Definition.onInitializeWarn('Type: "'+getComponentTypeOf(component) + '"\nTarget:'+component.identity.join(',') + '"\n Got both "name" and "many" using "many" instead');
    }
  }

  static onInitializeWarn(msg) {
    console.error(msg);
  }

}
