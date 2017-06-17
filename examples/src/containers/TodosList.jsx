import React from 'react';
import { connect, } from '../../../src';
import TodoListItem from './TodoListItem';

const TodosList = ({ todos, userId, }) => (<div>
  {todos.map(todo => (
    <TodoListItem
      key={todo.id}
      userId={userId}
      todo={todo} />
    ))}</div>);

export default connect(({ users, }, { userId, }) => ({ todos: (users[userId] && users[userId].todos) || [], }))(TodosList);