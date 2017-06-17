import Provider from './Provider';
import connect from './connect';
import SubStore from './SubStore';
import { string, number, spec, any, object, array, exclusive, isRequired, none, bool, } from './createStore';

const shapes = { string, number, spec, any, object, array, exclusive, isRequired, none, bool, };
export { Provider, connect, shapes, SubStore, };