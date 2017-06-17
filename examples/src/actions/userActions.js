import uuid from 'uuid/v4';

export function addUser() {
  return function ({ users, selections: { user, }, }) {
    const id = uuid();
    users.setState({ [id]: { id, ...user.state, todos: [], }, });
    user.clearState({ });
    return new Promise(res => setTimeout(() => res(), 800));
  };
}

export function modifySelectedUser(obj) {
  return function ({ selections: { user, }, }) {
    user.setState(obj);
  };
}

export function saveUserChanges() {
  return function ({ selections: { user: selectedUser, }, users, }) {
    const { id, todos, ...rest } = selectedUser.state;
    const user = users[id];
    user.setState({ ...rest, });
    return new Promise(res => setTimeout(() => res(), 800));
  };
}

export function clearUserModification() {
  return function ({ selections: { user, }, }) {
    user.clearState({});
  };
}

export function removeUser(id) {
  return function ({ users: { [id]: user, }, }) {
    user.remove();
  };
}

export function selectUser(id) {
  return function ({ selections, users: { [id]: user, }, }) {
    selections.setState({ user: user.state, });
  };
}

export function fetchUsers() {
  return function () {
    return new Promise((resolve, reject) => {
      const users = JSON.parse(localStorage.getItem('users'));
      setTimeout(() => users ? resolve(users) : reject(), 1500);
    });
  };
}

export function setUsers(users) {
  return function (store) {
    store.setState({ users, });
  };
}