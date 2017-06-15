import { expect, } from 'chai';
import createStore, { TARGET_ANY, VALIDATE, TYPE, TYPE_ANY, } from '../src/createStore';
import DevSubStore from '../src/DevSubStore';

describe('Validate shape', () => {
  let errors;

  it('Valid TYPEs number', () => {
    errors = []; // beforeEach not working for some reason
    DevSubStore.onValidationError = (err) => errors.push(err);
    createStore(
      { a: 1, b: 2, c: 3, },
      {
        a: { [TYPE]: 'number', },
        b: { [TYPE]: 'number', },
        c: { [TYPE]: 'number', },
      });
    expect(errors.length).to.deep.equal(0);
  });

  it('Valid TYPEs string', () => {
    errors = []; // beforeEach not working for some reason
    DevSubStore.onValidationError = (err) => errors.push(err);
    createStore(
      { a: '', b: 'abc', },
      {
        a: { [TYPE]: 'string', },
        b: { [TYPE]: 'string', },
      });
    expect(errors.length).to.deep.equal(0);
  });

  it('Valid TYPEs object', () => {
    errors = []; // beforeEach not working for some reason
    DevSubStore.onValidationError = (err) => errors.push(err);
    createStore(
      { a: {}, b: {}, },
      {
        a: { [TYPE]: 'object', },
        b: { [TYPE]: 'object', },
      });
    expect(errors.length).to.deep.equal(0);
  });

  it('Valid TYPEs undefined', () => {
    errors = []; // beforeEach not working for some reason
    DevSubStore.onValidationError = (err) => errors.push(err);
    createStore(
      { a: undefined, b: undefined, },
      {
        a: { [TYPE]: 'undefined', },
        b: { [TYPE]: 'undefined', },
      });
    expect(errors.length).to.deep.equal(0);
  });

  it('Valid TARGET_ANY', () => {
    errors = []; // beforeEach not working for some reason
    DevSubStore.onValidationError = (err) => errors.push(err);
    createStore(
      { a: '', 1: 'abc', gdsabafda: 'c', },
      {
        [TARGET_ANY]: { [TYPE]: 'string', },
      });
    expect(errors.length).to.deep.equal(0);
  });

  it('Valid mixed with TARGET_ANY', () => {
    errors = []; // beforeEach not working for some reason
    DevSubStore.onValidationError = (err) => errors.push(err);
    createStore(
      { a: 123, 1: 'abc', gdsabafda: 'c', },
      {
        [TARGET_ANY]: { [TYPE]: 'string', },
        a: 'number',
      });
    expect(errors.length).to.deep.equal(0);
  });

  it('Valid TARGET_ANY, type TYPE_ANY', () => {
    errors = []; // beforeEach not working for some reason
    DevSubStore.onValidationError = (err) => errors.push(err);
    createStore(
      { a: 123, 1: 'abc', gdsabafda: {}, },
      {
        [TARGET_ANY]: { [TYPE]: TYPE_ANY, },
      });
    expect(errors.length).to.deep.equal(0);
  });

  it('Valid TYPEs mixed', () => {
    errors = []; // beforeEach not working for some reason
    DevSubStore.onValidationError = (err) => errors.push(err);
    createStore(
      { a: {}, b: 2, c: 'abc', d: undefined, e: null, f: [], },
      {
        a: { [TYPE]: 'object', },
        b: { [TYPE]: 'number', },
        c: { [TYPE]: 'string', },
        d: { [TYPE]: 'undefined', },
        e: { [TYPE]: 'object', },
        f: { [TYPE]: 'object', },
      });
    expect(errors.length).to.deep.equal(0);
  });

  it('Valid TYPEs nested', () => {
    errors = []; // beforeEach not working for some reason
    DevSubStore.onValidationError = (err) => errors.push(err);
    createStore(
      { a: { b: 'abc', c: { d: 123, e: {}, }, }, f: 2, g: 'abc', },
      {
        a: {
          [TYPE]: 'object',
          b: {
            [TYPE]: 'string',
          },
          c: {
            [TYPE]: 'object',
            d: { [TYPE]: 'number', },
            e: { [TYPE]: 'object', },
          },
        },
        f: { [TYPE]: 'number', },
        g: { [TYPE]: 'string', },
      });
    expect(errors.length).to.deep.equal(0);
  });

  it('Valid VALIDATE nested', () => {
    errors = []; // beforeEach not working for some reason
    DevSubStore.onValidationError = (err) => errors.push(err);
    createStore(
      { a: { b: 'abc', c: { d: {}, e: undefined, }, }, f: 2, g: 'abc', },
      {
        a: {
          [VALIDATE]: state => state.hasOwnProperty('b') && state.hasOwnProperty('c'),
          b: { [TYPE]: 'string', },
          c: { [VALIDATE]: state => Object.keys(state).length === 2,
            d: { [VALIDATE]: state => state instanceof Object, },
            e: { [TYPE]: undefined, },
          },
        },
        f: { [TYPE]: 'number', },
        g: { [VALIDATE]: state => state.length>=3, },
      });
    expect(errors.length).to.deep.equal(0);
  });

  it('Invalid TYPEs nested', () => {
    errors = []; // beforeEach not working for some reason
    DevSubStore.onValidationError = (err) => errors.push(err);
    createStore(
      { a: { b: 'abc', c: { d: 123, e: {}, }, }, f: 2, g: 'abc', },
      {
        a: { [TYPE]: 'object',
          b: { [TYPE]: 'object',
          },
          c: { [TYPE]: 'string',
            d: { [TYPE]: 'string', },
            e: { [TYPE]: 'number', },
          },
        },
        f: { [TYPE]: 'string', },
        g: { [TYPE]: 'number', },
      });
    expect(errors.length).to.deep.equal(6);
  });

  it('Invalid VALIDATE nested', () => {
    errors = []; // beforeEach not working for some reason
    DevSubStore.onValidationError = (err) => errors.push(err);
    createStore(
      { a: { b: 'abc', c: { d: 123, e: {}, }, }, },
      {
        a: { [VALIDATE]: state => state.hasOwnProperty('x'),
          b: { [VALIDATE]: state => typeof state === 'number',
          },
          c: { [TYPE]: 'string',
            d: { [VALIDATE]: state => state.length===100, },
            e: { [VALIDATE]: () => { throw new Error(); }, },
          },
        },
      });
    expect(errors.length).to.deep.equal(5);
  });
});
