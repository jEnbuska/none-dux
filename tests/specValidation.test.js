import { expect, } from 'chai';
import createStore from '../src/createStore';
import { any, spec, isRequired, anyLeaf, exclusive, bool, number, string, object, array, regex, symbol, func, } from '../src/shape';
import DevSubStore from '../src/DevSubStore';

let validationErrors;
let requiredFieldsErrors;
let invalidSpecTypesErrors;
let exclusiveFieldsErrors;

function refreshLists() {
  validationErrors = [];
  requiredFieldsErrors = [];
  invalidSpecTypesErrors = []; // beforeEach not working for some reason
  exclusiveFieldsErrors = [];
}

const emptyFunc = () => {};
const emptyObj = {};
const helloSymbol= Symbol('hello world');
const emptyArr = [];
const testRegex = /test/;

DevSubStore.onValidationError = err => validationErrors.push(err);
DevSubStore.onMissingRequiredFields = err => requiredFieldsErrors.push(err);
DevSubStore.onInvalidSpecType = err => {
  invalidSpecTypesErrors.push(err);
};
DevSubStore.onExclusiveViolation= err => {
  exclusiveFieldsErrors.push(err);
};

describe('Validate shape', () => {
  it('Valid array', () => {
    refreshLists();
    createStore(
      { arr1: [], arr2: [ [], ], },
      {
        arr1: { [spec]: { type: array, }, },
        arr2: { [spec]: { type: array, },
          [any]: { [spec]: { type: array, }, },
        },
      });
    expect(validationErrors.length).to.deep.equal(0);

    expect(invalidSpecTypesErrors.length).to.deep.equal(0);
    expect(requiredFieldsErrors.length).to.deep.equal(0);
    expect(exclusiveFieldsErrors.length).to.deep.equal(0);
  });

  it('Valid bool', () => {
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

  it('Valid number', () => {
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

  it('Valid string', () => {
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

  it('Valid object', () => {
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

  it('Valid regex', () => {
    refreshLists();
    createStore(
      { a: /hello/, b: /world/, },
      {
        a: { [spec]: { type: regex, }, },
        b: { [spec]: { type: regex, }, },
      });
    expect(validationErrors.length).to.deep.equal(0);
    expect(requiredFieldsErrors.length).to.deep.equal(0);
    expect(invalidSpecTypesErrors.length).to.deep.equal(0);
    expect(exclusiveFieldsErrors.length).to.deep.equal(0);
  });

  it('Valid symbol', () => {
    refreshLists();
    createStore(
      { a: Symbol('hello'), b: Symbol('world'), },
      {
        a: { [spec]: { type: symbol, }, },
        b: { [spec]: { type: symbol, }, },
      });
    expect(validationErrors.length).to.deep.equal(0);
    expect(requiredFieldsErrors.length).to.deep.equal(0);
    expect(invalidSpecTypesErrors.length).to.deep.equal(0);
    expect(exclusiveFieldsErrors.length).to.deep.equal(0);
  });

  it('Valid func', () => {
    refreshLists();
    createStore(
      { a: () => {}, b() {}, },
      {
        a: { [spec]: { type: func, }, },
        b: { [spec]: { type: func, }, },
      });
    expect(validationErrors.length).to.deep.equal(0);
    expect(requiredFieldsErrors.length).to.deep.equal(0);
    expect(invalidSpecTypesErrors.length).to.deep.equal(0);
    expect(exclusiveFieldsErrors.length).to.deep.equal(0);
  });

  it('Valid anyLeaf', () => {
    refreshLists();
    createStore(
      { a: '', b: 2, c: false, },
      {
        a: { [spec]: { type: anyLeaf, }, },
        b: { [spec]: { type: anyLeaf, }, },
        c: { [spec]: { type: anyLeaf, }, },
      });
    expect(validationErrors.length).to.equal(0);
    expect(requiredFieldsErrors.length).to.equal(0);
    expect(invalidSpecTypesErrors.length).to.equal(0);
    expect(exclusiveFieldsErrors.length).to.equal(0);
  });

  it('invalid bools', () => {
    refreshLists();
    createStore(
      { a: 123, b: 'abc', c: emptyFunc, d: emptyObj, e: helloSymbol, f: testRegex, g: emptyArr, },
      {
        a: { [spec]: { type: bool, }, },
        b: { [spec]: { type: bool, }, },
        c: { [spec]: { type: bool, }, },
        d: { [spec]: { type: bool, }, },
        e: { [spec]: { type: bool, }, },
        f: { [spec]: { type: bool, }, },
        g: { [spec]: { type: bool, }, },
      });

    expect(validationErrors.length).to.equal(7);

    const expectedErrors =[
      { identity: [ 'root', 'a', ], actualType: number, state: 123, }, { identity: [ 'root', 'b', ], actualType: string, state: 'abc', },
      { identity: [ 'root', 'c', ], actualType: func, state: emptyFunc, }, { identity: [ 'root', 'd', ], actualType: object, state: emptyObj, },
      { identity: [ 'root', 'e', ], actualType: symbol, state: helloSymbol, }, { identity: [ 'root', 'f', ], actualType: regex, state: testRegex, },
      { identity: [ 'root', 'g', ], actualType: array, state: emptyArr, },
    ];

    for (let i = 0; i<validationErrors.length; i++) {
      const next = validationErrors[i];
      const { actualType, state, identity, }= expectedErrors[i];
      expect(next).to.deep.equal({ expectedType: bool, actualType, state, identity, isRequired: undefined, });
    }

    expect(requiredFieldsErrors.length).to.equal(0);
    expect(invalidSpecTypesErrors.length).to.equal(0);
    expect(exclusiveFieldsErrors.length).to.equal(0);
  });

  it('invalid numbers', () => {
    refreshLists();
    createStore(
      { a: true, b: 'abc', c: emptyFunc, d: emptyObj, e: helloSymbol, f: testRegex, g: emptyArr, },
      {
        a: { [spec]: { type: number, }, },
        b: { [spec]: { type: number, }, },
        c: { [spec]: { type: number, }, },
        d: { [spec]: { type: number, }, },
        e: { [spec]: { type: number, }, },
        f: { [spec]: { type: number, }, },
        g: { [spec]: { type: number, }, },
      });
    expect(validationErrors.length).to.equal(7);

    const expectedErrors =[
      { identity: [ 'root', 'a', ], actualType: bool, state: true, }, { identity: [ 'root', 'b', ], actualType: string, state: 'abc', },
      { identity: [ 'root', 'c', ], actualType: func, state: emptyFunc, }, { identity: [ 'root', 'd', ], actualType: object, state: emptyObj, },
      { identity: [ 'root', 'e', ], actualType: symbol, state: helloSymbol, }, { identity: [ 'root', 'f', ], actualType: regex, state: testRegex, },
      { identity: [ 'root', 'g', ], actualType: array, state: emptyArr, },
    ];

    for (let i = 0; i<validationErrors.length; i++) {
      const next = validationErrors[i];
      const { actualType, state, identity, }= expectedErrors[i];
      expect(next).to.deep.equal({ expectedType: number, actualType, state, identity, isRequired: undefined, });
    }

    expect(requiredFieldsErrors.length).to.equal(0);
    expect(invalidSpecTypesErrors.length).to.equal(0);
    expect(exclusiveFieldsErrors.length).to.equal(0);
  });

  it('invalid strings', () => {
    refreshLists();
    createStore(
      { a: true, b: 123, c: emptyFunc, d: emptyObj, e: helloSymbol, f: testRegex, g: emptyArr, },
      {
        a: { [spec]: { type: string, }, },
        b: { [spec]: { type: string, }, },
        c: { [spec]: { type: string, }, },
        d: { [spec]: { type: string, }, },
        e: { [spec]: { type: string, }, },
        f: { [spec]: { type: string, }, },
        g: { [spec]: { type: string, }, },
      });
    expect(validationErrors.length).to.equal(7);

    const expectedErrors =[
      { identity: [ 'root', 'a', ], actualType: bool, state: true, }, { identity: [ 'root', 'b', ], actualType: number, state: 123, },
      { identity: [ 'root', 'c', ], actualType: func, state: emptyFunc, }, { identity: [ 'root', 'd', ], actualType: object, state: emptyObj, },
      { identity: [ 'root', 'e', ], actualType: symbol, state: helloSymbol, }, { identity: [ 'root', 'f', ], actualType: regex, state: testRegex, },
      { identity: [ 'root', 'g', ], actualType: array, state: emptyArr, },
    ];

    for (let i = 0; i<validationErrors.length; i++) {
      const next = validationErrors[i];
      const { actualType, state, identity, }= expectedErrors[i];
      expect(next).to.deep.equal({ expectedType: string, actualType, state, identity, isRequired: undefined, });
    }
    expect(requiredFieldsErrors.length).to.equal(0);
    expect(invalidSpecTypesErrors.length).to.equal(0);
    expect(exclusiveFieldsErrors.length).to.equal(0);
  });

  it('invalid regex', () => {
    refreshLists();
    createStore(
      { a: true, b: 'abc', c: emptyFunc, d: emptyObj, e: helloSymbol, f: 123, g: emptyArr, },
      {
        a: { [spec]: { type: regex, }, },
        b: { [spec]: { type: regex, }, },
        c: { [spec]: { type: regex, }, },
        d: { [spec]: { type: regex, }, },
        e: { [spec]: { type: regex, }, },
        f: { [spec]: { type: regex, }, },
        g: { [spec]: { type: regex, }, },
      });

    expect(validationErrors.length).to.equal(7);

    const expectedErrors =[
      { identity: [ 'root', 'a', ], actualType: bool, state: true, }, { identity: [ 'root', 'b', ], actualType: string, state: 'abc', },
      { identity: [ 'root', 'c', ], actualType: func, state: emptyFunc, }, { identity: [ 'root', 'd', ], actualType: object, state: emptyObj, },
      { identity: [ 'root', 'e', ], actualType: symbol, state: helloSymbol, }, { identity: [ 'root', 'f', ], actualType: number, state: 123, },
      { identity: [ 'root', 'g', ], actualType: array, state: emptyArr, },
    ];

    for (let i = 0; i<validationErrors.length; i++) {
      const next = validationErrors[i];
      const { actualType, state, identity, }= expectedErrors[i];
      expect(next).to.deep.equal({ expectedType: regex, actualType, state, identity, isRequired: undefined, });
    }

    expect(requiredFieldsErrors.length).to.equal(0);
    expect(invalidSpecTypesErrors.length).to.equal(0);
    expect(exclusiveFieldsErrors.length).to.equal(0);
  });

  it('invalid object', () => {
    refreshLists();
    createStore(
      { a: true, b: 'abc', c: emptyFunc, d: testRegex, e: helloSymbol, f: 123, g: emptyArr, },
      {
        a: { [spec]: { type: object, }, },
        b: { [spec]: { type: object, }, },
        c: { [spec]: { type: object, }, },
        d: { [spec]: { type: object, }, },
        e: { [spec]: { type: object, }, },
        f: { [spec]: { type: object, }, },
        g: { [spec]: { type: object, }, },
      });
    expect(validationErrors.length).to.equal(7);

    const expectedErrors =[
      { identity: [ 'root', 'a', ], actualType: bool, state: true, }, { identity: [ 'root', 'b', ], actualType: string, state: 'abc', },
      { identity: [ 'root', 'c', ], actualType: func, state: emptyFunc, }, { identity: [ 'root', 'd', ], actualType: regex, state: testRegex, },
      { identity: [ 'root', 'e', ], actualType: symbol, state: helloSymbol, }, { identity: [ 'root', 'f', ], actualType: number, state: 123, },
      { identity: [ 'root', 'g', ], actualType: array, state: emptyArr, },
    ];

    for (let i = 0; i<validationErrors.length; i++) {
      const next = validationErrors[i];
      const { actualType, state, identity, }= expectedErrors[i];
      expect(next).to.deep.equal({ expectedType: object, actualType, state, identity, isRequired: undefined, });
    }

    expect(requiredFieldsErrors.length).to.equal(0);
    expect(invalidSpecTypesErrors.length).to.equal(0);
    expect(exclusiveFieldsErrors.length).to.equal(0);
  });

  it('invalid array', () => {
    refreshLists();
    createStore(
      { a: true, b: 'abc', c: emptyFunc, d: testRegex, e: helloSymbol, f: 123, g: emptyObj, },
      {
        a: { [spec]: { type: array, }, },
        b: { [spec]: { type: array, }, },
        c: { [spec]: { type: array, }, },
        d: { [spec]: { type: array, }, },
        e: { [spec]: { type: array, }, },
        f: { [spec]: { type: array, }, },
        g: { [spec]: { type: array, }, },
      });
    expect(validationErrors.length).to.equal(7);

    const expectedErrors =[
      { identity: [ 'root', 'a', ], actualType: bool, state: true, }, { identity: [ 'root', 'b', ], actualType: string, state: 'abc', },
      { identity: [ 'root', 'c', ], actualType: func, state: emptyFunc, }, { identity: [ 'root', 'd', ], actualType: regex, state: testRegex, },
      { identity: [ 'root', 'e', ], actualType: symbol, state: helloSymbol, }, { identity: [ 'root', 'f', ], actualType: number, state: 123, },
      { identity: [ 'root', 'g', ], actualType: object, state: emptyObj, },
    ];

    for (let i = 0; i<validationErrors.length; i++) {
      const next = validationErrors[i];
      const { actualType, state, identity, }= expectedErrors[i];
      expect(next).to.deep.equal({ expectedType: array, actualType, state, identity, isRequired: undefined, });
    }

    expect(requiredFieldsErrors.length).to.equal(0);
    expect(invalidSpecTypesErrors.length).to.equal(0);
    expect(exclusiveFieldsErrors.length).to.equal(0);
  });

  it('invalid anyLeafs', () => {
    refreshLists();
    createStore(
      { a: emptyObj, b: emptyArr, },
      {
        a: { [spec]: { type: anyLeaf, }, },
        b: { [spec]: { type: anyLeaf, }, },
      });
    expect(validationErrors.length).to.equal(2);
    expect(validationErrors[0]).to.deep.equal({ expectedType: anyLeaf, actualType: object, state: emptyObj, identity: [ 'root', 'a', ], isRequired: undefined, });
    expect(validationErrors[1]).to.deep.equal({ expectedType: anyLeaf, actualType: array, state: emptyArr, identity: [ 'root', 'b', ], isRequired: undefined, });

    expect(requiredFieldsErrors.length).to.equal(0);
    expect(invalidSpecTypesErrors.length).to.equal(0);
    expect(exclusiveFieldsErrors.length).to.equal(0);
  });

  it('Valid anyLeaf with any target', () => {
    refreshLists();
    createStore(
      { a: 123, 1: 'abc', gdsabafda: false, },
      {
        [any]: { [spec]: { type: anyLeaf, }, },
      });
    expect(validationErrors.length).to.equal(0);
    expect(requiredFieldsErrors.length).to.equal(0);
    expect(invalidSpecTypesErrors.length).to.equal(0);
    expect(exclusiveFieldsErrors.length).to.equal(0);
  });

  it('Missing required field error', () => {
    refreshLists();
    createStore(
      { a: 123, },
      {
        [any]: { [spec]: { type: anyLeaf, }, },
        b: { [spec]: { type: number, isRequired, }, },
        c: { [spec]: { type: object, isRequired, }, },
      });
    expect(validationErrors.length).to.equal(0);
    expect(requiredFieldsErrors.length).to.equal(1);
    expect(requiredFieldsErrors[0]).to.deep.equal({ identity: [ 'root', ], missingRequiredFields: [ 'b', 'c', ], });
    expect(invalidSpecTypesErrors.length).to.equal(0);
    expect(exclusiveFieldsErrors.length).to.equal(0);
  });

  it('Redudant fields error', () => {
    refreshLists();
    createStore(
      { a: 123, b: 'abc', },
      { [spec]: { type: object, exclusive, },
        a: { [spec]: { type: anyLeaf, }, },
      });
    expect(validationErrors.length).to.equal(0);
    expect(invalidSpecTypesErrors.length).to.equal(0);
    expect(requiredFieldsErrors.length).to.equal(0);
    expect(exclusiveFieldsErrors.length).to.equal(1);
    const { key, target, shape, value, } = exclusiveFieldsErrors[0];
    expect({ key, value, }).to.deep.equal({ key: 'b', value: 'abc', });
  });

  it('Non specified fields', () => {
    refreshLists();
    createStore(
      { a: 123, b: 'abc', },
      { [spec]: { type: object, },
        a: { [spec]: { type: anyLeaf, }, },
      });
    expect(validationErrors.length).to.equal(0);
    expect(invalidSpecTypesErrors.length).to.equal(0);
    expect(requiredFieldsErrors.length).to.equal(0);
    expect(exclusiveFieldsErrors.length).to.equal(0);
  });

  it('Invalid spec', () => {
    const missingTypeStore = createStore(
      { b: {}, },
      { [spec]: { type: object, },
        b: { [spec]: {}, },
      });
    expect(!(missingTypeStore instanceof DevSubStore)).to.be.ok;

    const missingSpecStore = createStore(
      { b: {}, },
      { [spec]: { type: object, },
        b: {},
      });
    expect(!(missingSpecStore instanceof DevSubStore)).to.be.ok;
  });

  it('Invalid spec', () => {
    const missingTypeStore = createStore(
      { b: {}, },
      { [spec]: { type: object, },
        b: { [spec]: {}, },
      });
    expect(!(missingTypeStore instanceof DevSubStore)).to.be.ok;

    const missingSpecStore = createStore(
      { b: {}, },
      { [spec]: { type: object, },
        b: {},
      });
    expect(!(missingSpecStore instanceof DevSubStore)).to.be.ok;
  });
});
