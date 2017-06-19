import React from 'react';
import { connect, } from '../../../lib';
import { addUser, modifySelectedUser, } from '../actions/userActions';
import { onUpdateUser, onUserUpdateSuccess, } from '../actions/requestActions';
import Input from '../components/Input';
import Button from '../components/Button';
import Form from '../components/Form';

@connect(({ selections: { user, }, }) => ({ user, }), { addUser, modifySelectedUser, onUpdateUser, onUserUpdateSuccess, })
export default class AddUser extends React.Component {

  componentWillMount() {
    this.props.modifySelectedUser({ age: 25, single: false, });
  }

  render() {
    const { user, modifySelectedUser, } = this.props;
    const { firstName, lastName, single, age, phone, email, } = user;
    return (
      <Form className='form' onSubmit={this.onSubmit}>
        <Input placeholder='firstname' onChange={firstName => modifySelectedUser({ firstName, })} value={firstName} autoComplete='firstname' />
        <Input placeholder='lastname' onChange={lastName => modifySelectedUser({ lastName, })} value={lastName} autoComplete='lastname' />
        <Input placeholder='age' type='range' min='18' max='80' onChange={age => modifySelectedUser({ age: Number(age), })} autoComplete='age' value={age} label={'Age: '+ age || ''} />
        <Input placeholder='phone' type='phone' name='phone' onChange={phone => modifySelectedUser({ phone, })} value={phone} autoComplete='phone' />
        <Input placeholder='email' type='email' onChange={email => modifySelectedUser({ email, })} value={email} autoComplete='email' />
        <Input placeholder='single' type='checkbox' onChange={() => modifySelectedUser({ single: !single, })} checked={single} label={'single'} />
        <Button
          primary
          type='submit'
          text='Submit'
          disabled={[ firstName, lastName, phone, email, age, ].some(exists => !exists)} />
      </Form>
    );
  }

  onSubmit = () => {
    const { onUpdateUser, onUserUpdateSuccess, addUser, modifySelectedUser, } = this.props;
    onUpdateUser();
    addUser().then(() => {
      onUserUpdateSuccess();
      modifySelectedUser({ age: 25, single: false, });
    });
  };
}
