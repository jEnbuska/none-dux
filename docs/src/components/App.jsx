import React from 'react';
import Div from './Div';
import Sidebar from './Sidebar';

const App = ({ children, }) => (
  <div>
    <Sidebar />
    <Div className='app-content-wrapper'>
      React app
    </Div>
  </div>
  );

export default App;
