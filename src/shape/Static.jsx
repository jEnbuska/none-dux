import React from 'react';
import { any, string, object, array, bool, } from 'prop-types';
import { getComponentTypeOf, } from './utils';
import Definition from './Definition';
import createLeaf from '../SubStoreLeaf';
import { strict, type, leaf, isRequired as requiredShape, many as manyKey, } from './shapeTypes';

class StaticShape extends React.Component {

  static propTypes = {
    isRequired: bool,
    initial: any,
    name: string,
    loose: bool,
  };

  static contextTypes = {
    build: object,
    shape: object,
    identity: array,
  };

  static childContextTypes = {
    identity: array,
    build: object,
    shape: object,
    isStatic: bool,
  };

  getChildContext() {
    return {
      build: this.build,
      identity: this.identity,
      shape: this.shape,
      attached: this.attached,
      isStatic: true,
    };
  }

  componentWillMount() {
    const { context, props, } = this;
    const { shape, identity, build, isStatic, } = context;
    const { name, isRequired, loose, initial, many, } = this.props;
    this.identity = [ ...identity, name, ];
    if (isStatic) {
      throw new Error('Cannot have static values inside already static structure: '+this.identity.join(', '));
    }
    if (shape) {
      Definition.checkPropsSanity(this, initial, build, name, many, loose);
      if (initial instanceof String) {
        throw new Error('Expected object or array as value but got string '+initial);
      }
      try {
        Object.keys(initial);
      } catch (Exception) {
        throw new Error('Expected object or array as value but got string '+initial);
      }
      const childIsMultiple = React.Children.toArray(this.props.children).some(({ props, }) => props && props.many);
      const key = many ? manyKey : name;
      this.shape = shape.setState({ [key]: {
        [requiredShape]: !!isRequired,
        [strict]: !loose && !childIsMultiple,
        [leaf]: false,
        [type]: getComponentTypeOf(this), }, })[key];
    }
    if (initial!==undefined && !many) {
      this.build = build.setState({ [name]: createLeaf(props.initial === true ? this.defaultInitialState : props.initial), }).state[name];
    }
  }

  render() {
    return this.props.children || null;
  }
}

export class StaticArray extends StaticShape {

  defaultInitialState = [];

  componentWillMount() {
    super.componentWillMount();
  }
}

export class StaticObject extends StaticShape {

  defaultInitialState = [];

  componentWillMount() {
    super.componentWillMount();
  }
}