import React from 'react';
import { connect, } from '../../../src';
import AddTodo from './AddTodo';
import TodoList from './TodosList';

@connect(({ todosByUser, }) => ({ status: todosByUser, }))
export default class Todos extends React.Component {

  render() {
    const { userId, status, } = this.props;
    return (
      <div className={status.pending ? 'disabled-view' : ''}>
        <AddTodo userId={userId} />
        <TodoList userId={userId} />
      </div>
    );
  }
}