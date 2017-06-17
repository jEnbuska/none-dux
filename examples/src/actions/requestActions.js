export function onFetchUsers() {
  return function ({ request: { users, }, }) {
    users.setState({ fetching: true, });
  };
}
export function onFetchUsersSuccess() {
  return function ({ request: { users, }, }) {
    users.setState({ fetching: false, });
  };
}

export function onTodoUpdate() {
  return function ({ request: { todos, }, }) {
    todos.setState({ updating: true, });
  };
}

export function onTodoUpdateSuccess() {
  return function ({ request: { todos, }, }) {
    todos.setState({ updating: false, });
  };
}

export function onUpdateUser() {
  return function ({ request: { users, }, }) {
    users.setState({ updating: true, });
  };
}

export function onUserUpdateSuccess() {
  return function ({ request: { users, }, }) {
    users.setState({ updating: false, });
  };
}