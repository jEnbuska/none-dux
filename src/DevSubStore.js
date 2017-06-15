import SubStore from './SubStore';
import { TARGET_ANY, TYPE, TYPE_ANY, VALIDATE, } from './createStore';

export default class DevSubStore extends SubStore {

  constructor(initialValue, key, parent, depth, _shape) {
    super(initialValue, key, parent, depth, _shape);
    this._validate();
  }

  remove(...ids) {
    super.remove(...ids);
    this._validate();
    return this;
  }

  _createSubStore(initialState, key, parent, depth, _shape = {}) {
    this[key] = new DevSubStore(initialState, key, parent, depth, _shape[key] || _shape[TARGET_ANY]);
  }
  _merge(obj, prevState) {
    super._merge(obj, prevState);
    this._validate();
  }

  _reset(nextState, prevState) {
    super._reset(nextState, prevState);
    this._validate();
  }

  _validate() {
    const { _shape, state, } = this;
    if (_shape) {
      if (_shape instanceof Object) {
        const { [TYPE]: type, [VALIDATE]: validate, } = _shape;
        if (type) {
          if (typeof type === 'string') {
            if (!(typeof state === type || type === TYPE_ANY)) {
              DevSubStore.onValidationError('Validation failed.\n' +
                'Target: '+JSON.stringify(this._identity) + '\n' +
                'State: '+JSON.stringify(state, null, 1) + '\n' +
                'Expected: '+type+' but received '+(typeof state));
            }
          } else if (typeof type === 'object') {
            if (!type.some(type => typeof state === type)) {
              DevSubStore.onValidationError('Validation failed.\n' +
                'Target '+JSON.stringify(this._identity)+'\n'+
                'State: '+JSON.stringify(state, null, 1) +'\n'+
                'Expected some of types '+JSON.stringify(type) + '\n'+
                'But got '+(typeof state));
            }
          }
        }
        if (validate) {
          try {
            if (!validate(state)) {
              throw new Error();
            }
          } catch (ignore) {
            DevSubStore.onValidationError('Custom validation failed.\n'+
              'Target: '+ JSON.stringify(this._identity) +'\n'+
              'State: '+ JSON.stringify(state, null, 1));
          }
        }
      }
    } else {
      DevSubStore.onValidationError(`Validator is not defined for ${JSON.stringify(this._identity)}`);
    }
  }

  static onValidationError(msg) {
    console.error(msg);
  }
}