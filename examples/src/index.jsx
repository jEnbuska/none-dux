import 'styles';
import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, browserHistory, IndexRedirect, } from 'react-router';
import { Provider, shapes, } from '../../src';
import UserProfile from './containers/UserProfile.jsx';
import BrowseUsers from './containers/BrowseUsers.jsx';
import Users from './containers/Users.jsx';
import App from './components/App';

const initialState= {
  users: {},
  todosByUser: {},
  selections: { user: {}, },
};

const { spec, any, array, object, number, string, exclusive, isRequired, bool, } = shapes;

// If you specify invalid shape to provider, console errors will try to provided information to fix the problem
// Note that shape is not used when NODE_ENV==='production '

const shape = {
  [spec]: { type: object, exclusive, },
  users: { [spec]: { type: object, isRequired, },
    pending: { [spec]: { type: bool, }, },
    [any]: { [spec]: { type: object, exclusive, }, // users [any] means any key, in this case its userId uuid
      id: { [spec]: { type: string, isRequired, }, },
      firstName: { [spec]: { type: string, isRequired, }, },
      lastName: { [spec]: { type: string, isRequired, }, },
      email: { [spec]: { type: string, }, },
      phone: { [spec]: { type: string, isRequired, }, },
      age: { [spec]: { type: number, }, },
      single: { [spec]: { type: bool, }, },
      pending: { [spec]: { type: bool, }, },
    },
  },
  todosByUser: { [spec]: { type: object, isRequired, },
    pending: { [spec]: { type: bool, }, },
    [any]: { [spec]: { type: object, },
      [any]: { [spec]: { type: object, exclusive, },
        id: { [spec]: { type: string, isRequired, }, },
        userId: { [spec]: { type: string, isRequired, }, },
        description: { [spec]: { type: string, isRequired, }, },
        done: { [spec]: { type: bool, }, },
        pending: { [spec]: { type: bool, }, },
      },
    },
  },
  selections: { [spec]: { type: object, exclusive, },
    user: { [spec]: { type: object, },
      firstName: { [spec]: { type: string, }, },
      lastName: { [spec]: { type: string, }, },
      email: { [spec]: { type: string, }, },
      phone: { [spec]: { type: string, }, },
      age: { [spec]: { type: number, }, },
      single: { [spec]: { type: bool, }, },
    },
  },
};

const Root = () => (
  <Provider
    initialState={initialState}
    onChange={(store, lastChange) => {}}
    shape={shape}>
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