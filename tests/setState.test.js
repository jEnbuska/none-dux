import { createStoreWithNonedux, } from './utils';

describe('setState', () => {
  [ 'legacy', 'proxy' ].forEach(name => {
    const init = state => createStoreWithNonedux(state, undefined, undefined, name === 'proxy');
    describe('run '+name+' configuration', () => {
      test(name+' change root state', () => {
        const { subject, }= init({ a: 1, });
        expect(subject.state).toEqual({ a: 1, });
        subject.setState({ a: 2, });
        expect(subject.state).toEqual({ a: 2, });
      });

      test(name + ' add a new values', () => {
        const { subject: { child, }, }= init({ child: { a: 1, b: { c: 2, d: 3, e: { f: 4, }, }, }, });
        child.setState({ x: 1, });
        expect(child.state).toEqual({ a: 1, b: { c: 2, d: 3, e: { f: 4, }, }, x: 1, });
      });

      test(name + ' leaf value to undefined', () => {
        const { subject, }= init({ a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, }, }, });
        subject.b.setState({ c: undefined, });
        expect(subject.state).toEqual({ a: 1, b: { c: undefined, d: 3, e: { f: 4, g: 7, }, }, });
      });
      test(name + ' set leaf value to null', () => {
        const { subject, }= init({ a: 1, b: { c: 2, d: 3, e: { f: 4, g: 7, }, }, });
        subject.b.setState({ c: null, });
        expect(subject.state).toEqual({ a: 1, b: { c: null, d: 3, e: { f: 4, g: 7, }, }, });
      });
      test(name + ' leaf into empty object', () => {
        const { subject, }= init({ child: {}, });
        subject.child.setState({ a: 1, });
        subject.child.setState({ a: {}, });
        expect(subject.child.state).toEqual({ a: {}, });
      });
      test(name + ' leaf into object', () => {
        const { subject, }= init({ child: {}, });
        subject.child.setState({ a: 1, b: { c: 2, d: 3, e: 1, }, });
        subject.child.b.setState({ e: { x: 2, }, });
        expect(subject.child.state).toEqual({ a: 1, b: { c: 2, d: 3, e: { x: 2, }, }, });
      });
      test(name + ' undefined leaf to object', () => {
        const { subject: { child, }, }= init({ child: { a: 1, b: 'hello', c: { d: undefined, }, }, });
        child.c.setState({ d: { x: { y: 13, }, }, });
        expect(child.state).toEqual({ a: 1, b: 'hello', c: { d: { x: { y: 13, }, }, }, });
      });
      test(name + ' null  leaf into object', () => {
        const { subject: { child, }, }= init({ child: {}, });
        child.setState({ 1: 1, b: { c: 2, d: 3, e: null, }, });
        child.b.setState({ e: { x: 2, }, });
        expect(child.state).toEqual({ 1: 1, b: { c: 2, d: 3, e: { x: 2, }, }, });
        expect(child.state[1]).toEqual(1);
      });

      test(name + ' undefined leaf to string', () => {
        const { subject: { child, }, }= init({ child: { a: 1, b: { c: undefined, d: 3, e: { f: 4, g: 7, h: { i: 100, x: {}, }, }, }, }, });
        child.setState({ b: { c: 'Hello test', }, });
        expect(child.state).toEqual({
          a: 1,
          b: { c: 'Hello test', },
        });
      });

      test(name + ' setState with a  primitive should throw error', () => {
        const { subject, }= init({ a: 1, b: { c: undefined, d: 3, e: { f: 4, }, }, });
        expect(() => subject.b.setState(2)).toThrow(Error);
      });

      test(name + ' immidiate string to empty object', () => {
        const { subject, }= init({ child: { a: 'hello', b: { c: undefined, d: 3, e: { f: 4, }, }, }, });
        subject.child.setState({ a: {}, });
        expect(subject.child.state).toEqual({ a: {}, b: { c: undefined, d: 3, e: { f: 4, }, }, });
      });

      test(name + ' immidiate string to non empty object', () => {
        const { subject: { child, }, }= init({ child: { a: 'hello', b: { c: undefined, d: 3, e: { f: 4, }, }, }, });
        child.setState({ a: { b: 'world', }, });
        expect(child.state).toEqual({ a: { b: 'world', }, b: { c: undefined, d: 3, e: { f: 4, }, }, });
      });

      test(name + ' non immidiate string to empty object', () => {
        const { subject, }= init({ b: { c: 'hello', d: 3, e: { f: 4, }, }, });
        subject.setState({ b: { c: {}, }, });
        expect(subject.state).toEqual({ b: { c: {}, }, });
      });

      test(name + ' non immidiate string to non empty object', () => {
        const { subject, }= init({ b: { c: 'hello', d: 3, e: { f: 4, }, }, });
        subject.setState({ b: { c: { x: 1, y: 'test', }, }, });
        expect(subject.state).toEqual({ b: { c: { x: 1, y: 'test', }, }, });
      });
    });
  });
});
