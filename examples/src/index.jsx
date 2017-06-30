import 'styles';
import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, browserHistory, IndexRedirect, } from 'react-router';
import { Definition, Str, Numb, Err, Bool, Obj, } from '../../src/shape/index';
import Provider from '../../src/Provider';
import UserProfile from './containers/UserProfile.jsx';
import BrowseUsers from './containers/BrowseUsers.jsx';
import Users from './containers/Users.jsx';
import App from './components/App';

// If you specify invalid shape to provider, console errors will try to provided information to fix the problem
// Note that shape is not used when NODE_ENV==='production '

const definition = (
  <Definition>
    <Obj name='users' initial isRequired>
      <Obj name='status' initial isRequired>
        <Bool name='pending' />
        <Err name='error' />
      </Obj>
      <Obj name='content' initial isRequired>
        <Obj many>
          <Str name='id' />
          <Str name='firstName' />
          <Str name='lastName' />
          <Str name='email' />
          <Str name='phone' />
          <Str name='phone' />
          <Numb name='age' />
          <Bool name='single' />
          <Bool name='pending' />
        </Obj>
      </Obj>
    </Obj>
    <Obj name='todosByUser' initial isRequired>
      <Obj name='status' initial isRequired>
        <Bool name='pending' />
        <Err name='error' />
      </Obj>
      <Obj name='content' initial isRequired>
        <Obj many> {/* by user id*/}
          <Obj many> {/* by todo id*/ }
            <Str name='id' />
            <Str name='userId' />
            <Str name='description' />
            <Bool name='done' />
            <Bool name='pending' />
          </Obj>
        </Obj>
      </Obj>
    </Obj>
    <Obj name='selections' initial isRequired>
      <Obj name='user' initial isRequired>
        <Str name='id' />
        <Str name='firstName' />
        <Str name='lastName' />
        <Str name='email' />
        <Str name='phone' />
        <Numb name='age' />
        <Bool name='single' />
        <Bool name='pending' />
      </Obj>
    </Obj>
  </Definition>
);

const Root = () => (
  <Provider
    onChange={(store, lastChange) => {}}
    definition={definition}>
    <Router history={browserHistory}>
      <Route path='/' component={App}>
        <IndexRedirect to='users' />
        <Route path='/users' component={Users}>
          <IndexRoute relative component={BrowseUsers} />
          <Route path=':userId' relative component={UserProfile} />
        </Route>
      </Route>
    </Router>
  </Provider>
  );

ReactDOM.render(<Root />, document.getElementById('app'));