import { shape, } from '../../../src';

const { types, } = shape;
const { string, strict, bool, } = types;

export default {
  ...strict.isRequired,
  blockContentInteraction: bool,
  auth: {
    ...strict.isRequired,
    token: string,
    error: bool,
    pending: bool,
    user: {
      ...strict.isRequired,
      ...string.many('firstname', 'lastname', 'email', 'zip', 'city', 'address', 'phone', 'token'),
      termsAccepted: bool,
    },
  },
};