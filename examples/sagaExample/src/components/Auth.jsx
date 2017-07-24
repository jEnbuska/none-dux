import React from 'react';
import { Switch, Route, Redirect, } from 'react-router-dom';
import { connect, } from 'react-redux';
import Login from '../containers/Login';
import Signup from '../containers/Signup';

const Auth = ({ auth, }) => {
  if (auth.token) {
    return <Redirect to='/' />;
  }
  return (
    <Switch>
      <Route exact path='/auth' component={Login} />
      <Route exact path='/auth/signup' component={Signup} />
    </Switch>
  );
};

export default connect(({ auth, }) => ({ auth, }))(Auth);