import { Definition, Obj, Numb, Err, Symb, Rgx, Str, Bool, Func, Dt, Arr, } from '../src/shape/index.js';
import { isRequired, strict, type, leaf, } from '../src/shape/shapeTypes.js';
import TestProvider from './TestProvider';

let React;
let ReactTestUtils;
let ReactTestRenderer;

Definition.onInitializeWarn = () => {};

const { assign, } = Object;

describe('jsx shape', () => {
  let values;
  beforeEach(() => {
    values = {};
    jest.resetModules();
    ReactTestRenderer = require('react-test-renderer');
    React = require('react');
    ReactTestUtils = require('react-dom/test-utils');
  });

  test('create jsx shape without crashing', () => {
    let store;
    ReactTestRenderer.create(
      <TestProvider onStoreReady={() => {}}>
        <Definition ref={(ref) => { store = ref; }}>
          <Obj isRequired name='myObj' />
        </Definition>
      </TestProvider>
        );
    expect(store).toBeDefined();
  });

  test('create required Leaf type without initialState', () => {
    [
      { comp: <Numb isRequired name='val' />, valType: 'Number', },
      { comp: <Numb name='val' />, valType: 'Number', },
      { comp: <Str isRequired name='val' />, valType: 'String', },
      { comp: <Str name='val' />, valType: 'String', },
      { comp: <Err isRequired name='val' />, valType: 'Error', },
      { comp: <Err name='val' />, valType: 'Error', },
      { comp: <Symb isRequired name='val' />, valType: 'Symbol', },
      { comp: <Symb name='val' />, valType: 'Symbol', },
      { comp: <Bool isRequired name='val' />, valType: 'Boolean', },
      { comp: <Bool name='val' />, valType: 'Boolean', },
      { comp: <Rgx isRequired name='val' />, valType: 'RegExp', },
      { comp: <Rgx name='val' />, valType: 'RegExp', },
      { comp: <Func isRequired name='val' />, valType: 'Function', },
      { comp: <Func name='val' />, valType: 'Function', },
      { comp: <Dt isRequired name='val' />, valType: 'Date', },
      { comp: <Dt name='val' />, valType: 'Date', },
    ].forEach(({ comp, valType, }, i) => {
      values = {};
      ReactTestRenderer.create(
        <TestProvider onStoreReady={(store, shape) => assign(values, { store, shape, })}>
          <Definition>
            {comp}
          </Definition>
        </TestProvider>);
      expect(values.shape.state).toEqual({ [strict]: true, [type]: 'Object', val: { [type]: valType, [isRequired]: i % 2 === 0, [leaf]: true, }, });
      expect(values.store.state).toEqual({ val: undefined, });
    });
  });

  test('create leaf type with initial state', () => {
    const err = new Error();
    const symb = Symbol('');
    const rgx = /test/;
    const func = () => {};
    const dt = Date.now();
    [
      { comp: <Numb isRequired name='val' initial={0} />, valType: 'Number', value: 0, },
      { comp: <Numb name='val' initial={1} />, valType: 'Number', value: 1, },
      { comp: <Str isRequired name='val' initial={''} />, valType: 'String', value: '', },
      { comp: <Str name='val' initial={''} />, valType: 'String', value: '', },
      { comp: <Err isRequired name='val' initial={err} />, valType: 'Error', value: err, },
      { comp: <Err name='val' initial={err} />, valType: 'Error', value: err, },
      { comp: <Symb isRequired name='val' initial={symb} />, valType: 'Symbol', value: symb, },
      { comp: <Symb name='val' initial={symb} />, valType: 'Symbol', value: symb, },
      { comp: <Bool isRequired name='val' initial={false} />, valType: 'Boolean', value: false, },
      { comp: <Bool name='val' initial={false} />, valType: 'Boolean', value: false, },
      { comp: <Rgx isRequired name='val' initial={rgx} />, valType: 'RegExp', value: rgx, },
      { comp: <Rgx name='val' initial={rgx} />, valType: 'RegExp', value: rgx, },
      { comp: <Func isRequired name='val' initial={func} />, valType: 'Function', value: func, },
      { comp: <Func name='val' initial={func} />, valType: 'Function', value: func, },
      { comp: <Dt isRequired name='val' initial={dt} />, valType: 'Date', value: dt, },
      { comp: <Dt name='val' initial={dt} />, valType: 'Date', value: dt, },
    ].forEach(({ comp, valType, value, }, i) => {
      values = {};
      ReactTestRenderer.create(
        <TestProvider onStoreReady={(store, shape) => assign(values, { store, shape, })}>
          <Definition>
            {comp}
          </Definition>
        </TestProvider>);
      expect(values.shape.state).toEqual({ [strict]: true, [type]: 'Object', val: { [type]: valType, [isRequired]: i % 2 === 0, [leaf]: true, }, });
      expect(values.store.state).toEqual({ val: value, });
    });
  });

  test('override leafs initial state by context', () => {
    const err = new Error();
    const err2 = new Error('something');
    const symb = Symbol('');
    const symb2 = Symbol('something');
    const rgx = /test/;
    const rgx2 = '/test2/';
    const func = () => {};
    const func2 = () => {};
    const dt = Date.now();
    const dt2 = new Date().setDate(0);
    [
      { comp: <Numb isRequired name='val' initial={0} />, valType: 'Number', value: 0, override: 1, },
      { comp: <Numb name='val' initial={1} />, valType: 'Number', value: 1, override: 0, },
      { comp: <Str isRequired name='val' initial={''} />, valType: 'String', value: '', override: 'something', },
      { comp: <Str name='val' initial={''} />, valType: 'String', value: 'something', overrider: '', },
      { comp: <Err isRequired name='val' initial={err} />, valType: 'Error', value: err, overrider: undefined, },
      { comp: <Err name='val' initial={err} />, valType: 'Error', value: err, overrider: err2, },
      { comp: <Symb isRequired name='val' initial={symb} />, valType: 'Symbol', value: symb, override: symb2, },
      { comp: <Symb name='val' initial={symb} />, valType: 'Symbol', value: symb, overrider: undefined, },
      { comp: <Bool isRequired name='val' initial={false} />, valType: 'Boolean', value: false, override: true, },
      { comp: <Bool name='val' initial={false} />, valType: 'Boolean', value: true, override: false, },
      { comp: <Rgx isRequired name='val' initial={rgx} />, valType: 'RegExp', override: undefined, },
      { comp: <Rgx name='val' initial={rgx} />, valType: 'RegExp', value: rgx, override: rgx2, },
      { comp: <Func isRequired name='val' initial={func} />, valType: 'Function', value: func, override: func2, },
      { comp: <Func name='val' initial={func} />, valType: 'Function', value: func, override: undefined, },
      { comp: <Dt isRequired name='val' initial={dt} />, valType: 'Date', value: dt, overrider: dt2, },
      { comp: <Dt name='val' initial={dt} />, valType: 'Date', value: dt, override: undefined, },
    ].forEach(({ comp, valType, override, }, i) => {
      values = {};
      ReactTestRenderer.create(
        <TestProvider onStoreReady={(store, shape) => assign(values, { store, shape, })}>
          <Definition initial={{ val: override, }}>
            {comp}
          </Definition>
        </TestProvider>);
      expect(values.shape.state).toEqual({ [strict]: true, [type]: 'Object', val: { [type]: valType, [isRequired]: i % 2 === 0, [leaf]: true, }, });
      expect(values.store.state).toEqual({ val: override, });
    });
  });

  test('override objects initial state by context', () => {
    [
      { comp: <Obj name='val' initial={undefined} />, valType: 'Object', value: undefined, override: {}, },
      { comp: <Obj name='val' initial />, valType: 'Object', value: {}, override: { a: 1, }, },
      { comp: <Obj name='val' initial={{ a: 1, }} />, valType: 'Object', value: { a: 2, }, override: {}, },
      { comp: <Arr name='val' initial={[]} />, valType: 'Array', value: [], override: [ 1, 2, 3, ], },
      { comp: <Arr name='val' initial={[ { a: 1, }, 1, 2, ]} />, valType: 'Array', value: [ { a: 1, }, 1, 2, ], overrider: [], },

    ].forEach(({ comp, valType, override, }, i) => {
      values = {};
      ReactTestRenderer.create(
        <TestProvider onStoreReady={(store, shape) => assign(values, { store, shape, })}>
          <Definition initial={{ val: override, }}>
            {comp}
          </Definition>
        </TestProvider>
      );
      expect(values.shape.state).toEqual({ [strict]: true, [type]: 'Object', val: { [type]: valType, [isRequired]: false, [leaf]: false, [strict]: true, }, });
      expect(values.store.state).toEqual({ val: override, });
    });
  });

  test('override leafs initial state by objects and objects, then by initial state by context', () => {
    [
      { comp: <Obj name='val' initial={{ leafValue: 2, }}><Numb name='leafValue' initial={1} /></Obj>, valType: 'Number', value: undefined, override: { val: { leafValue: 3, }, }, },
      { comp: <Obj name='val' initial={{ leafValue: 'something', }}><Str name='leafValue' initial={''} /></Obj>, valType: 'String', value: {}, override: { val: { leafValue: 'something else', }, }, },
      { comp: <Obj name='val' initial={undefined}><Numb name='leafValue' /></Obj>, valType: 'Number', value: { a: 2, }, override: { val: { leafValue: 3, }, }, },
      { comp: <Obj name='val' initial={undefined}><Numb name='leafValue' /></Obj>, valType: 'Number', value: { a: 2, }, override: { val: { leafValue: undefined, }, }, },
      { comp: <Obj name='val' initial={{ leafValue: 1, }}><Numb name='leafValue' /></Obj>, valType: 'Number', value: { a: 2, }, override: { val: undefined, }, },
    ].forEach(({ comp, valType, override, }) => {
      values = {};
      ReactTestRenderer.create(
        <TestProvider onStoreReady={(store, shape) => assign(values, { store, shape, })}>
          <Definition initial={override}>
            {comp}
          </Definition>
        </TestProvider>);
      expect(values.shape.state).toEqual({ [strict]: true, [type]: 'Object', val: { [type]: 'Object', [isRequired]: false, [leaf]: false, [strict]: true, leafValue: { [type]: valType, [isRequired]: false, [leaf]: true, }, }, });
      expect(values.store.state).toEqual(override);
    });
  });

  test('override leafs initial state by objects and objects, then by initial state by context', () => {
    [
      { comp: <Obj name='val' initial={{ leafValue: 2, }}><Numb name='leafValue' initial={1} /></Obj>, valType: 'Number', value: undefined, override: { val: { leafValue: 3, }, }, },
      { comp: <Obj name='val' initial={{ leafValue: 'something', }}><Str name='leafValue' initial={''} /></Obj>, valType: 'String', value: {}, override: { val: { leafValue: 'something else', }, }, },
      { comp: <Obj name='val' initial={undefined}><Numb name='leafValue' /></Obj>, valType: 'Number', value: { a: 2, }, override: { val: { leafValue: 3, }, }, },
      { comp: <Obj name='val' initial={undefined}><Numb name='leafValue' /></Obj>, valType: 'Number', value: { a: 2, }, override: { val: { leafValue: undefined, }, }, },
      { comp: <Obj name='val' initial={{ leafValue: 1, }}><Numb name='leafValue' /></Obj>, valType: 'Number', value: { a: 2, }, override: { val: undefined, }, },
    ].forEach(({ comp, valType, override, }) => {
      values = {};
      ReactTestRenderer.create(
        <TestProvider onStoreReady={(store, shape) => assign(values, { store, shape, })}>
          <Definition initial={override}>
            {comp}
          </Definition>
        </TestProvider>);
      expect(values.shape.state).toEqual({ [strict]: true, [type]: 'Object', val: { [type]: 'Object', [isRequired]: false, [leaf]: false, [strict]: true, leafValue: { [type]: valType, [isRequired]: false, [leaf]: true, }, }, });
      expect(values.store.state).toEqual(override);
    });
  });
});
