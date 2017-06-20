import 'styles';
import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, browserHistory, IndexRedirect, } from 'react-router';
import { Provider, shapes, } from 'none-dux';
import UserProfile from './containers/UserProfile.jsx';
import BrowserUsers from './containers/BrowserUsers.jsx';
import Users from './containers/Users.jsx';
import App from './components/App';

/* just an experiment to see how how this library would work with deep structured data and arrays.
* I dont recommend using this library this way*/

const initialState= {
  selections: { user: {}, },
  users: {},
  request: { users: {}, todos: {}, },
};

const { spec, any, array, object, number, string, exclusive, isRequired, bool, } = shapes;

// If you specify invalid shape to provider, console errors will try to provided information to fix the problem
// Note that shape is not used when NODE_ENV==='production '

const shape = {
  [spec]: { type: object, exclusive, },
  users: { [spec]: { type: object, isRequired, },
    [any]: { [spec]: { type: object, exclusive, }, // users [any] means any key, in this case its userId uuid
      id: { [spec]: { type: string, isRequired, }, },
      firstName: { [spec]: { type: string, isRequired, }, },
      lastName: { [spec]: { type: string, isRequired, }, },
      email: { [spec]: { type: string, }, },
      phone: { [spec]: { type: string, isRequired, }, },
      age: { [spec]: { type: number, }, },
      single: { [spec]: { type: bool, }, },
      todos: { [spec]: { type: array, isRequired, },
        [any]: { [spec]: { type: object, isRequired, exclusive, },
          id: { [spec]: { type: string, isRequired, }, },
          userId: { [spec]: { type: string, isRequired, }, },
          description: { [spec]: { type: string, isRequired, }, },
          done: { [spec]: { type: bool, }, },
        },
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
  request: { [spec]: { type: object, },
    users: { [spec]: { type: object, isRequired, }, },
    todos: { [spec]: { type: object, isRequired, }, },
  },
};

function onChange(store, lastChange) {
  if (lastChange.target[1]==='users') {
    localStorage.setItem('users', JSON.stringify(store.state.users));
  }
}

const Root = () => (
  <Provider
    initialState={initialState}
    onChange={onChange}
    shape={shape}>
    <Router history={browserHistory}>
      <Route path='/' component={App}>
        <IndexRedirect to='users' />
        <Route path='/users' component={Users}>
          <IndexRoute relative component={BrowserUsers} />
          <Route path=':userId' relative component={UserProfile} />
        </Route>
      </Route>
    </Router>
  </Provider>
  );

ReactDOM.render(<Root />, document.getElementById('app'));