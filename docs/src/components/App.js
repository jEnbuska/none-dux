import React from 'react';
import { Switch, Route, } from 'react-router-dom';
import { connect, } from 'react-redux';
import Home from './Home';
import ExampleComponent from './ExampleComponent';
import PageNotFound from './PageNotFound';
import Breadcrumbs from './Breadcrumbs';
import s from '../styles/app.style';

function App({users}) {
  return (
    <div style={s.root}>
      <h1 style={s.title}>Single Page Apps for GitHub Pages</h1>

      <nav style={s.breadcrumbs}>
        <Breadcrumbs />
      </nav>

      <Switch>
        <Route exact path='/' component={Home} />
        <Route path='/example' component={ExampleComponent} />
        <Route component={PageNotFound} />
      </Switch>

      <div style={s.creditLine} />
    </div>
  );
}
export default connect(state => ({users: state.users}))(App)