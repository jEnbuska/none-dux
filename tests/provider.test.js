import Provider from '../src/Provider';
import Definition from '../src/shape/Definition';
import { Obj, } from '../src/shape/Parents';

let React;
let ReactTestUtils;
let ReactTestRenderer;

describe('Provider', () => {
  beforeEach(() => {
    jest.resetModules();
    ReactTestRenderer = require('react-test-renderer');
    React = require('react');
    ReactTestUtils = require('react-dom/test-utils');
  });

  test('expect provider to mount without exception when given initialState ', () => {
    ReactTestRenderer.create(
      <Provider initialState={{}}>
        <div />
      </Provider>
    );
  });

  test('expect provider to mount without exception when given Definition', () => {
    const definition = (
      <Definition>
        <Obj name='hello' />
      </Definition>
    );
    ReactTestRenderer.create(
      <Provider definition={definition}>
        <div />
      </Provider>
    );
  });
});
