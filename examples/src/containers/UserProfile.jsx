import React from 'react';
import { connect, } from '../../../src';
import Todos from './Todos';
import Input from '../components/Input';
import Button from '../components/Button';
import { modifySelectedUser, clearUserModification, saveUserChanges, } from '../actions/userActions';
import { onUpdateUser, onUserUpdateSuccess, } from '../actions/requestActions';

@connect(({ selections: { user, }, request: { users: { updating, }, }, }) => ({ user, updating, }), { modifySelectedUser, clearUserModification, saveUserChanges, onUpdateUser, onUserUpdateSuccess, })
export default class UserProfile extends React.Component {

  render() {
    const { user, modifySelectedUser, updating, } = this.props;
    const { firstName, lastName, single, age, phone, email, } = user || {};
    return (
      <div className='flex'>
        <div className={updating ? 'disabled-view' : ''}>
          <Input placeholder='firstname' onChange={firstName => modifySelectedUser({ firstName, })} value={firstName} />
          <Input placeholder='lastname' onChange={lastName => modifySelectedUser({ lastName, })} value={lastName} />
          <Input placeholder='age' type='range' min='18' max='80' onChange={age => modifySelectedUser({ age: Number(age), })} value={age} label={'Age: '+ (age || '')} />
          <Input placeholder='phone' type='phone' name='phone' onChange={phone => modifySelectedUser({ phone, })} value={phone} autoComplete='phone' />
          <Input placeholder='email' type='email' onChange={email => modifySelectedUser({ email, })} value={email} autoComplete='email' />
          <Input placeholder='single' type='checkbox' onChange={() => modifySelectedUser({ single: !single, })} checked={single} label={'single'} />
          <Button
            primary
            type='submit'
            text='Update'
            onClick={this.onSaveUserChanges}
            disabled={[ firstName, lastName, phone, email, ].some(exists => !exists)} />
        </div>
        <div>
          <Todos userId={this.props.params.userId} />
        </div>
      </div>
    );
  }

  onSaveUserChanges = () => {
    const { saveUserChanges, onUserUpdateSuccess, onUpdateUser, } = this.props;
    onUpdateUser();
    saveUserChanges().then(onUserUpdateSuccess);
  }

  componentWillUnmount() {
    this.props.clearUserModification();
  }
}