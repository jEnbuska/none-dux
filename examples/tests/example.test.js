import testImport from './test_resources';
import { expect, } from 'chai';

describe('Voting', () => {
  it('should not crash when writing tests in es6>=', () => {
    // http://chaijs.com/api/bdd/
    const { a, b, } = { a: 1, b: 2, };
    expect(testImport).to.be.a('function');
    expect(a).to.equal(1);
    expect(b).to.be.a('number');
  });
});
