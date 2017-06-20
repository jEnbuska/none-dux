import React from 'react';
import { browserHistory, } from 'react-router';
import { connect, } from 'none-dux';
import * as requestActions from '../actions/requestActions';
import * as userActions from '../actions/userActions';

@connect(({ users, request: { users: { fetching, }, }, }) => ({ users, fetching, }), { ...requestActions, ...userActions, })
export default class Users extends React.Component {

  render() {
    const { fetching, } = this.props;
    return <div className={fetching ? 'disabled-view': ''}>{this.props.children}</div>;
  }

  componentDidMount() {
    const { fetchUsers, setUsers, onFetchUsers, onFetchUsersSuccess, selectUser, onUsersNotFound, } = this.props;
    onFetchUsers();
    fetchUsers()
      .then(data => {
        setUsers(data);
        onFetchUsersSuccess();
        const { params, users, } = this.props;
        const { userId, } = params;
        if (userId) {
          if (!users[userId]) {
            browserHistory.replace('/');
          } else {
            selectUser(userId);
          }
        }
      }).catch(() => onUsersNotFound());
  }

  componentWillReceiveProps({ params: { userId, }, selectUser, users, }) {
    if (userId && userId!==this.props.params.userId && users[userId]) {
      selectUser(userId);
    }
  }
}