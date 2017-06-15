import SubStore from './SubStore';
import { TARGET_ANY, TYPE, TYPE_ANY, VALIDATE, } from './createStore';

export default class DevSubStore extends SubStore {

  constructor(initialValue, key, parent, depth, shape) {
    super(initialValue, key, parent, depth, shape);
    this._validate();
  }

  remove(...ids) {
    super.remove(...ids);
    this._validate();
    return this;
  }

  _createSubStore(initialState, key, parent, depth, shape = {}) {
    this[key] = new DevSubStore(initialState, key, parent, depth, shape[key] || shape[TARGET_ANY]);
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
    const { shape, state, } = this;
    if (shape) {
      if (shape instanceof Object) {
        const { [TYPE]: $typeof, [VALIDATE]: validate, } = shape;
        if ($typeof) {
          if (typeof $typeof === 'string') {
            if (!(typeof state === $typeof || $typeof === TYPE_ANY)) {
              DevSubStore.onValidationError('Validation failed.\n' +
                'Target: '+JSON.stringify(this._identity, null, 1) + '\n' +
                'State: '+JSON.stringify(state, null, 1) + '\n' +
                'Expected: '+$typeof+' but received '+(typeof state));
            } else if (typeof $typeof === 'object') {
              if (!$typeof.some(type => typeof state === type)) {
                DevSubStore.onValidationError('Validation failed\n.' +
                'Target '+JSON.stringify(this._identity, null, 1)+'\n'+
                'State: '+JSON.stringify(state, null, 1) +'\n'+
                'Expected some of type '+JSON.stringify($typeof, null, 1) + '\n'+
                'But got '+(typeof state));
              }
            }
          }
        }
        if (validate) {
          try{
            if(!validate(state)){
              throw new Error();
            }
          }catch (ignore){
            DevSubStore.onValidationError('Custom validation failed\n.'+
              'Target: '+ JSON.stringify(this._identity, null, 1) +'\n'+
              'State: '+ JSON.stringify(state, null, 1));
          }
        }
      }
    } else {
      DevSubStore.onValidationError(`Validator is not defined for ${JSON.stringify(this._identity, null, 1)}`);
    }
  }

  static onValidationError(msg) {
    console.error(msg);
  }
}