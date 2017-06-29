import React from 'react';
import { any, string, object, array, bool, } from 'prop-types';
import { getComponentType, NONE, } from './utils';
import SubStore from '../SubStore';
import { anyKey, } from '../shape';

const { getPrototypeOf, } = Object;

class ParentShape extends React.Component {

  static propTypes = {
    isRequired: bool,
    initialState: any,
    strict: bool,
    name: string,
  };

  static contextTypes = {
    store: object,
    shape: object,
    identity: array,
    attached: bool,
    predefinedState: bool,
  };

  static childContextTypes = {
    identity: array,
    attached: bool,
    store: object,
    shape: object,
  };

  getChildContext() {
    return {
      identity: this.identity,
      shape: this.shape,
      attached: this.attached,
    };
  }

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
    return this.props.children || null;
  }

}

export class Arr extends ParentShape {

  defaultInitialState = {};

  componentWillMount() {
    super.componentWillMount();
    if (this.store) {
      if (this.store.state instanceof Array && this.context.initialState) {
        this.attached = true;
      } else {
        throw new Error('Expected initial state of Array. But a invalid initial was state given: '+ JSON.stringify(this.store.state, null, 1)+ ' given to '+this.identity.join(', '));
      }
    }
  }
}

export class Obj extends ParentShape {

  defaultInitialState = [];

  componentWillMount() {
    super.componentWillMount();
    if (this.store) {
      const { state, } = this.store;
      if (!state || SubStore.invalidSubStores(state) || state instanceof Array) {
        throw new Error('Expected initial state of Object. But invalid initial state given: '+ JSON.stringify(state, null, 1)+ ' given to '+this.identity.join(', '));
      } else {
        this.attached = true;
      }
    }
  }
}