import uuid from 'uuid/v4';

export function addTodo(description, userId) {
  return function ({ users, }) {
    const id = uuid();
    const user = users[userId];
    const { todos, } = user.state;
    const { state, prevState, } = user.setState({ todos: [ ...todos, { id, userId, description, done: false, }, ], });
    return new Promise(res => setTimeout(() => res({ status: 201, }), 800));
  };
}

export function toggleTodo(id, userId) {
  return function ({ users, }) {
    const user = users[userId];
    const todo = user.todos.getChildren().find(({ state, }) => state.id===id);
    const { state, prevState, } = todo.setState({ done: !todo.state.done, });
    return new Promise(res => setTimeout(() => res({ status: 201, }), 800));
  };
}

export function removeTodo(id, userId) {
  return function ({ users, }) {
    const { todos, } = users[userId];
    const todo = todos.getChildren().find(({ state, }) => state.id===id);
    const { prevState, } = todo.remove();
    return new Promise(res => setTimeout(() => res({ status: 201, }), 800));
  };
}