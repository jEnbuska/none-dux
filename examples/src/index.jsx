import 'styles';
import React from 'react';
import { Provider, } from 'react-redux';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, browserHistory, IndexRedirect, } from 'react-router';
import { applyMiddleware, createStore, } from 'redux';
import nonedux, { shape, } from '../../src';
import validators from './validators';
import UserProfile from './containers/UserProfile.jsx';
import BrowseUsers from './containers/BrowseUsers.jsx';
import Users from './containers/Users.jsx';
import App from './components/App';

const initialState= {
  users: { content: {}, status: {}, },
  todosByUser: { content: {}, status: {}, },
  selections: { user: {}, },
};

const { reducer, middlewares, subject, } = nonedux(initialState);

const createStoreWithMiddleware = applyMiddleware(...middlewares, shape.validatorMiddleware(subject, validators))(createStore);
const store = createStoreWithMiddleware(reducer, window.devToolsExtension && window.devToolsExtension());

const Root = () => (
  <Provider store={store}>
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