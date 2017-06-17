import { expect, } from 'chai';
import createStore, { none, any, spec, isRequired, anyLeaf, exclusive, bool, number, string, object, array, } from '../src/createStore';
import DevSubStore from '../src/DevSubStore';

let validationErrors;
let requiredFieldsErrors;
let invalidSpecTypesErrors;
let exclusiveFieldsErrors;

function refreshLists(){
  validationErrors = [];
  requiredFieldsErrors = [];
  invalidSpecTypesErrors = []; // beforeEach not working for some reason
  exclusiveFieldsErrors = [];
}

DevSubStore.onValidationError = err => validationErrors.push(err);
DevSubStore.onMissingRequiredFields = err => requiredFieldsErrors.push(err);
DevSubStore.onInvalidSpecType = err => {
  invalidSpecTypesErrors.push(err);
}
DevSubStore.onExclusiveViolation= err => {
  exclusiveFieldsErrors.push(err);
}

describe('Validate shape', () => {
  it('Valid spec bool', () => {
    refreshLists(); // beforeEach not working for some reason
    createStore(
      { a: false, b: true, },
      {
        a: { [spec]: { type: bool, }, },
        b: { [spec]: { type: bool, }, },
      });
    expect(validationErrors.length).to.deep.equal(0);
    expect(requiredFieldsErrors.length).to.deep.equal(0);
    expect(invalidSpecTypesErrors.length).to.deep.equal(0);
    expect(exclusiveFieldsErrors.length).to.deep.equal(0);
  });

  it('Valid spec number', () => {
    refreshLists();
    createStore(
      { a: 1, b: 2, c: 3, },
      {
        a: { [spec]: { type: number, }, },
        b: { [spec]: { type: number, }, },
        c: { [spec]: { type: number, }, },
      });
    expect(validationErrors.length).to.deep.equal(0);
    expect(requiredFieldsErrors.length).to.deep.equal(0);
    expect(invalidSpecTypesErrors.length).to.deep.equal(0);
    expect(exclusiveFieldsErrors.length).to.deep.equal(0);
  });

  it('Valid spec string', () => {
    refreshLists();
    createStore(
      { a: '', b: 'abc', },
      {
        a: { [spec]: { type: string, }, },
        b: { [spec]: { type: string, }, },
      });
    expect(validationErrors.length).to.deep.equal(0);
    expect(requiredFieldsErrors.length).to.deep.equal(0);
    expect(invalidSpecTypesErrors.length).to.deep.equal(0);
    expect(exclusiveFieldsErrors.length).to.deep.equal(0);
  });

  it('Valid spec object', () => {
    refreshLists();
    createStore(
      { a: {}, b: {}, },
      {
        a: { [spec]: { type: object, }, },
        b: { [spec]: { type: object, }, },
      });
    expect(validationErrors.length).to.deep.equal(0);
    expect(requiredFieldsErrors.length).to.deep.equal(0);
    expect(invalidSpecTypesErrors.length).to.deep.equal(0);
    expect(exclusiveFieldsErrors.length).to.deep.equal(0);
  });

  it('Valid spec none', () => {
    refreshLists();
    createStore(
      { a: undefined, b: null, },
      {
        a: { [spec]: { type: none, }, },
        b: { [spec]: { type: none, }, },
      });
    expect(validationErrors.length).to.deep.equal(0);
    expect(requiredFieldsErrors.length).to.deep.equal(0);
    expect(invalidSpecTypesErrors.length).to.deep.equal(0);
    expect(exclusiveFieldsErrors.length).to.deep.equal(0);
  });

  it('Valid spec anyPrimitive', () => {
    refreshLists();
    createStore(
      { a: '', b: 2, c: false, },
      {
        a: { [spec]: { type: anyLeaf, }, },
        b: { [spec]: { type: anyLeaf, }, },
        c: { [spec]: { type: anyLeaf, }, },
      });
    expect(validationErrors.length).to.deep.equal(0);
    expect(requiredFieldsErrors.length).to.deep.equal(0);
    expect(invalidSpecTypesErrors.length).to.deep.equal(0);
    expect(exclusiveFieldsErrors.length).to.deep.equal(0);
  });

  it('Valid anyLeaf with any target', () => {
    refreshLists();
    createStore(
      { a: 123, 1: 'abc', gdsabafda: false, },
      {
        [any]: { [spec]: { type: anyLeaf, }, },
      });
    expect(validationErrors.length).to.deep.equal(0);
    expect(requiredFieldsErrors.length).to.deep.equal(0);
    expect(invalidSpecTypesErrors.length).to.deep.equal(0);
    expect(exclusiveFieldsErrors.length).to.deep.equal(0);
  });

  it('Missing required field error', () => {
    refreshLists();
    createStore(
      { a: 123, },
      {
        [any]: { [spec]: { type: anyLeaf, }, },
        b: { [spec]: { type: number, isRequired, }, },
      });
    expect(validationErrors.length).to.deep.equal(0);
    expect(requiredFieldsErrors.length).to.deep.equal(1);
    expect(invalidSpecTypesErrors.length).to.deep.equal(0);
    expect(exclusiveFieldsErrors.length).to.deep.equal(0);
  });

  it('Redudant fields error', () => {
    refreshLists();
    createStore(
      { a: 123, b: 'abc', },
      { [spec]: { type: object, exclusive, },
        a: { [spec]: { type: anyLeaf, }, },
      });
    expect(validationErrors.length).to.deep.equal(0);
    expect(invalidSpecTypesErrors.length).to.deep.equal(0);
    expect(requiredFieldsErrors.length).to.deep.equal(0);
    expect(exclusiveFieldsErrors.length).to.deep.equal(1);
  });

  it('Non specified fields', () => {
    refreshLists();
    createStore(
      { a: 123, b: 'abc', },
      { [spec]: { type: object, },
        a: { [spec]: { type: anyLeaf, }, },
      });
    expect(validationErrors.length).to.deep.equal(0);
    expect(invalidSpecTypesErrors.length).to.deep.equal(0);
    expect(requiredFieldsErrors.length).to.deep.equal(0);
    expect(exclusiveFieldsErrors.length).to.deep.equal(0);
  });

  it('Valid spec object', () => {
    refreshLists();
    createStore(
      { b: {}, },
      { [spec]: { type: object, },
        b: { [spec]: { type: object, }, },
      });
    expect(validationErrors.length).to.deep.equal(0);
    expect(invalidSpecTypesErrors.length).to.deep.equal(0);
    expect(requiredFieldsErrors.length).to.deep.equal(0);
    expect(exclusiveFieldsErrors.length).to.deep.equal(0);
  });

  it('Invalid spec', () => {
    const missingTypeStore = createStore(
      { b: {}, },
      { [spec]: { type: object, },
        b: { [spec]: {}, },
      });
    expect(!(missingTypeStore instanceof DevSubStore)).to.be.ok

    const missingSpecStore = createStore(
      { b: {}, },
      { [spec]: { type: object, },
        b: {},
      });
    expect(!(missingSpecStore instanceof DevSubStore)).to.be.ok
  })

  it('Invalid spec', () => {
    const missingTypeStore = createStore(
      { b: {}, },
      { [spec]: { type: object, },
        b: { [spec]: {}, },
      });
    expect(!(missingTypeStore instanceof DevSubStore)).to.be.ok

    const missingSpecStore = createStore(
      { b: {}, },
      { [spec]: { type: object, },
        b: {},
      });
    expect(!(missingSpecStore instanceof DevSubStore)).to.be.ok
  })
});
