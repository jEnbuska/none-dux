import { shape, } from 'none-dux';

const { types, any, } = shape;
const { string, strict, number, bool, isRequired, } = types;

export default {
  ...strict.isRequired,
  users: {
    ...strict.isRequired,
    content: {
      ...isRequired.strict,
      [any]: {
        id: string.isRequired,
        ...string.isRequired.many('firstName', 'lastName', 'email'),
        age: number.isRequired,
        single: bool,
      },
      pending: bool,
    },
    status: {
      ...isRequired.strict,
      pending: bool,
      error: bool,
    },
  },
  todosByUser: {
    ...strict.isRequired,
    content: {
      [any]: {
        [any]: {
          ...strict,
          ...string.isRequired.many('id', 'userId', 'description'),
          done: bool.isRequired,
          pending: bool,
        },
      },
    }, status: {
      pending: bool,
    }, },
  selections: {
    ...strict,
    user: {
      ...strict,
      ...string.many('id', 'firstName', 'lastName', 'email', 'phone'),
      age: number,
      ...bool.many('single', 'pending'),
    }, },
};