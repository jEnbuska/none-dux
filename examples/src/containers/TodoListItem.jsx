import React from 'react';
import { string, object, } from 'prop-types';
import { connect, } from 'none-dux';
import Div from '../components/Div';
import Input from '../components/Input';
import Button from '../components/Button';
import { removeTodo, toggleTodo, } from '../actions/todoActions';
import { onTodoUpdate, onTodoUpdateSuccess, } from '../actions/requestActions';

@connect(undefined, { removeTodo, toggleTodo, onTodoUpdate, onTodoUpdateSuccess, })
export default class TodoListItem extends React.Component {

  static propTypes = {
    userId: string.isRequired,
    todo: object.isRequired,
  };

  render() {
    const { id, done, description, } = this.props.todo;
    return (
      <Div className='todo-item'>
        <h3 className={done ? 'todo-description-done' : 'todo-description'}>{description}</h3>
        <Input type='checkbox' checked={done} onChange={() => this.onToggleTodo(id)} />
        <Button warn onClick={() => this.onRemoveTodo(id)}>Remove</Button>
      </Div>
    );
  }

  onRemoveTodo(id) {
    const { userId, removeTodo, onTodoUpdate, onTodoUpdateSuccess, } = this.props;
    onTodoUpdate();
    removeTodo(id, userId).then(onTodoUpdateSuccess);
  };

  onToggleTodo(id){
    const { userId, toggleTodo, onTodoUpdate, onTodoUpdateSuccess, } = this.props;
    onTodoUpdate(id, userId);
    toggleTodo(id, userId).then(() => onTodoUpdateSuccess()); // in getting lazy
  }
}