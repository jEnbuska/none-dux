import React from 'react';
import { string, func, } from 'prop-types';
import { connect, } from '../../../lib';
import Div from '../components/Div';
import Input from '../components/Input';
import Button from '../components/Button';
import { removeTodo, toggleTodo, } from '../actions/todoActions';

@connect(({ todos, }, { id, }) => ({ todo: todos[id], }), { removeTodo, toggleTodo, })
export default class TodoListItem extends React.Component {

  static propTypes = {
    id: string.isRequired,
    onSelect: func.isRequired,
  };

  render() {
    const { todo, onSelect, removeTodo, toggleTodo, } = this.props;
    const { id, done, description, } = todo;
    return (
      <Div style={{ display: 'flex', flexDirection: 'column', }}>
        <Div onClick={() => onSelect(id)} style={{ cursor: 'pointer', margin: '.3em', display: 'flex', justifyContent: 'space-around', alignItems: 'center'}}>
          <h3 style={{ marginTop: '.7em', overflow: 'hidden', textAlign: 'center', textDecoration: (done ? 'line-through' : 'none'), }}>{description}</h3>
          <Input type='checkbox' checked={done} onChange={() => toggleTodo(id)} />
          <Button warn onClick={() => removeTodo(id)}>Remove</Button>
        </Div>
      </Div>
    );
  }
}