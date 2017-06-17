import React from 'react';
import { browserHistory, } from 'react-router';
import { connect, } from 'none-dux';
import AddUser from './AddUser';
import UserListItem from '../components/UserListItem';
import { removeUser, } from '../actions/userActions';

const { values, } = Object;

@connect(({ users, }) => ({ users, }), { removeUser, })
export default class BrowserUsers extends React.Component {

  render() {
    const { users, removeUser, } = this.props;
    return (
      <div>
        <AddUser />
        {values(users).map(user => (
          <UserListItem key={user.id} {...user} onSelectUser={this.onSelectUser} onRemoveUser={removeUser} />
      ))}
      </div>
    );
  }

  onSelectUser = (id) => {
    browserHistory.push('/users/'+id);
  }
}