import React from 'react';
import ReactDOM from 'react-dom';
import { IndexRedirect, Router, Route, browserHistory, } from 'react-router';
import { Provider, } from 'none-dux';
import App from './components/App';
import Todos from './components/Todos';

function getInitialState() {
  const state = JSON.parse(localStorage.getItem('state_todos'));
  if (state && Object.keys(state).length) {
    return state;
  }
  return { todos: {}, };
}
const Root = () => (
  <Provider initialState={getInitialState()} onChange={onStateChanged}>
    <Router history={browserHistory}>
      <Route path='/' component={App}>
        <IndexRedirect to='todos' />
        <Route path='todos(/:todoId)' component={Todos} />
      </Route>
    </Router>
  </Provider>
  );

ReactDOM.render(<Root />, document.getElementById('app'));

function onStateChanged(nextState) {
  localStorage.setItem('state', JSON.stringify(nextState));
}