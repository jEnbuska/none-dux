import React from 'react';
import { browserHistory, } from 'react-router';
import { connect, } from 'react-redux';
import * as userActions from '../actions/userActions';

@connect(({ users, }) => ({ ...users, }), { ...userActions, })
export default class Users extends React.Component {

  render() {
    return <div>{this.props.children}</div>;
  }

  componentDidMount() {
    const { fetchUsers, selectUser, } = this.props;
    fetchUsers()
      .then(() => {
        const { params, content, } = this.props;
        const { userId, } = params;
        if (userId) {
          if (content[userId]) {
            selectUser(userId);
          } else {
            browserHistory.replace('/');
          }
        }
      });
  }

  componentWillReceiveProps({ params: { userId, }, selectUser, content, }) {
    if (userId && userId!==this.props.params.userId && content[userId]) {
      selectUser(userId);
    }
  }
}