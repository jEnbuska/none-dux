import uuid from 'uuid/v4';

export function addTodo(description, userId) {
  return function ({ todosByUser: { content, }, }) {
    const id = uuid();
    const usersTodos = content[userId];
    const { [id]: todo, } = usersTodos.setState({ [id]: { id, userId, description, done: false, pending: true, }, });
    return new Promise(res => setTimeout(() => {
      todo.remove('pending');
      localStorage.setItem('todosContent', JSON.stringify(content.state));
      res();
    }, 800));
  };
}

export function toggleTodo(id, userId) {
  return function ({ todosByUser: { content, }, }) {
    const todo = content[userId][id];
    todo.setState({ done: !todo.state.done, pending: true, });
    return new Promise(res => setTimeout(() => {
      todo.remove('pending');
      localStorage.setItem('todosContent', JSON.stringify(content.state));
      res();
    }, 800));
  };
}

export function removeTodo(id, userId) {
  return function ({ todosByUser: { content, }, }) {
    const usersTodos = content[userId];
    usersTodos[id].setState({ pending: true, });
    return new Promise(res => setTimeout(() => {
      usersTodos.remove(id);
      localStorage.setItem('todosContent', JSON.stringify(content.state));
      res();
    }, 800));
  };
}