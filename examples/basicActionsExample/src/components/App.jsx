import React from 'react';
import Div from './Div';
import Sidebar from './Sidebar';

const App = ({ children, }) => (
  <div>
    <Sidebar />
    <Div className='app-content-wrapper'>
      {children}
    </Div>
  </div>
  );

export default App;
