import React from 'react';
import propTypes from 'prop-types';
import { connect, } from 'none-dux';
import TodoListItem from './TodoListItem';

const { values, keys, } = Object;
const { func, } = propTypes;

@connect(({ todos, }) => ({ todoIds: keys(todos), }))
export default class TodosList extends React.Component {

  static propTypes = {
    onSelect: func.isRequired,
  };

  render() {
    const { todoIds, onSelect, } = this.props;
    return (<div>
      {todoIds.map(id => (
        <TodoListItem
          key={id}
          id={id} onSelect={onSelect} />
      ))}</div>);
  }
}

