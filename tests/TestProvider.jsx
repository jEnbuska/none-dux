import React from 'react';
import { func, } from 'prop-types';

export default class TestProvider extends React.Component {

  static propTypes = {
    onStoreReady: func,
  }

  static childContextTypes = {
    onStoreReady: func,
  };

  getChildContext() {
    return {
      onStoreReady: this.props.onStoreReady,
    };
  }

  render() {
    return <span>{this.props.children}</span>
  }
}