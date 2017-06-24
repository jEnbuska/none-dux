import uuid from 'uuid/v4';

export function addUser() {
  return function ({ users, selections, todosByUser, }) {
    const id = uuid();
    const { single, ...rest } = selections.user.state;
    const { [id]: newUser, }= users.setState({ [id]: { id, ...rest, single: !!single, pending: true, }, });
    selections.user.setState({ pending: true, });
    return new Promise(res => {
      setTimeout(() => {
        todosByUser.setState({ [id]: {}, });
        selections.user.clearState({});
        newUser.setState({ pending: false, });
        localStorage.setItem('todosByUser', JSON.stringify(todosByUser.state));
        localStorage.setItem('users', JSON.stringify(users.state));
        res();
      }, 800);
    });
  };
}

export function modifySelectedUser(obj) {
  return function ({ selections: { user, }, }) {
    user.setState(obj);
  };
}

export function saveUserChanges() {
  return function ({ selections: { user: selectedUser, }, users, }) {
    const { state, } = selectedUser.setState({ pending: true, });
    const user = users[state.id];
    user.setState(state);
    return new Promise(res => setTimeout(() => {
      user.remove('pending');
      selectedUser.remove('pending');
      localStorage.setItem('users', JSON.stringify(users.state));
      res();
    }, 800
    ));
  };
}

export function clearUserModification() {
  return function ({ selections: { user, }, }) {
    user.clearState({});
  };
}

export function removeUser(id) {
  return function ({ users, }) {
    users[id].setState({ pending: true, });
    return new Promise(res => {
      users[id].removeSelf();
      localStorage.setItem('users', JSON.stringify(users.state));
      res();
    }, 800);
  };
}

export function selectUser(id) {
  return function ({ selections, users: { [id]: user, }, }) {
    selections.setState({ user: user.state, });
  };
}

export function fetchUsers() {
  return function ({ users, todosByUser, }) {
    return new Promise((resolve) => {
      users.setState({ pending: true, });
      todosByUser.setState({ pending: true, });
      setTimeout(() => {
        const userData = JSON.parse(localStorage.getItem('users')) || {};
        users.clearState({ ...userData, pending: false, });
        const todoData = JSON.parse(localStorage.getItem('todosByUser')) || {};
        todosByUser.setState({ ...todoData, pending: false, });
        resolve();
      }, 800);
    });
  };
}