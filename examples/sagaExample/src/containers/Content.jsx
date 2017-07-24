import React from 'react';
import { connect, } from 'react-redux';
import { Switch, Route, Redirect, } from 'react-router-dom';
import Terms from '../containers/Terms';
import TheEnd from './TheEnd';

class Content extends React.Component {

  render() {
    const { auth, } = this.props;
    if (!auth.token) {
      return <Redirect to='/auth' />;
    }
    return (
      <div>
        {!auth.user.termsAccepted && <Terms />}
        <Switch>
          <Route to='/' component={TheEnd} />
        </Switch>
      </div>
    );
  }
}
export default connect(({ auth, }) => ({ auth, }))(Content);