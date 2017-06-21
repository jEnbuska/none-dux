import React from 'react';
import { connect, } from '../../../src';
import TodoListItem from './TodoListItem';

const TodosList = ({ todos, pending, }) => (<div className={pending ? 'disabled-view' : ''}>
  {Object.entries(todos).map(([ k, v, ]) => (
    <TodoListItem
      key={k}
      todo={v} />
    ))}</div>);

export default connect(({ todosByUser, }, { userId, }) => {
  if (todosByUser[userId]) {
    const { pending, ...todos } = todosByUser[userId];
    return { todos, pending, };
  }
  return {};
})(TodosList);