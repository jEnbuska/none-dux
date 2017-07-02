import React from 'react';
import { connect, } from 'react-redux';
import TodoListItem from './TodoListItem';

const TodosList = ({ todos, status, }) => (<div className={status.pending ? 'disabled-view' : ''}>
  {Object.entries(todos).map(([ k, v, ]) => (
    <TodoListItem
      key={k}
      todo={v} />
    ))}</div>);

export default connect(({ todosByUser, }, { userId, }) => {
  const { content, status, } = todosByUser;
  if (content[userId]) {
    return { todos: content[userId], status, };
  }
  return { todos: {}, status, };
})(TodosList);