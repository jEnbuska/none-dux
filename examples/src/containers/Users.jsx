import React from 'react';
import { browserHistory, } from 'react-router';
import { connect, } from '../../../src/index';
import { onFetchUsers, onFetchUsersSuccess, } from '../actions/requestActions';
import { fetchUsers, setUsers, selectUser, } from '../actions/userActions';

@connect(({ users, request: { users: { fetching, }, }, }) => ({ users, fetching, }), { fetchUsers, onFetchUsers, onFetchUsersSuccess, setUsers, selectUser, })
export default class Users extends React.Component {

  render() {
    const { fetching, } = this.props;
    return <div className={fetching ? 'disabled-view': ''}>{this.props.children}</div>;
  }

  componentDidMount() {
    const { fetchUsers, setUsers, onFetchUsers, onFetchUsersSuccess, selectUser, } = this.props;
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
      }).catch(() => { /* no previous state in cache*/ });
  }

  componentWillReceiveProps({ params: { userId, }, selectUser, users, }) {
    if (userId && userId!==this.props.params.userId && users[userId]) {
      selectUser(userId);
    }
  }
}