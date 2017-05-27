import React from 'react';
import { object, func, } from 'prop-types';

const { entries, keys, } = Object;
const connector = (Component, mapStateToProps = store => store.state, mapDispatchToProps = {}) =>
  class Connect extends React.Component {

    static contextTypes = {
      store: object,
      subscribe: func,
    };

    state = {};
    shouldUpdate = false;

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
        this.shouldUpdate = true;
        this.setState(nextState);
      });
    }

    render() {
      return <Component {...this.props} {...this.state} {...this.mapDispatchToProps} />;
    }

    componentWillReceiveProps(nextProps) {
      const { props, context: { store, }, } = this;
      if (keys({ ...props, ...nextProps, }).filter(k => props[k] !== nextProps[k]).length) {
        this.mapDispatchToProps = entries(mapDispatchToProps)
          .reduce(function (acc, [ key, value, ]) {
            acc[key] = (...params) => value(...params)(store, nextProps);
            return acc;
          }, {});
        const nextState = mapStateToProps(store.state, nextProps);
        this.shouldUpdate = true;
        this.setState(nextState);
      }
    }

    shouldComponentUpdate() {
      if (this.shouldUpdate) {
        this.shouldUpdate = false;
        return true;
      }
      return false;
    }

    componentWillUnmount() {
      this.subscription();
    }
  };

export default (mapStateToProps, mapDispatchToProps) =>
  (target) => connector(target, mapStateToProps, mapDispatchToProps);
