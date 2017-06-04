import React from 'react';
import propTypes from 'prop-types';
import { connect, } from '../../../lib';
import * as todoActions from '../actions/todoActions';
import Div from '../components/Div';
import Input from '../components/Input';
import Button from '../components/Button';

const { string, func, } = propTypes;

class AddTodo extends React.Component {

  static propTypes = {
    unSelect: func,
    selected: string,
  };

  state = {
    description: '',
  };

  render() {
    const { description, } = this.state;
    return (
      <Div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', }}>
        <Input onChange={description => this.setState({ description, })} value={description} />
        <Button primary disabled={!description} onClick={this.onSubmit}>OK</Button>
      </Div>
    );
  }

  onSubmit = () => {
    const { unSelect, addTodo, } = this.props;
    addTodo(this.state.description);
    unSelect();
  }
}
export default connect(({ todos, }, { selected, }) => ({ todo: todos[selected], }), { ...todoActions, })(AddTodo)