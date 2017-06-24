import { expect, } from 'chai';
import createStore, { StoreCreator, } from '../src/createStore';
import { anyKey, spec, isRequired, anyLeaf, exclusive, bool, number, string, object, array, regex, symbol, func, none, date, anyValue,} from '../src/shape';
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
  it('reformatShape', () => {
    const reformatted = StoreCreator.reformatShape({
      [spec]: { object, isRequired, },
      a: { [spec]: { array, isRequired, exclusive, },
        [anyKey]: { [spec]: { object, },
          b: { [spec]: { number, }, },
          c: { [spec]: { string, isRequired, }, },
        },
      },
      d: { [spec]: { number, }, },
    });
    expect(reformatted).to.deep.equal(
      { [spec]: { types: [ object, ], isRequired, },
        a: { [spec]: { types: [ array, ], isRequired, exclusive, },
          [anyKey]: { [spec]: { types: [ object, none, ], },
            b: { [spec]: { types: [ number, none, ], }, },
            c: { [spec]: { types: [ string, ], isRequired, }, },
          },
        },
        d: { [spec]: { types: [ number, none, ], }, },
      }
    );
  });

  it('Valid array', () => {
    refreshLists();
    createStore(
      { arr1: [], arr2: [ [], ], },
      {
        arr1: { [spec]: { array, }, },
        arr2: { [spec]: { array, },
          [anyKey]: { [spec]: { array, }, },
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
        a: { [spec]: { bool, }, },
        b: { [spec]: { bool, }, },
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
        a: { [spec]: { number, }, },
        b: { [spec]: { number, }, },
        c: { [spec]: { number, }, },
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
        a: { [spec]: { string, }, },
        b: { [spec]: { string, }, },
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
        a: { [spec]: { object, }, },
        b: { [spec]: { object, }, },
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
        a: { [spec]: { regex, }, },
        b: { [spec]: { regex, }, },
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
        a: { [spec]: { symbol, }, },
        b: { [spec]: { symbol, }, },
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
        a: { [spec]: { func, }, },
        b: { [spec]: { func, }, },
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
        a: { [spec]: { anyLeaf, }, },
        b: { [spec]: { anyLeaf, }, },
        c: { [spec]: { anyLeaf, }, },
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
        a: { [spec]: { bool, }, },
        b: { [spec]: { bool, }, },
        c: { [spec]: { bool, }, },
        d: { [spec]: { bool, }, },
        e: { [spec]: { bool, }, },
        f: { [spec]: { bool, }, },
        g: { [spec]: { bool, }, },
      });

    expect(validationErrors.length).to.equal(7);

    const expectedErrors =[
      { identity: [ 'root', 'a', ], actualType: number.name, state: 123, }, { identity: [ 'root', 'b', ], actualType: string.name, state: 'abc', },
      { identity: [ 'root', 'c', ], actualType: func.name, state: emptyFunc, }, { identity: [ 'root', 'd', ], actualType: object.name, state: emptyObj, },
      { identity: [ 'root', 'e', ], actualType: symbol.name, state: helloSymbol, }, { identity: [ 'root', 'f', ], actualType: regex.name, state: testRegex, },
      { identity: [ 'root', 'g', ], actualType: array.name, state: emptyArr, },
    ];

    for (let i = 0; i<validationErrors.length; i++) {
      const next = validationErrors[i];
      const expected = expectedErrors.find(({ identity, }) => identity[1] === next.identity[1]);
      expect(next).to.deep.equal({ expectedType: [ bool.name, none.name, ], isRequired: false, exclusive: false, ...expected, });
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
        b: { [spec]: { number, }, },
        c: { [spec]: { number, }, },
        d: { [spec]: { number, }, },
        a: { [spec]: { number, }, },
        e: { [spec]: { number, }, },
        f: { [spec]: { number, }, },
        g: { [spec]: { number, }, },
      });
    expect(validationErrors.length).to.equal(7);

    const expectedErrors =[
      { identity: [ 'root', 'a', ], actualType: bool.name, state: true, }, { identity: [ 'root', 'b', ], actualType: string.name, state: 'abc', },
      { identity: [ 'root', 'c', ], actualType: func.name, state: emptyFunc, }, { identity: [ 'root', 'd', ], actualType: object.name, state: emptyObj, },
      { identity: [ 'root', 'e', ], actualType: symbol.name, state: helloSymbol, }, { identity: [ 'root', 'f', ], actualType: regex.name, state: testRegex, },
      { identity: [ 'root', 'g', ], actualType: array.name, state: emptyArr, },
    ];

    for (let i = 0; i<validationErrors.length; i++) {
      const next = validationErrors[i];
      const expected = expectedErrors.find(({ identity, }) => identity[1] === next.identity[1]);
      expect(next).to.deep.equal({ expectedType: [ number.name, none.name, ], isRequired: false, exclusive: false, ...expected, });
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
        b: { [spec]: { string, }, },
        c: { [spec]: { string, }, },
        d: { [spec]: { string, }, },
        a: { [spec]: { string, }, },
        e: { [spec]: { string, }, },
        f: { [spec]: { string, }, },
        g: { [spec]: { string, }, },
      });
    expect(validationErrors.length).to.equal(7);

    const expectedErrors =[
      { identity: [ 'root', 'a', ], actualType: bool.name, state: true, }, { identity: [ 'root', 'b', ], actualType: number.name, state: 123, },
      { identity: [ 'root', 'c', ], actualType: func.name, state: emptyFunc, }, { identity: [ 'root', 'd', ], actualType: object.name, state: emptyObj, },
      { identity: [ 'root', 'e', ], actualType: symbol.name, state: helloSymbol, }, { identity: [ 'root', 'f', ], actualType: regex.name, state: testRegex, },
      { identity: [ 'root', 'g', ], actualType: array.name, state: emptyArr, },
    ];

    for (let i = 0; i<validationErrors.length; i++) {
      const next = validationErrors[i];
      const expected = expectedErrors.find(({ identity, }) => identity[1] === next.identity[1]);
      expect(next).to.deep.equal({ expectedType: [ string.name, none.name, ], isRequired: false, exclusive: false, ...expected, });
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
        b: { [spec]: { regex, }, },
        c: { [spec]: { regex, }, },
        d: { [spec]: { regex, }, },
        a: { [spec]: { regex, }, },
        e: { [spec]: { regex, }, },
        f: { [spec]: { regex, }, },
        g: { [spec]: { regex, }, },
      });

    expect(validationErrors.length).to.equal(7);

    const expectedErrors =[
      { identity: [ 'root', 'a', ], actualType: bool.name, state: true, }, { identity: [ 'root', 'b', ], actualType: string.name, state: 'abc', },
      { identity: [ 'root', 'c', ], actualType: func.name, state: emptyFunc, }, { identity: [ 'root', 'd', ], actualType: object.name, state: emptyObj, },
      { identity: [ 'root', 'e', ], actualType: symbol.name, state: helloSymbol, }, { identity: [ 'root', 'f', ], actualType: number.name, state: 123, },
      { identity: [ 'root', 'g', ], actualType: array.name, state: emptyArr, },
    ];

    for (let i = 0; i<validationErrors.length; i++) {
      const next = validationErrors[i];
      const expected = expectedErrors.find(({ identity, }) => identity[1] === next.identity[1]);
      expect(next).to.deep.equal({ expectedType: [ regex.name, none.name, ], isRequired: false, exclusive: false, ...expected, });
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
        a: { [spec]: { object, }, },
        b: { [spec]: { object, }, },
        c: { [spec]: { object, }, },
        d: { [spec]: { object, }, },
        e: { [spec]: { object, }, },
        f: { [spec]: { object, }, },
        g: { [spec]: { object, }, },
      });
    expect(validationErrors.length).to.equal(7);

    const expectedErrors =[
      { identity: [ 'root', 'a', ], actualType: bool.name, state: true, }, { identity: [ 'root', 'b', ], actualType: string.name, state: 'abc', },
      { identity: [ 'root', 'c', ], actualType: func.name, state: emptyFunc, }, { identity: [ 'root', 'd', ], actualType: regex.name, state: testRegex, },
      { identity: [ 'root', 'e', ], actualType: symbol.name, state: helloSymbol, }, { identity: [ 'root', 'f', ], actualType: number.name, state: 123, },
      { identity: [ 'root', 'g', ], actualType: array.name, state: emptyArr, },
    ];

    for (let i = 0; i<validationErrors.length; i++) {
      const next = validationErrors[i];
      const expected = expectedErrors.find(({ identity, }) => identity[1] === next.identity[1]);
      expect(next).to.deep.equal({ expectedType: [ object.name, none.name, ], exclusive: false, isRequired: false, ...expected, });
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
        a: { [spec]: { array, }, },
        b: { [spec]: { array, }, },
        c: { [spec]: { array, }, },
        d: { [spec]: { array, }, },
        e: { [spec]: { array, }, },
        f: { [spec]: { array, }, },
        g: { [spec]: { array, }, },
      });
    expect(validationErrors.length).to.equal(7);

    const expectedErrors =[
      { identity: [ 'root', 'a', ], actualType: bool.name, state: true, }, { identity: [ 'root', 'b', ], actualType: string.name, state: 'abc', },
      { identity: [ 'root', 'c', ], actualType: func.name, state: emptyFunc, }, { identity: [ 'root', 'd', ], actualType: regex.name, state: testRegex, },
      { identity: [ 'root', 'e', ], actualType: symbol.name, state: helloSymbol, }, { identity: [ 'root', 'f', ], actualType: number.name, state: 123, },
      { identity: [ 'root', 'g', ], actualType: object.name, state: emptyObj, },
    ];

    for (let i = 0; i<validationErrors.length; i++) {
      const next = validationErrors[i];
      const expected = expectedErrors.find(({ identity, }) => identity[1] === next.identity[1]);
      expect(next).to.deep.equal({ expectedType: [ array.name, none.name, ], isRequired: false, exclusive: false, ...expected, });
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
        a: { [spec]: { anyLeaf, }, },
        b: { [spec]: { anyLeaf, }, },
      });
    expect(validationErrors.length).to.equal(2);
    expect(validationErrors[0]).to.deep.equal({ expectedType: [ anyLeaf.name, none.name, ], actualType: object.name, state: emptyObj, identity: [ 'root', 'a', ], isRequired: false, exclusive: false, });
    expect(validationErrors[1]).to.deep.equal({ expectedType: [ anyLeaf.name, none.name, ], actualType: array.name, state: emptyArr, identity: [ 'root', 'b', ], isRequired: false, exclusive: false, });

    expect(requiredFieldsErrors.length).to.equal(0);
    expect(invalidSpecTypesErrors.length).to.equal(0);
    expect(exclusiveFieldsErrors.length).to.equal(0);
  });

  it('Valid anyLeaf with any target', () => {
    refreshLists();
    createStore(
      { a: 123, 1: 'abc', gdsabafda: false, },
      {
        [anyKey]: { [spec]: { anyLeaf, }, },
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
        [anyKey]: { [spec]: { anyLeaf, }, },
        b: { [spec]: { number, isRequired, }, },
        c: { [spec]: { object, isRequired, }, },
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
      { [spec]: { object, exclusive, },
        a: { [spec]: { anyLeaf, }, },
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
      { [spec]: { object, },
        a: { [spec]: { anyLeaf, }, },
      });
    expect(validationErrors.length).to.equal(0);
    expect(invalidSpecTypesErrors.length).to.equal(0);
    expect(requiredFieldsErrors.length).to.equal(0);
    expect(exclusiveFieldsErrors.length).to.equal(0);
  });

  it('Invalid spec, missing spec.type', () => {
    const missingTypeStore = createStore(
      { b: {}, },
      { [spec]: { object, },
        b: { [spec]: {}, },
      });
    console.log(missingTypeStore.__substore_shape__);
    expect(!(missingTypeStore instanceof DevSubStore)).to.be.ok;
  });

  it('Invalid spec, missing spec', () => {
    const missingSpecStore = createStore(
      { b: {}, },
      { [spec]: { object, },
        b: {},
      });
    expect(!(missingSpecStore instanceof DevSubStore)).to.be.ok;
  });

  it('Invalid spec, leaf value has children', () => {
    let missingTypeStore = createStore(
      { b: {}, },
      { [spec]: { object, },
        b: { [spec]: { number, },
          c: { [spec]: { string, }, },
        },
      });
    expect(!(missingTypeStore instanceof DevSubStore)).to.be.ok;
    missingTypeStore = createStore(
      { b: {}, },
      { [spec]: { object, },
        b: { [spec]: { number, },
          c: { [spec]: { string, }, },
        },
      });
    expect(!(missingTypeStore instanceof DevSubStore)).to.be.ok;
    missingTypeStore = createStore(
      { b: {}, },
      { [spec]: { object, },
        b: { [spec]: { string, },
          c: { [spec]: { string, }, },
        },
      });
    expect(!(missingTypeStore instanceof DevSubStore)).to.be.ok;
    missingTypeStore = createStore(
      { b: {}, },
      { [spec]: { object, },
        b: { [spec]: { bool, },
          c: { [spec]: { string, }, },
        },
      });
    expect(!(missingTypeStore instanceof DevSubStore)).to.be.ok;
    missingTypeStore = createStore(
      { b: {}, },
      { [spec]: { object, },
        b: { [spec]: { regex, },
          c: { [spec]: { string, }, },
        },
      });
    expect(!(missingTypeStore instanceof DevSubStore)).to.be.ok;
    missingTypeStore = createStore(
      { b: {}, },
      { [spec]: { object, },
        b: { [spec]: { anyLeaf, },
          c: { [spec]: { string, }, },
        },
      });
    expect(!(missingTypeStore instanceof DevSubStore)).to.be.ok;
    missingTypeStore = createStore(
      { b: {}, },
      { [spec]: { object, },
        b: { [spec]: { symbol, },
          c: { [spec]: { string, }, },
        },
      });
    expect(!(missingTypeStore instanceof DevSubStore)).to.be.ok;
    missingTypeStore = createStore(
      { b: {}, },
      { [spec]: { object, },
        b: { [spec]: { func, },
          c: { [spec]: { string, }, },
        },
      });
    expect(!(missingTypeStore instanceof DevSubStore)).to.be.ok;
  });

  it('Valid anyValue', () => {
    refreshLists();
    createStore(
      { a: emptyObj, b: emptyArr, c: null, d: undefined, e: 0, f: false, g: '', h: testRegex, i: emptyFunc, j: helloSymbol, },
      {
        a: { [spec]: { anyValue, }, },
        b: { [spec]: { anyValue, }, },
        c: { [spec]: { anyValue, }, },
        d: { [spec]: { anyValue, }, },
        e: { [spec]: { anyValue, }, },
        f: { [spec]: { anyValue, }, },
        g: { [spec]: { anyValue, }, },
        h: { [spec]: { anyValue, }, },
        i: { [spec]: { anyValue, }, },
        j: { [spec]: { anyValue, }, },
      });
    expect(validationErrors.length).to.equal(0);

    expect(requiredFieldsErrors.length).to.equal(0);
    expect(invalidSpecTypesErrors.length).to.equal(0);
    expect(exclusiveFieldsErrors.length).to.equal(0);
  });

  it('required anyValue', () => {
    refreshLists();
    createStore(
      { a: emptyObj, b: emptyArr, e: 0, f: false, g: '', h: testRegex, i: emptyFunc, j: helloSymbol, },
      {
        a: { [spec]: { anyValue, isRequired, }, },
        b: { [spec]: { anyValue, isRequired, }, },
        e: { [spec]: { anyValue, isRequired, }, },
        f: { [spec]: { anyValue, isRequired, }, },
        g: { [spec]: { anyValue, isRequired, }, },
        h: { [spec]: { anyValue, isRequired, }, },
        i: { [spec]: { anyValue, isRequired, }, },
        j: { [spec]: { anyValue, isRequired, }, },
      });
    expect(validationErrors.length).to.equal(0);
    expect(requiredFieldsErrors.length).to.equal(0);
    expect(invalidSpecTypesErrors.length).to.equal(0);
    expect(exclusiveFieldsErrors.length).to.equal(0);
    createStore({ c: null, d: undefined, },
      {
        c: { [spec]: { anyValue, isRequired, }, },
        d: { [spec]: { anyValue, isRequired, }, },
      }
    );
    expect(validationErrors.length).to.equal(2);
    expect(requiredFieldsErrors.length).to.equal(0);
    expect(invalidSpecTypesErrors.length).to.equal(0);
    expect(exclusiveFieldsErrors.length).to.equal(0);
  });

  it('valid date', () => {
    refreshLists();
    createStore(
      { a: new Date(), },
      {
        a: { [spec]: { date, isRequired, }, },
      });
    expect(validationErrors.length).to.equal(0);
    expect(requiredFieldsErrors.length).to.equal(0);
    expect(invalidSpecTypesErrors.length).to.equal(0);
    expect(exclusiveFieldsErrors.length).to.equal(0);
  });
});
