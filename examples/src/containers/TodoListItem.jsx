import React from 'react';
import { string, } from 'prop-types';
import { connect, } from '../../../src';
import Div from '../components/Div';
import Input from '../components/Input';
import Button from '../components/Button';
import { removeTodo, toggleTodo, } from '../actions/todoActions';

const TodoListItem = ({ todo, removeTodo, toggleTodo, }) => {
  const { id, done, description, } = todo;
  console.log('list')
  return (
    <Div className='todo-item'>
      <h3 className={done ? 'todo-description-done' : 'todo-description'}>{description}</h3>
      <Input type='checkbox' checked={done} onChange={() => toggleTodo(id)} />
      <Button warn onClick={() => removeTodo(id)}>Remove</Button>
    </Div>
  );
};

TodoListItem.propTypes = {
  id: string.isRequired,
};

export default connect(({ todos, }, { id, }) => ({ todo: todos[id], }), { removeTodo, toggleTodo, })(TodoListItem);
