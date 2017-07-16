import React from 'react';
import propTypes from 'prop-types';
import Div from './Div';

const { entries, } = Object;

export default class Sidebar extends React.Component {

  static contextTypes = {
    router: propTypes.object,
  };

  render() {
    const { router, } = this.context;
    return (
      <Div className='sidebar-wrapper'>
        {entries({ '/': 'Todos', }).map(([ k, v, ]) => (
          <Div
            key={k}
            className='sidebar-item'
            onClick={() => router.push(k)}>
            <h3 className='sidebar-item-text'>{v}</h3>
          </Div>
          ))}
      </Div>
    );
  }

  componentWillUnmount() {
    this.subscription();
  }
}