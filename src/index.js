import Provider from './Provider';
import connect from './connect';
import SubStore from './SubStore';
import createStore, { string, number, spec, any, object, array, exclusive, isRequired, bool, } from './createStore';

const shapes = { string, number, spec, any, object, array, exclusive, isRequired, bool, };
export { Provider, connect, shapes, SubStore, };