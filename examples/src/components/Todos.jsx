import React from 'react';
import { connect, } from 'none-dux';
import AddTodo from '../containers/AddTodo';
import TodosList from '../containers/TodosList';

export default class Todos extends React.Component {

  state = { selected: '', };

  render() {
    return (
      <div>
        <AddTodo selected={this.state.selected} unSelect={() => this.setState({ selected: '', })} />
        <TodosList onSelect={selected => this.setState({ selected, })} />
      </div>
    );
  }
}