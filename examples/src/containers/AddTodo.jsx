import React from 'react';
import { string, } from 'prop-types';
import { connect, } from 'none-dux';
import Form from '../components/Form';
import Input from '../components/Input';
import Button from '../components/Button';
import { addTodo, } from '../actions/todoActions';

@connect(undefined, { addTodo, })
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
    this.props.addTodo(this.state.description, this.props.userId);
    this.setState({ description: '', });
  }
}