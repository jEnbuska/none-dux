import React from 'react';
import { connect, } from 'react-redux';
import { addUser, modifySelectedUser, } from '../actions/userActions';
import Input from '../components/Input';
import Button from '../components/Button';
import Form from '../components/Form';

const AddUser = ({ user: { firstName, lastName, single, age, phone, email, pending, }, modifySelectedUser, addUser, }) => (
  <Form className={'form' + (pending ? ' disabled-view' : '')} onSubmit={addUser}>
    <Input
      placeholder='firstname'
      onChange={firstName => modifySelectedUser({ firstName, })}
      value={firstName}
      autoComplete='firstname' />
    <Input
      placeholder='lastname'
      onChange={lastName => modifySelectedUser({ lastName, })}
      value={lastName}
      autoComplete='lastname' />
    <Input
      placeholder='age'
      type='range'
      min='18'
      max='80'
      onChange={age => modifySelectedUser({ age: Number(age), })}
      autoComplete='age'
      value={age}
      label={age ? ('Age: '+ age) : ('Select age')} />
    <Input
      placeholder='phone'
      type='phone'
      name='phone'
      onChange={phone => modifySelectedUser({ phone, })}
      value={phone}
      autoComplete='phone' />
    <Input
      placeholder='email'
      type='email' onChange={email => modifySelectedUser({ email, })}
      value={email}
      autoComplete='email' />
    <Input
      placeholder='single'
      type='checkbox'
      onChange={() => modifySelectedUser({ single: !single, })}
      checked={single}
      label={'single'} />
    <Button
      primary
      type='submit'
      text='Submit'
      disabled={[ firstName, lastName, phone, email, age, ].some(exists => !exists)} />
  </Form>
);

export default connect(({ selections: { user, }, }) => ({ user, }), { addUser, modifySelectedUser, })(AddUser);