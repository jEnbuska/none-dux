import React from 'react';
import { object, array, func, bool, } from 'prop-types';
import createStore from '../createStore';
import { getComponentTypeOf, getValueTypeName, } from './utils';
import { NATURAL_LEAF_TYPES, } from '../common';
import { strict, type, leaf, stateOnly, isRequired, } from './shapeTypes';
import DisplayNone from './DisplayNone';

import { defaultValue, } from './Parents';

export default class Definition extends React.Component {

  static propTypes = {
    initial: object,
    loose: bool,
  };

  static defaultProps = {
    loose: false,
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
      identity: [ '_application_state_', ],
      attached: true,
      build: this.build,
      shape: this.shape,
      parentIsArray: false,
    };
  }

  componentWillMount() {
    const { initial, loose, } = this.props;
    this.build = initial || {};
    if (process.env.NODE_ENV!=='production') {
      this.shape = { [strict]: !loose, [leaf]: false, [type]: 'Object', [stateOnly]: false, [isRequired]: true, };
    }
  }

  render() {
    return <DisplayNone>{this.props.children}</DisplayNone>;
  }

  componentDidMount() {
    const { build, shape, } = this;
    this.context.onStoreReady(createStore(build, shape));
  }

  static checkPropsSanity(component, initial, build, name, many) {
    const type = getComponentTypeOf(component);
    const identity = component.identity.join(', ');
    if ((name === null || name === undefined) && !many) {
      const parentIdentity = identity.slice(0, identity.length-1);
      throw new Error('Type: "'+ type + '" of "' + parentIdentity + '" is missing a name');
    } else if (initial && !build && initial!== defaultValue) {
      Definition.onInitializeWarn('Type: "'+ type + '"\n' +
        'Target: "' + identity + '" is not attached in initial state, so it cannot be given own initial state');
    } else if (many && name) {
      Definition.onInitializeWarn('Type: "'+type+ '"\n' +
        'Target: "'+identity + '"\n' +
        'Got both props: "name" and "many". Using only "many" instead');
    } else if (initial && initial!==defaultValue && (type==='Object' || type === 'Array') && NATURAL_LEAF_TYPES[getValueTypeName(initial)]) {
      throw new Error('Type: "'+type+'"\n' +
        'Target: "'+identity+'"\n' +
        'Got wrong type of initial value: "'+initial+'" of type: "'+getValueTypeName(initial)+'"');
    }
  }

  static onInitializeWarn(msg) {
    console.warn(msg);
  }

}
