import React from 'react';
import { CSSTransitionGroup, } from 'react-transition-group';
import { withRouter, Switch, Route, } from 'react-router-dom';
import { connect, } from 'react-redux';
import Auth from '../components/Auth';
import Content from './Content';

@withRouter
@connect(({ blockContentInteraction, }) => ({ blockContentInteraction, }))
export default class App extends React.Component {

  render() {
    const { blockContentInteraction: block, location, } = this.props;
    return (
        <CSSTransitionGroup
          transitionName='route-change'
          transitionEnterTimeout={500}
          transitionLeaveTimeout={500}>
          <div className={`block-interaction${block ? '-active': '-inactive'}`} />
          <div className='activity-window' key={location.pathname}>
            <Switch>
              <Route path='/auth' component={Auth} />
              <Route path='/' component={Content} />
            </Switch>
          </div>
        </CSSTransitionGroup >
    );
  }
}