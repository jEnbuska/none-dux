import React from 'react';
import { string, } from 'prop-types';
import { connect, } from '../../../lib';
import AddTodo from './AddTodo';
import TodoList from './TodosList';

@connect(({ users, request: { todos: { updating, }, }, }) => ({ users, updating, }),)
export default class Todos extends React.Component {

  static propTypes = {
    userId: string.isRequired,
  }

  render() {
    const {userId, updating } = this.props;
    return (
      <div className={updating ? 'disabled-view' : ''}>
        <AddTodo userId={userId}/>
        <TodoList userId={userId}/>
      </div>
    );
  }
};