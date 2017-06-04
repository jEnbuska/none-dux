import React from 'react';
import propTypes from 'prop-types';
import Div from './Div';

const { entries, } = Object;
const routes = {
  Todos: '/',
};
export default class Sidebar extends React.Component {

  static contextTypes = {
    router: propTypes.object,
  };

  state = { pathname: '', };

  componentWillMount() {
    const { router, } = this.context;
    const { pathname, } = router.getCurrentLocation();
    this.subscription =router.listen(() => {
      const { pathname, } = router.getCurrentLocation();
      this.setState({ pathname, });
    });
    this.setState({ pathname, });
  }

  render() {
    const { pathname, } = this.state;
    const {router} = this.context;
    return (
      <Div style={{ position: 'fixed', width: '12%', height: '100%', display: 'flex', flexDirection: 'column', }}>
        {entries(routes).map(([ k, v, ]) => (
          <Div
            key={k}
            style={{ height: '50px', textAlign: 'center', margin: '.5em', cursor: 'pointer', border: (pathname === v ? '2px solid blue': '1px solid black'), }}
            onClick={() => router.push(v)}>
            <h3 style={{ marginTop: '.7em', overflow:'hidden'}}>{k}</h3>
          </Div>
          ))}
      </Div>
    );
  }

  componentWillUnmount() {
    this.subscription();
  }
}