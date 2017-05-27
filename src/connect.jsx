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
      const { props, } = this;
      const dispatchChanges= keys({ ...props, ...nextProps, }).filter(k => props[k] !== nextProps[k]);
      const { store, } = this.context;
      const nextMappedState = mapStateToProps(store.state, this.props);
      let shouldUpdate;
      if (dispatchChanges.length) {
        this.mapDispatchToProps = entries(mapDispatchToProps)
          .reduce(function (acc, [ key, value, ]) {
            acc[key] = acc[key] = (...params) => value(...params)(store, props);
            return acc;
          }, {});
        shouldUpdate= true;
      }
      if (keys({ ...nextState, ...nextMappedState, }).some(k => nextState[k]!==nextMappedState[k])) {
        this.setState(nextMappedState);
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
