import React from 'react';
import { string, } from 'prop-types';
import { connect, } from '../../../lib';
import Form from '../components/Form';
import Input from '../components/Input';
import Button from '../components/Button';
import { addTodo, } from '../actions/todoActions';
import { onTodoUpdate, onTodoUpdateSuccess, } from '../actions/requestActions';

@connect(undefined, { addTodo, onTodoUpdate, onTodoUpdateSuccess, })
export default class AddTodo extends React.Component {

  static propTypes = {
    userId: string.isRequired,
  };

  state = { description: '', };

  render() {
    const { description, } = this.state;
    return (
      <Form onSubmit={this.onSubmit}>
        <Input placeholder='description' onChange={description => this.setState({ description, })} value={description} />
        <Button
          primary
          type='submit'
          text='Add'
          disabled={!description} />
      </Form>
    );
  }

  onSubmit = () => {
    const { userId, addTodo, onTodoUpdate, onTodoUpdateSuccess, } = this.props;
    onTodoUpdate();
    addTodo(this.state.description, userId).then(onTodoUpdateSuccess);
    this.setState({ description: '', });
  }
}