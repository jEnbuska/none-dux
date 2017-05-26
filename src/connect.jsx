import React from 'react';
import { object, func, } from 'prop-types';

const { entries, keys, } = Object;
const connector = (Component, mapStateToProps, mapDispatchToProps = {}) =>
  class Connect extends React.Component {

    static contextTypes = {
      store: object,
      subscribe: func,
    };

    state = {};

    componentWillMount() {
      const { props, context: { store, subscribe, }, } = this;
      this.mapDispatchToProps = entries(mapDispatchToProps)
        .reduce(function (acc, [ key, value, ]) {
          acc[key] = (...params) => value(...params)(store, props);
          return acc;
        }, {});
      const initialState = mapStateToProps(store.state, this.props);
      this.setState(initialState);
      this.subscription = subscribe(() => {
        const nextState = mapStateToProps(store.state, this.props);
        this.setState(nextState);
      });
    }

    render() {
      return <Component {...this.props} {...this.state} {...this.mapDispatchToProps} />;
    }

    shouldComponentUpdate(nextProps, nextState) {
      const { state, props, } = this;
      const propsChanges = keys({ ...props, ...nextProps, }).filter(k => props[k] !== nextProps[k]);
      if (propsChanges.length) {
        const { store, } = this.context;
        this.mapDispatchToProps = entries(mapDispatchToProps)
          .reduce(function (acc, [ key, value, ]) {
            acc[key] = acc[key] = (...params) => value(...params)(store, props)
            return acc;
          }, {});
        return true;
      }
      return keys({ ...state, ...nextState, }).some(k => state[k] !== nextState[k]);
    }

    componentWillUnmount() {
      this.subscription();
    }
  };

export default (mapStateToProps, mapDispatchToProps) =>
  (target) => connector(target, mapStateToProps, mapDispatchToProps);
