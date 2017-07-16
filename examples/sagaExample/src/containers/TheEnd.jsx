import React from 'react';
import { connect, } from 'react-redux';
import { LOGOUT, } from '../actions/types';
import Button from '../components/Button';

const TheEnd = ({ dispatch, }) => (
  <div>
    <h1>The End</h1>
    <Button warn text='Logout' onClick={() => dispatch({ type: LOGOUT, })} />
  </div>);

export default connect()(TheEnd);