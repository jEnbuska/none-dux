import { shape, } from '../../src';

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
        firstName: string.isRequired,
        lastName: string.isRequired,
        email: string.isRequired,
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
          id: string.isRequired,
          userId: string.isRequired,
          description: string.isRequired,
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
      id: string,
      firstName: string,
      lastName: string,
      email: string,
      age: number,
      phone: string,
      single: bool,
      pending: bool,
    }, },
};