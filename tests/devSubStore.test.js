import TestProvider from './TestProvider';
import DevSubStore from '../src/DevSubStore';
import Definition from '../src/shape/Definition';
import { Obj, Arr, } from '../src/shape/Parents';
import { Numb, Str, Bool, } from '../src/shape/Leafs';

Definition.onInitializeWarn = () => {};

let validationErrors;
let exclusiveErrors;
let missingRequiredFieldErrors;
let store;

// cannot overrider DevSubStore static function for some reason....

describe('DevSubStore console.erros', () => {
  let React;
  let ReactTestUtils;
  let ReactTestRenderer;
  beforeEach(() => {
    store = null;
    jest.resetModules();
    ReactTestRenderer = require('react-test-renderer');
    React = require('react');
    ReactTestUtils = require('react-dom/test-utils');
    validationErrors = [];
    exclusiveErrors = [];
    missingRequiredFieldErrors = [];
  });

  test('Obj missing fields', () => {
    ReactTestRenderer.create(
      <TestProvider onStoreReady={it => { store = it; }}>
        <Definition>
          <Obj name='b'>
            <Obj name='c'>
              <Numb name='d' isRequired />
              <Numb name='e' initial={1} />
            </Obj>
            <Obj name='f' isRequired initial={false}>
              <Numb name='g' />
              <Str name='h' initial={'test'} />
            </Obj>
          </Obj>
        </Definition>
      </TestProvider>);
  });

  test('Obj missing fields (onlyState)', () => {
    ReactTestRenderer.create(
      <TestProvider onStoreReady={it => {}}>
        <Definition>
          <Obj name='b' stateOnly>
            <Obj name='c'>
              <Numb name='d' isRequired />
              <Numb name='e' initial={1} />
            </Obj>
            <Obj name='f' isRequired initial={false}>
              <Numb name='g' />
              <Str name='h' initial={'test'} />
            </Obj>
          </Obj>
        </Definition>
      </TestProvider>);
  });

  test('Obj (onlyState) missing field in one of many object', () => {
    ReactTestRenderer.create(
      <TestProvider onStoreReady={it => { store = it; }}>
        <Definition>
          <Obj name='b' stateOnly>
            <Obj many>
              <Numb name='c' isRequired />
              <Numb name='d' initial={1} />
            </Obj>
          </Obj>
        </Definition>
      </TestProvider>);
    store.setState({ b: { x: { d: 2, }, }, });
  });

  test('Obj strict violation', () => {
    ReactTestRenderer.create(
      <TestProvider onStoreReady={it => { store = it; }}>
        <Definition>
          <Obj name='b'>
            <Obj name='c'>
              <Numb name='d' isRequired />
              <Numb name='e' initial={1} />
            </Obj>
            <Obj name='f' isRequired initial={false}>
              <Numb name='g' />
              <Str name='h' initial={'test'} />
            </Obj>
          </Obj>
        </Definition>
      </TestProvider>);
    store.b.c.setState({ x: 1, });
  });

  test('Obj strict violation (onlyState)', () => {
    ReactTestRenderer.create(
      <TestProvider onStoreReady={it => { store=it; }}>
        <Definition>
          <Obj name='b' stateOnly>
            <Obj name='c'>
              <Numb name='d' isRequired />
              <Numb name='e' initial={1} />
            </Obj>
            <Obj name='f' isRequired initial={false}>
              <Numb name='g' />
              <Str name='h' initial={'test'} />
            </Obj>
          </Obj>
        </Definition>
      </TestProvider>);
    store.setState({ b: { c: { e: 2, }, }, });
  });

  test('Obj (onlyState) missing field in one of many object', () => {
    ReactTestRenderer.create(
      <TestProvider onStoreReady={it => { store = it; }}>
        <Definition>
          <Obj name='b' stateOnly>
            <Obj many>
              <Numb name='c' isRequired />
              <Numb name='d' initial={1} />
            </Obj>
          </Obj>
        </Definition>
      </TestProvider>);
    store.setState({ b: { x: { d: 2, }, }, });
  });
});