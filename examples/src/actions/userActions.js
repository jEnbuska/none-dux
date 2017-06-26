import uuid from 'uuid/v4';

export function addUser() {
  return function ({ users, selections, todosByUser, }) {
    const id = uuid();
    const { single, ...rest } = selections.user.state;
    const { [id]: newUser, }= users.content.setState({ [id]: { id, ...rest, single: !!single, pending: true, }, });
    selections.user.setState({ pending: true, });
    return new Promise(res => {
      setTimeout(() => {
        todosByUser.content.setState({ [id]: {}, });
        selections.user.clearState({});
        newUser.setState({ pending: false, });
        localStorage.setItem('todosContent', JSON.stringify(todosByUser.content.state));
        localStorage.setItem('users', JSON.stringify(users.content.state));
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
    const user = users.content[state.id];
    user.setState(state);
    return new Promise(res => setTimeout(() => {
      user.remove('pending');
      selectedUser.remove('pending');
      localStorage.setItem('users', JSON.stringify(users.content.state));
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
    users.content[id].setState({ pending: true, });
    return new Promise(res => {
      users.content[id].removeSelf();
      localStorage.setItem('users', JSON.stringify(users.content.state));
      res();
    }, 800);
  };
}

export function selectUser(id) {
  return function ({ selections, users: { content, }, }) {
    selections.setState({ user: content[id].state, });
  };
}

export function fetchUsers() {
  return function (store) {
    const { users, todosByUser, } = store;
    return new Promise((resolve) => {
      users.status.setState({ pending: true, });
      todosByUser.status.setState({ pending: true, });
      setTimeout(() => {
        store.singleUpdate(() => {
          users.singleUpdate(({ content, status, }) => {
            const userData = JSON.parse(localStorage.getItem('users')) || {};
            content.clearState(userData);
            status.setState({ pending: false, });
          });
          todosByUser.singleUpdate(({ content, status, }) => {
            const todoData = JSON.parse(localStorage.getItem('todosContent')) || {};
            content.clearState(todoData);
            status.setState({ pending: false, });
          });
        });
        resolve();
      }, 800);
    });
  };
}