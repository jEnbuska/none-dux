import React from 'react';
import { string, object, array, func, bool, } from 'prop-types';
import createStore from '../createStore';
import { getComponentTypeOf, } from './utils';
import { strict, type, leaf, stateOnly, isRequired, } from './shapeTypes';
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
    parentIsArray: bool,
  };

  state = {};

  getChildContext() {
    return {
      identity: [ 'root', ],
      attached: true,
      build: this.build,
      shape: this.shape,
      parentIsArray: false,
    };
  }

  componentWillMount() {
    this.build = this.props.initial || {};
    if (process.env.NODE_ENV!=='production') {
      this.shape = { [strict]: !this.props.loose, [leaf]: false, [type]: 'Object', [stateOnly]: false, [isRequired]: true, };
    }
  }

  render() {
    return <DisplayNone>{this.props.children}</DisplayNone>;
  }

  componentDidMount() {
    const { build, shape, } = this;
    this.context.onStoreReady(createStore(build, shape));
  }

  static checkPropsSanity(component, initial, build, name, many, parentIsArray) {
    if ((name === null || name === undefined) && !many) {
      throw new Error('Type: "'+ getComponentTypeOf(component) + '" of "' + component.identity.join(', ') + '" is missing a name');
    } else if (initial && !build) {
      Definition.onInitializeWarn('Type: "'+ getComponentTypeOf(component) + '" of "' + component.identity.join(', ') + '" is not attached in initial, so it cannot be given initial state');
    } else if (many && name) {
      Definition.onInitializeWarn('Type: "'+getComponentTypeOf(component) + '"\nTarget:'+component.identity.join(', ') + '"\nGot both "name" and "many" using "many" instead');
    } else if (!many && parentIsArray) {
      Definition.onInitializeWarn('Type: "'+getComponentTypeOf(component) + '"\nTarget:'+component.identity.join(', ') + '"\nType "many" is inserted because parent is Array\'t');
    }
  }

  static onInitializeWarn(msg) {
    console.warn(msg);
  }

}
