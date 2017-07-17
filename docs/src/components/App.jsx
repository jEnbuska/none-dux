import React from 'react';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import { Switch, Route, } from 'react-router-dom';
import { connect, } from 'react-redux';
import Home from './Home';
import ExampleComponent from './ExampleComponent';
import PageNotFound from './PageNotFound';
import Breadcrumbs from './Breadcrumbs';
import Sidebar from './Sidebar';
import '../styles/routeChange.css';

export default class App extends React.Component {

  state = { sidebarCollapsed: false, pathname: undefined, data: {}, };

  render() {
    const { sidebarCollapsed, pathname, } = this.state;
    return (
      <div>
        <div>
          <div className='app-window'>
            <Sidebar
              pathname={pathname}
              collapsed={sidebarCollapsed} />
            <TransitionGroup
              transitionName='route-change'
              transitionEnter
              transitionLeave
              transitionEnterTimeout={500}
              transitionLeaveTimeout={500}>
              <div className='activity-window' key={this.props.location.pathname}>
                {this.props.children}
              </div>
            </TransitionGroup >
          </div>
        </div>
      </div>
    );
  }
}