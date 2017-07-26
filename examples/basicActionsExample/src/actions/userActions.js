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
      users.content.remove(id);
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
  return async function (store) {
    const { users, todosByUser, } = store;
    await new Promise(res => setTimeout(res, 800));
    let userData = localStorage.getItem('users');
    userData = userData ? JSON.parse(userData) : {};
    let todoData = localStorage.getItem('todosContent');
    todoData = todoData ? JSON.parse(todoData) : {};
    users.setState({ content: userData, status: { pending: false, }, });
    todosByUser.setState({ content: todoData, status: { pending: false, }, });
    users.status.setState({ pending: true, });
    todosByUser.status.setState({ pending: true, });
  };
}