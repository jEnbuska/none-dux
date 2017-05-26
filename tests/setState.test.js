import { expect, } from 'chai';
import createStore from '../src/createStore';

describe('setState', () => {
  let store;
  it('change root state', () => {
    store = createStore({ a: 1, });
    expect(store.state).to.deep.equal({ a: 1, });
    store.setState({ a: 2, });
    expect(store.state).to.deep.equal({ a: 2, });
  });

  it('add a new values', () => {
    store = createStore({ a: 1, b: { c: 2, d: 3, e: { f: 4, }, }, });
    store.setState({ x: 1, });
    expect(store.state).to.deep.equal({ a: 1, b: { c: 2, d: 3, e: { f: 4, }, }, x: 1, });
  });

  it('leaf value to undefined', () => {
    store = createStore({ a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, }, }, });
    store.b.setState({ c: undefined, });
    expect(store.state).to.deep.equal({ a: 1, b: { c: undefined, d: 3, e: { f: 4, g: 7, }, }, });
  });
  it('set leaf value to null', () => {
    store = createStore({ a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, }, }, });
    store.b.setState({ c: null, });
    expect(store.state).to.deep.equal({ a: 1, b: { c: null, d: 3, e: { f: 4, g: 7, }, }, });
  });
  it('leaf into empty object', () => {
    store = createStore({});
    store.setState({ a: 1, });
    store.setState({ a: {}, });
    expect(store.state).to.deep.equal({ a: {}, });
  });
  it('leaf into object', () => {
    store = createStore({});
    store.setState({ a: 1, b: { c: 2, d: 3, e: 1, }, });
    store.b.setState({ e: { x: 2, }, });
    expect(store.state).to.deep.equal({ a: 1, b: { c: 2, d: 3, e: { x: 2, }, }, });
  });
  it('undefined leaf to object', () => {
    store = createStore({ a: 1, b: 'hello', c: { d: undefined, }, });
    store.c.d.setState({ x: { y: 13, }, });
    expect(store.state).to.deep.equal({ a: 1, b: 'hello', c: { d: { x: { y: 13, }, }, }, });
  });
  it('null  leaf into object', () => {
    store = createStore({});
    store.setState({ 1: 1, b: { c: 2, d: 3, e: null, }, });
    store.b.setState({ e: { x: 2, }, });
    expect(store.state).to.deep.equal({ 1: 1, b: { c: 2, d: 3, e: { x: 2, }, }, });
    expect(store[1].state).to.deep.equal(1);
  });

  it('undefined leaf to string', () => {
    store = createStore({ a: 1, b: { c: undefined, d: 3, e: { f: 4, g: 7, h: { i: 100, x: {}, }, }, }, });
    store.setState({ b: { c: 'Hello test', }, });
    expect(store.state).to.deep.equal({
      a: 1,
      b: { c: 'Hello test', },
    });
  });

  it('setState with a  primitive', () => {
    store = createStore({ a: 1, b: { c: undefined, d: 3, e: { f: 4, }, }, });
    store.b.setState(2);
    expect(store.state).to.deep.equal({ a: 1, b: 2, });
  });

  it('immidiate string to empty object', () => {
    store = createStore({ a: 'hello', b: { c: undefined, d: 3, e: { f: 4, }, }, });
    store.setState({ a: {}, });
    expect(store.state).to.deep.equal({ a: {}, b: { c: undefined, d: 3, e: { f: 4, }, }, });
  });

  it('immidiate string to non empty object', () => {
    store = createStore({ a: 'hello', b: { c: undefined, d: 3, e: { f: 4, }, }, });
    store.setState({ a: { b: 'world', }, });
    expect(store.state).to.deep.equal({ a: { b: 'world', }, b: { c: undefined, d: 3, e: { f: 4, }, }, });
  });

  it('non immidiate string to empty object', () => {
    store = createStore({ b: { c: 'hello', d: 3, e: { f: 4, }, }, });
    store.setState({ b: { c: {}, }, });
    expect(store.state).to.deep.equal({ b: { c: {}, }, });
  });

  it('non immidiate string to non empty object', () => {
    store = createStore({ b: { c: 'hello', d: 3, e: { f: 4, }, }, });
    store.setState({ b: { c: { x: 1, y: 'test', }, }, });
    expect(store.state).to.deep.equal({ b: { c: { x: 1, y: 'test', }, }, });
  });
});
