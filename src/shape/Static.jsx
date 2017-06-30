import React from 'react';
import { any, string, object, array, bool, } from 'prop-types';
import { getComponentTypeOf, } from './utils';
import Definition from './Definition';
import createLeaf from '../SubStoreLeaf';
import { strict, type, leaf, isRequired as requiredShape, isStatic as staticShape, } from './shapeTypes';
import DisplayNone from './DisplayNone';

class StaticShape extends React.Component {

  static propTypes = {
    isRequired: bool,
    initial: any,
    name: string,
    loose: bool,
  };

  static contextTypes = {
    build: any,
    shape: object,
    identity: array,
    parentIsArray: bool,
  };

  static childContextTypes = {
    identity: array,
    build: any,
    shape: object,
    isStatic: bool,
    parentIsArray: bool,
  };

  getChildContext() {
    return {
      build: this.build,
      identity: this.identity,
      shape: this.shape,
      isStatic: true,
      parentIsArray: this instanceof StaticArray,
    };
  }

  componentWillMount() {
    const { shape, identity, build, isStatic, parentIsArray, } = this.context;

    const { name, isRequired, loose, initial, many, } = this.props;

    this.identity = [ ...identity, name, ];
    if (isStatic) {
      throw new Error('Cannot have static values inside already static structure: '+this.identity.join(', '));
    }
    if (shape) {
      Definition.checkPropsSanity(this, initial, build, name, many, parentIsArray, true);
      if (initial) {
        if (initial instanceof String) {
          throw new Error('Expected object or array as value but got string '+initial);
        }
        try {
          Object.keys(initial);
        } catch (Exception) {
          throw new Error('Expected object or array as value but got string '+initial);
        }
      }
      const childIsMultiple = this.props.children && React.Children.toArray(this.props.children).some(({ props, }) => props && props.many);
      this.shape = shape[name] = {
        [requiredShape]: !!isRequired,
        [strict]: (!loose && !childIsMultiple) && !(this instanceof StaticArray),
        [leaf]: false,
        [type]: getComponentTypeOf(this),
        [staticShape]: true,
      };
    }
    if (build && initial && !initial.hasOwnProperty(name)) {
      this.build = build[name]= (initial === true ? this.defaultInitialState : initial)[name];
    }
  }

  render() {
    return <DisplayNone>{this.props.children}</DisplayNone>;
  }

  componentDidMount() {
    if (this.build) {
      this.context.build[this.props.name] = createLeaf(this.build);
    }
  }
}

export class StaticArray extends StaticShape {
  defaultInitialState = [];
}

export class StaticObject extends StaticShape {
  defaultInitialState = [];
}