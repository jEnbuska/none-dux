import { expect, } from 'chai';
import createStore from '../src/createStore';
import odd from './resources';

function clone(value) {
  if (value instanceof Object) {
    return value instanceof Object ? Object.keys(value).reduce((acc, key) => {
      acc[key] = clone(value[key]);
      return acc;
    }, {}) : [];
  }
  return value;
}

describe('performance', () => {
  it('performance simple', function () {
    this.timeout(15000);
    const even = clone(odd);
    delete even.companies.Eficode;
    const california = even.companies.GE.offices.California;
    california.address = 'Silicon valley 10 b';
    const employeeOne = Object.keys(california.employees)[0];
    const employee = california.employees[employeeOne];
    employee.name = 'Carl';
    const employeeTwo = Object.keys(california.employees)[1];
    delete california.employees[employeeTwo];
    california.employees.something = { name: 'Jukka', };
    even.companies.Google = { offices: { first: '', }, };
    const root = createStore({});
    root.setState(even);
    const time = new Date();
    for (let i = 0; i < 10000; i++) {
      if (i%7 === 0) {
        root.clearState({});
      }
      root.setState(i % 3 === 0 ? even : odd);
    }
    console.log('setState 10000 times: took ', new Date() - time, 'ms');
  });
});
