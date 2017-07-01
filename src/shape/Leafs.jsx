import React from 'react';
import { any, string, object, array, bool, } from 'prop-types';
import { getComponentTypeOf, } from './utils';
import Definition from './Definition';
import { type, isRequired as requiredShape, leaf, many as manyKey, stateOnly, strict, } from './shapeTypes';

class LeafShape extends React.Component {

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

  componentWillMount() {
    const { shape, identity, build, parentIsArray, } = this.context;
    const { name, isRequired, initial, many, loose, } = this.props;
    this.identity = [ ...identity, name, ];
    if (shape) {
      Definition.checkPropsSanity(this, initial, build, name, many, parentIsArray);
      this.shape = shape[many ? manyKey : name] = {
        [requiredShape]: !!isRequired,
        [type]: getComponentTypeOf(this),
        [strict]: !loose,
        [leaf]: true,
        [stateOnly]: true,
      };
      if (this.props.children) {
        throw new Error('Target: "'+this.identity.join(',')+'" of type: "'+ getComponentTypeOf(this)+'", cannot have any children');
      }
    }
    if (build && initial!==undefined && !build.hasOwnProperty(name) && !many) {
      build[name] = initial;
    }
  }

  render() {
    return null;
  }
}

export class Numb extends LeafShape {
  componentWillMount() {
    super.componentWillMount();
  }
}

export class Str extends LeafShape {}
export class Err extends LeafShape {}
export class Rgx extends LeafShape {}
export class Func extends LeafShape {}
export class Dt extends LeafShape {}
export class Symb extends LeafShape {}
export class Bool extends LeafShape {}
