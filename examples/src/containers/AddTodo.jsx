import React from 'react';
import { connect, } from '../../../src';
import { addTodo, } from '../actions/todoActions';
import Input from '../components/Input';
import Button from '../components/Button';
import Form from '../components/Form';

@connect(({ todos, }, { selected, }) => ({ todo: todos[selected], }), { addTodo, })
export default class AddTodo extends React.Component {

  state = {
    description: '',
  };

  render() {
    const { description, } = this.state;
    return (
      <Form className='create-todo-form' onSubmit={this.onSubmit}>
        <Input onChange={description => this.setState({ description, })} value={description} />
        <Button primary type='submit' disabled={!description}>OK</Button>
      </Form>
    );
  }

  onSubmit = () => {
    this.props.addTodo(this.state.description);
    this.setState({ description: '', });
  }
}
