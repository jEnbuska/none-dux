import React from 'react';
import Div from './Div';
import Sidebar from './Sidebar';

class App extends React.Component {

  render() {
    return (
      <div>
        <Sidebar />
        <Div style={{ top: 0, position: 'fixed', left: '14%', width: '86%', height: '100%', overflowY: 'scroll', }}>
          {this.props.children}
        </Div>
      </div>
    );
  }

}

export default App;
