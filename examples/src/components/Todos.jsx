import React from 'react';
import AddTodo from '../containers/AddTodo';
import TodosList from '../containers/TodosList';

const Todos = () => {
  console.log('todos')
  return (
    <div>
      <AddTodo />
      <TodosList />
    </div>);
}
export default Todos;