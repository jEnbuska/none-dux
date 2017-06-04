import React from 'react';
import ReactDOM from 'react-dom';
import 'styles';
import { BrowserRouter, Route, Switch, } from 'react-router-dom';
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
    <BrowserRouter>
      <Route path='/' component={App} />
    </BrowserRouter>
  </Provider>
  );

ReactDOM.render(<Root />, document.getElementById('app'));