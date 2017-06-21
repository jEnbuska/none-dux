import React from 'react';
import { object, } from 'prop-types';
import { connect, } from '../../../src';
import Div from '../components/Div';
import Input from '../components/Input';
import Button from '../components/Button';
import { removeTodo, toggleTodo, } from '../actions/todoActions';

const TodoListItem = ({ todo: { id, userId, done, description, pending, }, toggleTodo, removeTodo, }) => {
  console.log({toggleTodo})
  return (
    <Div className={'todo-item' + (pending ? ' disabled-view' : '')}>
      <h3 className={done ? 'todo-description-done' : 'todo-description'}>{description}</h3>
      <Input type='checkbox' checked={done} onChange={() => toggleTodo(id, userId)} />
      <Button warn onClick={() => removeTodo(id, userId)}>Remove</Button>
    </Div>
  );
}

TodoListItem.propTypes = {
  todo: object.isRequired,
};

console.log({toggleTodo})

export default connect(undefined, { removeTodo, toggleTodo, })(TodoListItem);
