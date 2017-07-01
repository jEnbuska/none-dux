import React from 'react';
import { any, string, object, array, bool, } from 'prop-types';
import { getComponentTypeOf, } from './utils';
import Definition from './Definition';
import { strict, type, leaf, isRequired as requiredShape, many as manyKey, stateOnly as stateOnlyShape, } from './shapeTypes';
import createLeaf from '../SubStoreLeaf';
import DisplayNone from './DisplayNone';

export const defaultValue = '__parent_default__';

class ParentShape extends React.Component {

  static propTypes = {
    isRequired: bool,
    initial: any,
    loose: bool,
    name: string,
    many: bool,
    stateOnly: bool,
  };

  static defaultProps = {
    stateOnly: false,
    initial: defaultValue,
  };

  static contextTypes = {
    build: any,
    shape: object,
    identity: array,
    parentIsArray: bool,
    stateOnly: bool,
  };

  static childContextTypes = {
    identity: array,
    build: any,
    shape: object,
    parentIsArray: bool,
    stateOnly: bool,
  };

  getChildContext() {
    return {
      parentIsArray: this instanceof Arr,
      build: this.build,
      identity: this.identity,
      shape: this.shape,
      stateOnly: this.context.stateOnly || this.props.stateOnly,
    };
  }

  componentWillMount() {
    const { shape, identity, build, parentIsArray, } = this.context;
    const { name, isRequired, loose, initial, many, } = this.props;
    this.identity = [ ...identity, name, ];
    if (shape) {
      Definition.checkPropsSanity(this, initial, build, name, many, parentIsArray);
      const childIsMultiple = this.props.children && React.Children.toArray(this.props.children).some(({ props, }) => props && props.many);
      this.shape = shape[many ? manyKey : name] = {
        [requiredShape]: !!isRequired,
        [strict]: (!loose && !childIsMultiple) && !(this instanceof Arr),
        [leaf]: false,
        [type]: getComponentTypeOf(this),
        [stateOnlyShape]: this.context.stateOnly || this.props.stateOnly,
      };
    }
    if (!many && build && initial && !build.hasOwnProperty(name)) {
      this.build = build[name] = initial === defaultValue ? this.defaultInitialState : initial;
    }
  }

  render() {
    return <DisplayNone>{this.props.children}</DisplayNone>;
  }

  componentDidMount() {
    if (this.build && this.props.stateOnly && !this.context.stateOnly) {
      this.context.build[this.props.name] = createLeaf(this.build);
    }
  }

}

export class Arr extends ParentShape {
  defaultInitialState = [];
}

export class Obj extends ParentShape {
  defaultInitialState = {};
}