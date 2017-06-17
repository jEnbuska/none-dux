import React from 'react';
import { func, string, } from 'prop-types';
import Div from './Div';
import Button from './Button';

const UserListItem = ({ id, firstName, lastName, email, phone, onSelectUser, onRemoveUser, }) => (
  <Div>
    <div className='flex'>
      <Div>{firstName}</Div>
      <Div>{lastName}</Div>
      <Div>{phone}</Div>
      <Div>{email}</Div>
    </div>
    <Button primary onClick={() => onSelectUser(id)}>Edit</Button>
    <Button warn onClick={() => onRemoveUser(id)}>Remove</Button>
  </Div>
);

UserListItem.propTypes = {
  firstName: string.isRequired,
  lastName: string.isRequired,
  onSelectUser: func.isRequired,
  onRemoveUser: func.isRequired,
  email: string.isRequired,
  phone: string.isRequired,
};

export default UserListItem;