import { Store, Obj, Numb, } from '../src/shape/index.js';

let React;
let ReactTestUtils;
let ReactTestRenderer;
describe('jsx shape', () => {
  beforeEach(() => {
    jest.resetModules();
    ReactTestRenderer = require('react-test-renderer');
    React = require('react');
    ReactTestUtils = require('react-dom/test-utils');
  });

  test('create jsx shape without crashing', () => {
    let store;
    ReactTestRenderer.create(<Store ref={(ref) => { store = ref; }}><Obj isRequired name='myObj' /></Store>);
    expect(store).toBeDefined();
  });
  test('create required Leaf type without default value', () => {
    const creation = () => ReactTestRenderer.create(<Store ref={(ref) => { store = ref; }}><Numb isRequired name='myNumb' /></Store>);
    expect(creation).toThrowError('Required field "root, myNumb"\nType: Number is missing default value');
  });

  test('create required leaf type with default value', () => {
    let one;
    ReactTestRenderer.create(<Store ><Numb ref={ref => { one=ref; }} isRequired name='myNumb' defaultValue={1} /></Store>);
    expect(one.state.data).toEqual(1);
    expect(one.context.identity).toEqual([ 'root', ]);
    expect(one.context.data).toEqual({ myNumb: 1, });
  });

  test('create store having leaf with initialState', () => {
    let one;
    ReactTestRenderer.create(<Store initialState={{ myNumb: 2, }}><Numb ref={ref => { one=ref; }} isRequired name='myNumb' defaultValue={1} /></Store>);
    expect(one.state.data).toEqual(2);
    expect(one.context.identity).toEqual([ 'root', ]);
    expect(one.context.data).toEqual({ myNumb: 2, });
  });

  test('givin default value to Parent shape should throw error', () => {
    let obj;
    const create1 = ReactTestRenderer.create(<Store initialState={{ myObj: { a: 1, }, }}>
      <Obj name='myObj' ref={ref => { obj=ref; }} isRequired defaultValue={{ test: 1, }} />
    </Store>);
    expect(create1).toThrowError('Object: "root, myObj"\nDoes not take initialState nor defaultValue as prop');
  });

  test('create store having object that has leaf', () => {
    let obj;
    ReactTestRenderer.create(<Store initialState={{ myObj: { a: 1, }, }}><Obj ref={ref => { obj=ref; }} isRequired name='myObj' /></Store>);
    expect(obj.state.data).toEqual({ a: 1, });
    expect(obj.getChildContext()).toEqual({ identity: [ 'root', 'myObj', ], data: { a: 1, }, });
  });
});
