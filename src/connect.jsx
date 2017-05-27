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
      const dispatchChanges= keys({ ...props, ...nextProps, }).filter(k => props[k] !== nextProps[k]);
      const mapStateChanges = keys({ ...state, ...nextState, }).filter(k => props[k] !== nextProps[k]);
      let shouldUpdate;
      const { store, } = this.context;
      if (dispatchChanges.length) {
        this.mapDispatchToProps = entries(mapDispatchToProps)
          .reduce(function (acc, [ key, value, ]) {
            acc[key] = acc[key] = (...params) => value(...params)(store, props);
            return acc;
          }, {});
        shouldUpdate= true;
      }
      if (mapStateChanges.length) {
        nextState = mapStateToProps(store.state, this.props);
        this.setState(nextState);
        shouldUpdate= true;
      }
      return shouldUpdate;
    }

    componentWillUnmount() {
      this.subscription();
    }
  };

export default (mapStateToProps, mapDispatchToProps) =>
  (target) => connector(target, mapStateToProps, mapDispatchToProps);
