import { expect, } from 'chai';
import { bool, number, string, object, array, } from '../src/types';

describe('VALIDATE_TYPES', () => {
  const booleanTrue = true;
  const booleanFalse = true;
  const numberZero = 0;
  const numberOne = 1;
  const stringEmpty = '';
  const stringDefault = 'abc';
  const objectDefault = {};
  const arrayDefault = [];
  const nullDefault = null;
  const undefinedDefault = undefined;

  it('validate bool', () => {
    expect(bool._hasError(booleanFalse)).to.equal(undefined);
    expect(bool._hasError(booleanTrue)).to.equal(undefined);
    expect(bool._hasError(undefinedDefault)).to.equal(undefined);
    expect(bool._hasError(numberZero)).to.include('number');
    expect(bool._hasError(numberOne)).to.include('number');
    expect(bool._hasError(stringDefault)).to.include('string');
    expect(bool._hasError(stringEmpty)).to.include('string');
    expect(bool._hasError(objectDefault)).to.include('object');
    expect(bool._hasError(arrayDefault)).to.include('array');
    expect(bool._hasError(nullDefault)).to.equal(undefined);
  });

  it('validate required bool', () => {
    expect(bool.isRequired._hasError(booleanFalse)).to.equal(undefined);
    expect(bool.isRequired._hasError(booleanTrue)).to.equal(undefined);
    expect(bool.isRequired._hasError(undefinedDefault)).to.include('undefined');
    expect(bool.isRequired._hasError(numberZero)).to.include('number');
    expect(bool.isRequired._hasError(numberOne)).to.include('number');
    expect(bool.isRequired._hasError(stringDefault)).to.include('string');
    expect(bool.isRequired._hasError(stringEmpty)).to.include('string');
    expect(bool.isRequired._hasError(objectDefault)).to.include('object');
    expect(bool.isRequired._hasError(arrayDefault)).to.include('array');
    expect(bool.isRequired._hasError(nullDefault)).to.include('null');
  });

  it('validate number', () => {
    expect(number._hasError(booleanFalse)).to.include('boolean');
    expect(number._hasError(booleanTrue)).to.include('boolean');
    expect(number._hasError(undefinedDefault)).to.equal(undefined);
    expect(number._hasError(numberZero)).to.equal(undefined);
    expect(number._hasError(numberOne)).to.equal(undefined);
    expect(number._hasError(stringDefault)).to.include('string');
    expect(number._hasError(stringEmpty)).to.include('string');
    expect(number._hasError(objectDefault)).to.include('object');
    expect(number._hasError(arrayDefault)).to.include('array');
    expect(number._hasError(nullDefault)).to.equal(undefined);
  });

  it('validate required number', () => {
    expect(number.isRequired._hasError(booleanFalse)).to.include('boolean');
    expect(number.isRequired._hasError(booleanTrue)).to.include('boolean');
    expect(number.isRequired._hasError(undefinedDefault)).to.include('undefined');
    expect(number.isRequired._hasError(numberZero)).to.equal(undefined);
    expect(number.isRequired._hasError(numberOne)).to.equal(undefined);
    expect(number.isRequired._hasError(stringDefault)).to.include('string');
    expect(number.isRequired._hasError(stringEmpty)).to.include('string');
    expect(number.isRequired._hasError(objectDefault)).to.include('object');
    expect(number.isRequired._hasError(arrayDefault)).to.include('array');
    expect(number.isRequired._hasError(nullDefault)).to.include('null');
  });

  it('validate string', () => {
    expect(string._hasError(booleanFalse)).to.include('boolean');
    expect(string._hasError(booleanTrue)).to.include('boolean');
    expect(string._hasError(undefinedDefault)).to.equal(undefined);
    expect(string._hasError(numberZero)).to.include('number');
    expect(string._hasError(numberOne)).to.include('number');
    expect(string._hasError(stringDefault)).to.equal(undefined);
    expect(string._hasError(stringEmpty)).to.equal(undefined);
    expect(string._hasError(objectDefault)).to.include('object');
    expect(string._hasError(arrayDefault)).to.include('array');
    expect(string._hasError(nullDefault)).to.equal(undefined);
  });


  it('validate required string', () => {
    expect(string.isRequired._hasError(booleanFalse)).to.include('boolean');
    expect(string.isRequired._hasError(booleanTrue)).to.include('boolean');
    expect(string.isRequired._hasError(undefinedDefault)).to.include('undefined');
    expect(string.isRequired._hasError(numberZero)).to.include('number');
    expect(string.isRequired._hasError(numberOne)).to.include('number');
    expect(string.isRequired._hasError(stringDefault)).to.equal(undefined);
    expect(string.isRequired._hasError(stringEmpty)).to.equal(undefined);
    expect(string.isRequired._hasError(objectDefault)).to.include('object');
    expect(string.isRequired._hasError(arrayDefault)).to.include('array');
    expect(string.isRequired._hasError(nullDefault)).to.include('null');
  });

  it('validate object', () => {
    expect(object._hasError(booleanFalse)).to.include('boolean');
    expect(object._hasError(booleanTrue)).to.include('boolean');
    expect(object._hasError(undefinedDefault)).to.equal(undefined);
    expect(object._hasError(numberZero)).to.include('number');
    expect(object._hasError(numberOne)).to.include('number');
    expect(object._hasError(stringDefault)).to.include('string');
    expect(object._hasError(stringEmpty)).to.include('string');
    expect(object._hasError(objectDefault)).to.equal(undefined);
    expect(object._hasError(arrayDefault)).to.include('array');
    expect(object._hasError(nullDefault)).to.equal(undefined);
  });

  it('validate required object', () => {
    expect(object.isRequired._hasError(booleanFalse)).to.include('boolean');
    expect(object.isRequired._hasError(booleanTrue)).to.include('boolean');
    expect(object.isRequired._hasError(undefinedDefault)).to.include('undefined');
    expect(object.isRequired._hasError(numberZero)).to.include('number');
    expect(object.isRequired._hasError(numberOne)).to.include('number');
    expect(object.isRequired._hasError(stringDefault)).to.include('string');
    expect(object.isRequired._hasError(stringEmpty)).to.include('string');
    expect(object.isRequired._hasError(objectDefault)).to.equal(undefined);
    expect(object.isRequired._hasError(arrayDefault)).to.include('array');
    expect(object.isRequired._hasError(nullDefault)).to.include('null');
  });

  it('validate array', () => {
    expect(array._hasError(booleanFalse)).to.include('boolean');
    expect(array._hasError(booleanTrue)).to.include('boolean');
    expect(array._hasError(undefinedDefault)).to.equal(undefined);
    expect(array._hasError(numberZero)).to.include('number');
    expect(array._hasError(numberOne)).to.include('number');
    expect(array._hasError(stringDefault)).to.include('string');
    expect(array._hasError(stringEmpty)).to.include('string');
    expect(array._hasError(objectDefault)).to.include('object')
    expect(array._hasError(arrayDefault)).to.equal(undefined);
    expect(array._hasError(nullDefault)).to.equal(undefined);
  });

  it('validate required array', () => {
    expect(array.isRequired._hasError(booleanFalse)).to.include('boolean');
    expect(array.isRequired._hasError(booleanTrue)).to.include('boolean');
    expect(array.isRequired._hasError(undefinedDefault)).to.include('undefined');
    expect(array.isRequired._hasError(numberZero)).to.include('number');
    expect(array.isRequired._hasError(numberOne)).to.include('number');
    expect(array.isRequired._hasError(stringDefault)).to.include('string');
    expect(array.isRequired._hasError(stringEmpty)).to.include('string');
    expect(array.isRequired._hasError(objectDefault)).to.include('object');
    expect(array.isRequired._hasError(arrayDefault)).to.equal(undefined);
    expect(array.isRequired._hasError(nullDefault)).to.include('null');
  });
});
