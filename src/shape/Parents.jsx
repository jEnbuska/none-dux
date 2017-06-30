import React from 'react';
import { any, string, object, array, bool, } from 'prop-types';
import { getComponentTypeOf, } from './utils';
import Definition from './Definition';
import { strict, type, leaf, isRequired as requiredShape, many as manyKey, isStatic, } from './shapeTypes';
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
    build: any,
    shape: object,
    identity: array,
    isStatic: bool,
    parentIsArray: bool,
  };

  static childContextTypes = {
    identity: array,
    attached: bool,
    build: any,
    shape: object,
    parentIsArray: bool,
  };

  getChildContext() {
    return {
      parentIsArray: this instanceof Arr,
      build: this.build,
      identity: this.identity,
      shape: this.shape,
    };
  }

  componentWillMount() {
    const { shape, identity, build, parentIsArray, } = this.context;
    const { name, isRequired, loose, initial, many, } = this.props;
    this.identity = [ ...identity, name, ];
    if (shape) {
      Definition.checkPropsSanity(this, initial, build, name, many, parentIsArray);
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
      const childIsMultiple = this.props.children && React.Children.toArray(this.props.children).some(({ props, }) => props && props.many);
      this.shape = shape[many ? manyKey : name] = {
        [requiredShape]: !!isRequired,
        [strict]: (!loose && !childIsMultiple) && !(this instanceof Arr),
        [leaf]: false,
        [type]: getComponentTypeOf(this),
        [isStatic]: false,
      };
    }
    if (!many && build && initial!==undefined && !build.hasOwnProperty(name)) {
      this.build = build[name] = initial === true ? this.defaultInitialState : initial;
    }
  }

  render() {
    return <DisplayNone>{this.props.children}</DisplayNone>;
  }
}

export class Arr extends ParentShape {
  defaultInitialState = [];
}

export class Obj extends ParentShape {
  defaultInitialState = {};
}