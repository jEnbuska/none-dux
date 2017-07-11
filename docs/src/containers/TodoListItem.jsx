import React from 'react';
import { object, } from 'prop-types';
import { connect, } from 'react-redux';
import Div from '../components/Div';
import Input from '../components/Input';
import Button from '../components/Button';
import { removeTodo, toggleTodo, } from '../actions/todoActions';

const TodoListItem = ({ todo: { id, userId, done, description, pending, }, toggleTodo, removeTodo, }) => (
  <Div className={'todo-item' + (pending ? ' disabled-view' : '')}>
    <h3 className={done ? 'todo-description-done' : 'todo-description'}>{description}</h3>
    <Input type='checkbox' checked={done} onChange={() => toggleTodo(id, userId)} />
    <Button warn onClick={() => removeTodo(id, userId)}>Remove</Button>
  </Div>
  );

TodoListItem.propTypes = {
  todo: object.isRequired,
};

export default connect(undefined, { removeTodo, toggleTodo, })(TodoListItem);
