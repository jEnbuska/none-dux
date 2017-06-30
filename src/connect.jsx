import React from 'react';
import { object, func, } from 'prop-types';
import SubStore from './SubStore';

const { entries, keys, } = Object;
// ie friendly
function some(arr, predicate) {
  for (let i = 0; i<arr.length; i++) {
    if (predicate(arr[i])) {
      return true;
    }
  }
  return false;
}

const emptyMapStateToProps = () => ({});
const connector = (Component, param1 = emptyMapStateToProps, mapDispatchToProps) => {
  let mapStateToProps;
  if (param1!==emptyMapStateToProps && !(param1 instanceof Function)) {
    mapStateToProps = emptyMapStateToProps;
    mapDispatchToProps = param1;
  } else {
    mapStateToProps = param1;
  }
  const connect = class Connect extends React.Component {

    static contextTypes = {
      store: object,
      subscribe: func,
    };

    displayName = `Connect.${Component.name}`;
    state = {};
    lastChange = 0;
    shouldUpdate = false;

    componentWillMount() {
      const { props, context: { store, subscribe, }, } = this;
      this.mapDispatchToProps = mapDispatchToProps ? entries(mapDispatchToProps)
        .reduce(function (acc, [ key, value, ]) {
          acc[key] = (...params) => value(...params)(store);
          return acc;
        }, {}) : {};
      const initialState = mapStateToProps(store.state, props);
      this.setState(initialState);
      this.lastChange = SubStore.lastChange;
      this.subscription = subscribe(() => {
        if (this.lastChange!==SubStore.lastChange) {
          this.lastChange = SubStore.lastChange;
          const nextState = mapStateToProps(store.state, this.props);
          const { state, } = this;
          if (keys({ ...state, ...nextState, }).some(k => state[k]!==nextState[k])) {
            this.shouldUpdate = true;
            this.setState(nextState);
          }
        }
      });
    }

    render() {
      return (<Component
        {...this.props}
        {...this.state}
        {...this.mapDispatchToProps} />);
    }

    componentWillReceiveProps(nextProps) {
      const { props, context: { store, }, lastChange, state, } = this;
      if (SubStore.lastChange!==lastChange) {
        this.lastChange = SubStore.lastChange;
        const nextState = mapStateToProps(store.state, nextProps);
        if (some(keys({ ...state, ...nextState, }), k => state[k]!==nextState[k]) || some(keys({ ...props, ...nextProps, }), k => props[k] !== nextProps[k])) {
          this.shouldUpdate = true;
          this.setState(nextState);
        }
      } else if (keys({ ...props, ...nextProps, }).some(k => props[k] !== nextProps[k])) {
        const nextState = mapStateToProps(store.state, nextProps);
        this.shouldUpdate = true;
        this.setState(nextState);
      }
    }

    shouldComponentUpdate() {
      if (this.shouldUpdate) {
        this.shouldUpdate=false;
        return true;
      }
      return false;
    }

    componentWillUnmount() {
      this.subscription();
    }
  };
  connect.displayName = `Connect(${Component.name})`;
  return connect;
};

export default (mapStateToProps, mapDispatchToProps) =>
  (target) => connector(target, mapStateToProps, mapDispatchToProps);
