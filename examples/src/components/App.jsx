import React from 'react';
import { Switch, Route, } from 'react-router-dom';
import Todos from './Todos';
import Div from './Div';
import Sidebar from './Sidebar';

const App = () => (
  <div>
    <Sidebar />
    <Div className='app-content-wrapper'>
      <Route path='/todos' component={Todos} />
    </Div>
  </div>
  );

export default App;
