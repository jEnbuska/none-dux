import React from 'react';
import { connect, } from '../../../src';
import AddTodo from './AddTodo';
import TodoList from './TodosList';

@connect(({ todosByUser, }) => ({ pending: todosByUser.pending, }))
export default class Todos extends React.Component {

  render() {
    const { userId, pending, } = this.props;
    return (
      <div className={pending ? 'disabled-view' : ''}>
        <AddTodo userId={userId} />
        <TodoList userId={userId} />
      </div>
    );
  }
}