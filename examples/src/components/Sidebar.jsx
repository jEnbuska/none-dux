import React from 'react';
import propTypes from 'prop-types';
import Div from './Div';

const { entries, } = Object;
const routes = {
  Todos: '/todos',
};
export default class Sidebar extends React.Component {

  static contextTypes = {
    router: propTypes.object,
  };

  state = { pathname: '', };

  componentWillMount() {
    const { router, } = this.context;
    const pathname = String(router.history.location.pathname);
    this.subscription =router.history
      .listen(({ pathnamename, }) => this.setState({ pathnamename, }));
    this.setState({ pathname, });
  }

  render() {
    const { pathname, } = this.state;
    const { router, } = this.context;
    return (
      <Div className='sidebar-wrapper'>
        {entries(routes).map(([ k, v, ]) => (
          <Div
            key={k}
            className={pathname===v ? 'sidebar-item-active': 'sidebar-item'}
            onClick={() => router.history.push(v)}>
            <h3 className='sidebar-item-text'>{k}</h3>
          </Div>
          ))}
      </Div>
    );
  }

  componentWillUnmount() {
    this.subscription();
  }
}