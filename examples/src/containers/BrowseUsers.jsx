import React from 'react';
import { browserHistory, } from 'react-router';
import { connect, } from '../../../src';
import AddUser from './AddUser';
import UserListItem from '../components/UserListItem';
import { removeUser, } from '../actions/userActions';

const { values, } = Object;

@connect(({ users, }) => ({ ...users, }), { removeUser, })
export default class BrowseUsers extends React.Component {

  render() {
    const { content, status, removeUser, } = this.props;
    return (
      <div className={status.pending ? 'disabled-view': ''}>
        <AddUser />
        <div>
          {values(content).map(user => (
            <UserListItem key={user.id} {...user} onSelectUser={this.onSelectUser} onRemoveUser={removeUser} />
      ))}
        </div>
      </div>
    );
  }

  onSelectUser = (id) => {
    browserHistory.push('/users/'+id);
  }
}