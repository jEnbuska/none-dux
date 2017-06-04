import uuid from 'uuid/v4';

export function addTodo(description) {
  return function ({ todos, }) {
    const id = uuid();
    todos.setState({ [id]: { id, description, done: false, }, });
  };
}

export function toggleTodo(id) {
  return function ({ todos: { [id]: todo, }, }) {
    todo.setState({ done: !todo.state.done, });
  };
}
export function removeTodo(id) {
  return function ({ todos: { [id]: todo, }, }) {
    todo.remove();
  };
}