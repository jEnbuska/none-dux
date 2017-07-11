import React from 'react';
import { Switch, Route, } from 'react-router-dom';
import Home from './Home';
import Example from './Example';

const App = () => (
  <Switch>
    <Route exact path='/' component={Home} />
    <Route exact path='/example' component={Example} />
  </Switch>
  );

export default App;
