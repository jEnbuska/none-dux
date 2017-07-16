import React from 'react';
import { CSSTransitionGroup, } from 'react-transition-group';
import { withRouter, Switch, Route, Redirect, } from 'react-router-dom';
import { connect, } from 'react-redux';
import Auth from '../components/Auth'
import Sidebar from './Sidebar';

@connect(({auth}) => ({auth}))
@withRouter
export default class App extends React.Component {

  state = {};

  render() {
    const { auth, location, children, } = this.props;
    const { pathname, } = location;
    return (
      <div>
        <Sidebar />
        <CSSTransitionGroup
          transitionName='route-change'
          transitionEnter
          transitionLeave
          transitionEnterTimeout={500}
          transitionLeaveTimeout={500}>
          <div className='activity-window' key={pathname}>
            <Switch>
              {!auth.user &&
              !pathname.includes('auth') &&
              (<Redirect to='/auth' />)}
              <Route path='/auth' component={}/>
              <Route component={() => 'hey'} />
            </Switch>
          </div>
        </CSSTransitionGroup >
      </div>
    );
  }
}