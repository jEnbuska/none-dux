import React from 'react';
import { any, string, object, array, bool, } from 'prop-types';
import { getComponentTypeOf, } from './utils';
import Definition from './Definition';
import { strict, type, leaf, isRequired as requiredShape, many as manyKey, } from './shapeTypes';
import DisplayNone from './DisplayNone';

class ParentShape extends React.Component {

  static propTypes = {
    isRequired: bool,
    initial: any,
    loose: bool,
    name: string,
    many: bool,
  };

  static contextTypes = {
    build: object,
    shape: object,
    identity: array,
    isStatic: bool,
  };

  static childContextTypes = {
    identity: array,
    attached: bool,
    build: object,
    shape: object,
  };

  getChildContext() {
    return {
      build: this.build,
      identity: this.identity,
      shape: this.shape,
    };
  }

  componentWillMount() {
    const { context, props, } = this;
    const { shape, identity, build, isStatic, } = context;
    const { name, isRequired, loose, initial, many, } = this.props;

    this.identity = [ ...identity, name, ];
    if (shape) {
      Definition.checkPropsSanity(this, initial, build, name, many, loose);
      if (initial!==undefined) {
        if (initial instanceof String) {
          throw new Error('Expected object or array as value but got string '+initial);
        }
        try {
          Object.keys(initial);
        } catch (Exception) {
          throw new Error('Expected object or array as value but got'+initial);
        }
      }
      const childIsMultiple = React.Children.toArray(this.props.children).some(({ props, }) => props && props.many);
      const key = many ? manyKey : name;
      this.shape = shape.setState({ [key]: {
        [requiredShape]: !!isRequired,
        [strict]: !loose && !childIsMultiple,
        [leaf]: false,
        [type]: getComponentTypeOf(this), }, })[key];
    }
    if (build && initial!==undefined && !build.state.hasOwnProperty(name) && !many) {
      const initialState = props.initial === true ? this.defaultInitialState : initial;
      if (isStatic) {
        build[name] = initialState;
        this.build = build[name];
      } else {
        this.build = build.setState({ [name]: initialState, })[name];
      }
    }
  }

  render() {
    return <DisplayNone>{this.props.children}</DisplayNone>;
  }
}

export class Arr extends ParentShape {

  defaultInitialState = [];

  componentWillMount() {
    super.componentWillMount();
  }
}

export class Obj extends ParentShape {

  defaultInitialState = {};

  componentWillMount() {
    super.componentWillMount();
  }
}