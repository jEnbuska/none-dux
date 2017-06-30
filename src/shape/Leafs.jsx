import React from 'react';
import { any, string, object, array, bool, } from 'prop-types';
import { getComponentTypeOf, } from './utils';
import Definition from './Definition';
import { type, isRequired as requiredShape, leaf, many as manyKey, } from './shapeTypes';

class LeafShape extends React.Component {

  static propTypes = {
    isRequired: bool,
    initial: any,
    name: string,
  };

  static contextTypes = {
    build: object,
    shape: object,
    identity: array,
  };

  componentWillMount() {
    const { shape, identity, build, isStatic, } = this.context;
    const { name, isRequired, initial, many, } = this.props;
    this.identity = [ ...identity, name, ];

    if (shape) {
      Definition.checkPropsSanity(this, initial, build, name, many);
      this.shape = shape.setState({ [many ? manyKey : name]: {
        [requiredShape]: !!isRequired,
        [type]: getComponentTypeOf(this),
        [leaf]: true, },
      })[name];
      if (this.props.children) {
        throw new Error('Target: "'+this.identity.join(',')+'" of type: "'+ getComponentTypeOf(this)+'", cannot have any children');
      }
    }
    if (build && initial!==undefined && !build.state.hasOwnProperty(name) && !many) {
      if (isStatic) {
        build[name] = initial;
        this.build = build[name];
      } else {
        build.setState({ [name]: initial, });
      }
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

export class Str extends LeafShape {
  componentWillMount() {
    super.componentWillMount();
    super.componentWillMount(value => !(value instanceof String));
  }
}

export class Err extends LeafShape {

  componentWillMount() {
    super.componentWillMount();
    super.componentWillMount(value => !(value instanceof Error));
  }
}

export class Rgx extends LeafShape {
  componentWillMount() {
    super.componentWillMount();
    super.componentWillMount(value => !(value instanceof RegExp));
  }
}
export class Func extends LeafShape {
  componentWillMount() {
    super.componentWillMount();
    super.componentWillMount(value => !(value instanceof Function));
  }
}

export class Dt extends LeafShape {
  componentWillMount() {
    super.componentWillMount();
    super.componentWillMount(value => !(value instanceof Date));
  }
}

export class Symb extends LeafShape {
  componentWillMount() {
    super.componentWillMount(value => !(value instanceof Symbol));
  }

}

export class Bool extends LeafShape {
  componentWillMount() {
    super.componentWillMount(value => !(value instanceof Boolean));
  }
}
