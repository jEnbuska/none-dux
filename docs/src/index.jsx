import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './components/App';

console.log('should log3');
const initialState= {
  users: { content: {}, status: {}, },
  todosByUser: { content: {}, status: {}, },
  selections: { user: {}, },
};

//const { reducer, middlewares, subject, } = nonedux(initialState);

//const createStoreWithMiddleware = applyMiddleware(...middlewares, shape.validatorMiddleware(subject, validators))(createStore);
//const store = createStoreWithMiddleware(reducer, window.devToolsExtension && window.devToolsExtension());


ReactDOM.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  document.getElementById('app'),
);