import 'babel-polyfill';
import 'styles';
import React from 'react';
import { Provider, } from 'react-redux';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, } from 'react-router-dom';
import { applyMiddleware, createStore, } from 'redux';
import createSagaMiddleware from 'redux-saga';
import nonedux, { shape, } from '../../../src';
import init from './sagas';
import validators from './validators';
import App from './containers/App';

const initialState= {
  auth: { token: null, user: {}, },
  blockContentInteraction: false,
};

const { reducer, middlewares, subject, } = nonedux(initialState, true); // true for saga
middlewares.push(shape.validatorMiddleware(subject, validators));
const sagaMiddleware = createSagaMiddleware();
middlewares.push(sagaMiddleware);

const createStoreWithMiddleware = applyMiddleware(...middlewares)(createStore);
const store = createStoreWithMiddleware(reducer, window.devToolsExtension && window.devToolsExtension());
sagaMiddleware.run(init.bind(subject));

const Root = () => (
  <Provider store={store}>
    <BrowserRouter >
      <Route path='/' component={App} />
    </BrowserRouter>
  </Provider>
  );

ReactDOM.render(<Root />, document.getElementById('app'));