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

const User = ({ name, many, ...rest }) => (
  <Obj name={name} many={many} {...rest}>
    {[ 'id', 'firstName', 'lastName', 'email', 'phone', ]
      .map(name => <Str name={name} key={name} />)}
    <Numb name='age' />
    <Bool name='single' />
    <Bool name='pending' />
  </Obj>);

const Status = ({ initial, }) => (
  <Obj name='status' initial={initial} isRequired>
    <Bool name='pending' />
    <Err name='error' />
  </Obj>
);

const definition = (
  <Definition>
    <Obj name='users' initial isRequired>
      <Status initial />
      <Obj name='content' initial isRequired>
        <User many />
      </Obj>
    </Obj>
    <Obj name='todosByUser' initial isRequired>
      <Status initial />
      <Obj name='content' initial isRequired>
        <Obj many> {/* by user id*/}
          <Obj many> {/* by todo id*/ }
            {[ 'id', 'userId', 'description', ]
              .map(name => <Str name={name} key={name} />)}
            <Bool name='done' />
            <Bool name='pending' />
          </Obj>
        </Obj>
      </Obj>
    </Obj>
    <Obj name='selections' initial isRequired>
      <Obj name='user' initial />
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