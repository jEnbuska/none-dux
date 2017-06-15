import SubStore from './SubStore';
import { ANY, TYPE_OF, VALIDATE, } from './createStore';

export default class DevSubStore extends SubStore {

  constructor(initialValue, key, parent, depth, model) {
    super(initialValue, key, parent, depth, model);
    this._validate();
  }

  remove(...ids) {
    super.remove(...ids);
    this._validate();
    return this;
  }

  _createSubStore(initialState, key, parent, depth, model = {}) {
    super._createSubStore(initialState, key, parent, depth, model[key] || model[ANY]);
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
    const { model, state, } = this;
    if (model) {
      if (model instanceof Object) {
        const { [TYPE_OF]: $typeof, [VALIDATE]: validate, } = model;
        if ($typeof) {
          if (typeof $typeof === 'string') {
            if (!($typeof === ANY || typeof value === $typeof)) {
              DevSubStore.onValidationError(`Validation failed.
              Target ${JSON.stringify(this._identity, null, 1)}
              State: ${JSON.stringify(state, null, 1)}
              Expected ${$typeof} but received ${typeof value}`);
            } else if (typeof $typeof === 'object') {
              if (!$typeof.some(type => type === ANY || typeof value === type)) {
                DevSubStore.onValidationError(`Validation failed.
                Target ${JSON.stringify(this._identity, null, 1)}
                State: ${JSON.stringify(state, null, 1)}
                Expected some of type ${JSON.stringify($typeof, null, 1)}
                But got ${typeof state}`);
              }
            }
          }
        } else if (validate) {
          if (!validate(state)) {
            DevSubStore.onValidationError(`Custom validation failed.
              Target ${JSON.stringify(this._identity, null, 1)}
              State: ${JSON.stringify(state, null, 1)}`);
          }
        } else {
          DevSubStore.onValidationError(`
          invalid validator ${JSON.stringify(model, null, 1)}
          given to', ${JSON.stringify(this._identity, null, 1)}`);
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