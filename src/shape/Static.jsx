import React from 'react';
import { any, string, object, array, bool, } from 'prop-types';
import { getComponentType, } from './utils';
import createLeaf, { SubStoreArrayLeaf, SubStoreObjectLeaf, } from '../SubStoreLeaf';
import { anyKey, } from '../shape';

const { getPrototypeOf, } = Object;

class StaticShape extends React.Component {

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
    } else if (!store) {
      throw new Error('StaticArray & StaticObject cannot have static children because already static: ' + this.identity.join(', '));
    } else if()
    this.shape = shape.setState({ [name]: { isRequired, strict, }, })[name];
    if (!predefinedState && attached && name!==anyKey) {
      store.setState({ [name]: createLeaf(props.initialState === true ? this.defaultInitialState : props.initialState), });
    }
  }

  render() {
    return null;
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