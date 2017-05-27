import React from 'react';
import { object, func, } from 'prop-types';

const { entries, keys, } = Object;
const connector = (Component, mapStateToProps = store => store.state, mapDispatchToProps = {}) =>
  class Connect extends React.Component {

    static contextTypes = {
      store: object,
      subscribe: func,
    };

    state = { __storeChange__: 0, };

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
        this.setState({ __storeChange__: this.state.__storeChange__ + 1, });
      });
    }

    render() {
      const { __storeChange__, ...rest } = this.state;
      return <Component {...this.props} {...rest} {...this.mapDispatchToProps} />;
    }

    shouldComponentUpdate(nextProps, nextState) {
      const { props, state, } = this;
      const { store, } = this.context;
      const propsChanges = keys({ ...props, ...nextProps, }).filter(k => props[k] !== nextProps[k]);
      if (propsChanges.length) {
        this.mapDispatchToProps = entries(mapDispatchToProps)
          .reduce(function (acc, [ key, value, ]) {
            acc[key] = (...params) => value(...params)(store, nextProps);
            return acc;
          }, {});
        const nextState = mapStateToProps(store.state, nextProps);
        this.setState(nextState);
        return true;
      } else if (nextState.__storeChange__ !== state.__storeChange__) {
        const nextState = mapStateToProps(store.state, nextProps);
        this.setState(nextState);
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
