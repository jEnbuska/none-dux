import React from 'react';
import ReactDOM from 'react-dom';
import 'styles';
import { Router, Route, IndexRoute, browserHistory, } from 'react-router';
import Todos from './components/Todos';
import { Provider, shapes, } from '../../src';
import App from './components/App';

function getInitialState() {
  const state = JSON.parse(localStorage.getItem('state'));
  if (state && state.todos) {
    return state;
  }
  return { todos: {}, };
}

const { TYPE, TARGET_ANY, VALIDATE, } = shapes;
const shape = {
  todos: { [TYPE]: 'object',
    [TARGET_ANY]: {
      id: { [TYPE]: 'string', },
      description: { [TYPE]: 'string', },
      done: { [TYPE]: [ 'boolean', 'undefined', ], },
    },
  },
};

const Root = () => (
  <Provider
    initialState={getInitialState()}
    shape={shape}>
    <Router history={browserHistory}>
      <Route path='/' component={App}>
        <IndexRoute component={Todos} />
      </Route>
    </Router>
  </Provider>
  );

ReactDOM.render(<Root />, document.getElementById('app'));