import 'styles';
import React from 'react';
import { Provider, } from 'react-redux';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, browserHistory, IndexRedirect, } from 'react-router';
import { applyMiddleware, createStore, } from 'redux';
import nonedux, { shapes, } from '../../src';
import UserProfile from './containers/UserProfile.jsx';
import BrowseUsers from './containers/BrowseUsers.jsx';
import Users from './containers/Users.jsx';
import App from './components/App';

const initialState= {
  users: { content: {}, status: {}, },
  todosByUser: { content: {}, status: {}, },
  selections: { user: {}, },
};

const { spec, anyKey, anyValue, object, number, string, exclusive, isRequired, bool, } = shapes;

// If you specify invalid shape to provider, console errors will try to provided information to fix the problem
// Note that shape is not used when NODE_ENV==='production '

const shape = {
  [spec]: { object, exclusive, },
  users: { [spec]: { object, isRequired, },
    status: { [spec]: { object, isRequired, },
      pending: { [spec]: { bool, }, },
      error: { [spec]: { anyValue, }, },
    },
    content: { [spec]: { object, isRequired, },
      [anyKey]: { [spec]: { object, exclusive, }, // users [anyKey] means any key, in this case its userId uuid
        id: { [spec]: { string, isRequired, }, },
        firstName: { [spec]: { string, isRequired, }, },
        lastName: { [spec]: { string, isRequired, }, },
        email: { [spec]: { string, }, },
        phone: { [spec]: { string, isRequired, }, },
        age: { [spec]: { number, }, },
        single: { [spec]: { bool, }, },
        pending: { [spec]: { bool, }, },
      },
    },

  },
  todosByUser: {
    [spec]: { object, isRequired, exclusive, },
    status: {
      [spec]: { object, isRequired, exclusive, },
      pending: { [spec]: { bool, }, },
      error: { [spec]: { anyValue, }, },
    },
    content: {
      [spec]: { object, isRequired, },
      [anyKey]: {
        [spec]: { object, },
        [anyKey]: {
          [spec]: { object, exclusive, },
          id: { [spec]: { string, isRequired, }, },
          userId: { [spec]: { string, isRequired, }, },
          description: { [spec]: { string, isRequired, }, },
          done: { [spec]: { bool, }, },
          pending: { [spec]: { bool, }, },
        },
      },
    },
  },
  selections: { [spec]: { object, exclusive, },
    user: { [spec]: { object, },
      firstName: { [spec]: { string, }, },
      lastName: { [spec]: { string, }, },
      email: { [spec]: { string, }, },
      phone: { [spec]: { string, }, },
      age: { [spec]: { number, }, },
      single: { [spec]: { bool, }, },
    },
  },
};

const { reducer, thunk, } = nonedux(initialState, shape);
const createStoreWithMiddleware = applyMiddleware(...[ thunk, ])(createStore);
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