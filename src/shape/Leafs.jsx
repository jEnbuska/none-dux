import React from 'react';
import { any, string, object, array, bool, } from 'prop-types';
import { getComponentType, } from './utils';
import { anyKey, } from '../shape';

const { getPrototypeOf, } = Object;

class LeafShape extends React.Component {

  static propTypes = {
    isRequired: bool,
    initialState: any,
    name: string,
  };

  static contextTypes = {
    store: object,
    shape: object,
    identity: array,
    attached: bool,
    predefinedState: bool,
  };

  componentWillMount() {
    const { context, props, } = this;
    const { shape, identity, attached, store, predefinedState, } = context;
    const { name, isRequired, strict, } = this.props;
    this.identity = [ ...identity, name, ];
    if (name===null || name === undefined) {
      throw new Error(getComponentType(getPrototypeOf(this))+' of' + identity.join(', ')+'\n is missing a name');
    } else if (this.props.initialState && !attached) {
      throw new Error(getComponentType(getPrototypeOf(this))+' of' + this.identity.join(' ,')+'\n is not attached in initialState, so it cannot be given initial state as prop');
    } else if (name === anyKey && isRequired) {
      throw new Error('anyKey cannot be isRequired. Fix: ' + this.identity.join(', '));
    }
    this.shape = shape.setState({ [name]: { isRequired, strict, }, })[name];
    if (!predefinedState && attached && name!==anyKey) {
      this.store = store.setState({ [name]: props.initialState === true ? this.defaultInitialState : props.initialState, })[name];
    }
  }

  render() {
    return null;
  }
}

export class Numb extends LeafShape {
  componentWillMount() {
    super.componentWillMount();
    if (this.store) {
      if (this.store.state instanceof Number) {
        this.attached = true;
      } else {
        console.error('Invalid initial state '+ JSON.stringify(this.store.state, null, 1)+ ' given to '+this.identity.join(', '));
      }
    }
  }
}

export class Str extends LeafShape {
  componentWillMount() {
    super.componentWillMount();
    if (this.store) {
      if (this.store.state instanceof Array) {
        this.attached = true;
      } else {
        console.error('Invalid initial state '+ JSON.stringify(this.store.state, null, 1)+ ' given to '+this.identity.join(', '));
      }
    }
  }
}

export class Err extends LeafShape {

  componentWillMount() {
    super.componentWillMount();
    if (this.store) {
      if (this.store.state instanceof Error) {
        this.attached = true;
      } else {
        console.error('Invalid initial state '+ JSON.stringify(this.store.state, null, 1)+ ' given to '+this.identity.join(', '));
      }
    }
  }
}

export class Rgx extends LeafShape {
  componentWillMount() {
    super.componentWillMount();
    if (this.store) {
      if (this.store.state instanceof RegExp) {
        this.attached = true;
      } else {
        console.error('Invalid initial state '+ JSON.stringify(this.store.state, null, 1)+ ' given to '+this.identity.join(', '));
      }
    }
  }
}
export class Func extends LeafShape {
  componentWillMount() {
    super.componentWillMount();
    if (this.store) {
      if (this.store.state instanceof Function) {
        this.attached = true;
      } else {
        console.error('Invalid initial state '+ JSON.stringify(this.store.state, null, 1)+ ' given to '+this.identity.join(', '));
      }
    }
  }
}

export class Dt extends LeafShape {
  componentWillMount() {
    super.componentWillMount();

    if (this.store.state instanceof Date) {
      this.attached = true;
    } else {
      console.error('Invalid initial state '+ JSON.stringify(this.store.state, null, 1)+ ' given to '+this.identity.join(', '));
    }
  }
}

export class Symb extends LeafShape {
  componentWillMount() {
    super.componentWillMount();
    if (this.store.state instanceof Symb) {
      this.attached = true;
    } else {
      console.error('Invalid initial state '+ JSON.stringify(this.store.state, null, 1)+ ' given to '+this.identity.join(', '));
    }
  }
}

export class Bool extends LeafShape {
  componentWillMount() {
    super.componentWillMount();
    if (this.store.state instanceof Boolean) {
      this.attached = true;
    } else {
      console.error('Invalid initial state '+ JSON.stringify(this.store.state, null, 1)+ ' given to '+this.identity.join(', '));
    }
  }
}
