import React from 'react';
import ReactDOM from 'react-dom';
import 'styles';
import { Router, Route, IndexRoute, browserHistory, } from 'react-router';
import Todos from './components/Todos';
import { Provider, } from '../../src';
import App from './components/App';

function getInitialState() {
  const state = JSON.parse(localStorage.getItem('state'));
  if (state && state.todos) {
    return state;
  }
  return { todos: {}, };
}

const Root = () => (
  <Provider
    initialState={getInitialState()}
    onChange={({ state, }) => localStorage.setItem('state', JSON.stringify(state))}>
    <Router history={browserHistory}>
      <Route path='/' component={App}>
        <IndexRoute component={Todos} />
      </Route>
    </Router>
  </Provider>
  );

ReactDOM.render(<Root />, document.getElementById('app'));