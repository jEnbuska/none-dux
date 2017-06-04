import React from 'react';
import { connect, } from 'none-dux';
import TodoListItem from './TodoListItem';

const { keys, } = Object;

const Todos = ({ todoIds, }) => {
  return (<div>
    {todoIds.map(id => (
      <TodoListItem
        key={id}
        id={id} />
    ))}</div>);
};

export default connect(({ todos, }) => ({ todoIds: keys(todos), }))(Todos);