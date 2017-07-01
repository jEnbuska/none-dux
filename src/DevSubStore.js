import SubStore from './SubStore';
import { strict, isRequired, type, leaf, many, stateOnly, } from './shape/shapeTypes';
import { checkers, getShapesChildren, getValueTypeName, } from './shape/utils';
import { valueCouldBeSubStore, stringify} from './common';

const { entries, } = Object;

export default class DevSubStore extends SubStore {

  static verbose = true;

  constructor(initialValue, key, parent, depth, shape) {
    super(initialValue, key, parent, depth, shape);
    DevSubStore.afterChanged(this);
    if (shape[stateOnly]) {
      DevSubStore.onStateOnlyViolation(this.getIdentity());
    }
  }

  remove(...ids) {
    super.remove(...ids);
    DevSubStore.afterChanged(this);
    return this;
  }

  _createSubStore(initialState, key, parent) {
    const { __substore_depth__: depth, __substore_shape__: shape = {}, } = this;
    const subShape = shape[key] || shape[many];
    if (subShape) {
      this[key] = new DevSubStore(initialState, key, parent, depth + 1, subShape);
    } else {
      this[key] = new SubStore(initialState, key, parent, depth + 1, subShape);
      if (shape[strict]) {
        DevSubStore.onExclusiveViolation({ key, target: this, shape, value: this[key].state, });
      }
    }
    return this[key];
  }

  _merge(obj, prevState) {
    super._merge(obj, prevState);
    DevSubStore.afterChanged(this);
    return this;
  }

  _reset(nextState, prevState) {
    if (nextState instanceof Array) {
      if (DevSubStore.verbose) {
        console.warn('Arrays in state can be behave unintuitively, consider using objects instead');
        DevSubStore.verbose=false;
      }
      if (!(prevState instanceof Array) && SubStore.couldBeParent(nextState)) {
        console.warn('transforming state of '+JSON.stringify(this.__substore_identity__)+' from object into array');
      }
    } else if (prevState instanceof Array && SubStore.couldBeParent(nextState)) {
      console.warn('transforming state of '+JSON.stringify(this.__substore_identity__)+' from array to object');
    }
    super._reset(nextState, prevState);
    DevSubStore.afterChanged(this);
    return this;
  }

  static afterChanged(target) {
    const { state, __substore_shape__: shape, __substore_identity__: identity, prevState, } = target;
    const { [strict]: s, [type]: t, [isRequired]: r, [leaf]: l, } = shape;
    if (s) {
      DevSubStore.checkExclusiveValidations(s, state, prevState, shape, identity);
    }
    if (!checkers[t](state) && (r || (!r && !checkers.none(state)))) {
      DevSubStore.onValidationError({
        state,
        expected: t,
        actual: getValueTypeName(state),
        isRequired: r,
        strict: s,
      });
      entries(state)
        .filter(([ _, v, ]) => !valueCouldBeSubStore(v))
        .filter(([ k, ]) => !prevState || state[k]!==prevState[k])
        .filter(([ k, ]) => shape[k])
        .filter(([ k, v, ]) => !checkers[shape[k].type](v))
        .filter(([ _, v, ]) => v[isRequired] || (!v[isRequired] && !checkers.none(state)))
        .forEach(([ key, childState, ]) => {
          const { [type]: cT, [isRequired]: cR, [strict]: cS, } = shape[key];
          DevSubStore.onValidationError({
            state: childState,
            expected: cT,
            actual: getValueTypeName(childState),
            identity: [ ...identity, key, ],
            isRequired: cR,
            strict: cS,
          });
        });
    }
    DevSubStore.ensureRequiredFields(target);
    entries(getShapesChildren(shape))
      .filter(([ _, { [stateOnly]: sOnly, [leaf]: l, }, ]) => sOnly && !l)
      .filter(([ k, ]) => state[k])
      .forEach(([ k, v, ]) => {
        try {
          DevSubStore.checkStorelessStateRecursively(state[k], v, [ ...identity, k, ]);
        } catch (_) { /* ignore*/ }
      });
  }

  static checkExclusiveValidations(strict, state, prevState, shape, identity) {
    if (strict) {
      entries(state)
        .filter(([ k, ]) => !shape[k])
        .filter(([ k, ]) => !prevState || state[k] !== prevState[k])
        .forEach(([ key, value, ]) => {
          DevSubStore.onExclusiveViolation({ key, value, identity, shape, });
        });
    }
  }

  static ensureRequiredFields(target) {
    const { __substore_shape__: shape, __substore_identity__: identity, state, prevState, } = target;
    const children = getShapesChildren(shape);
    const missingRequiredFields = entries(children)
      .filter(([ k, v, ]) => state[k]===undefined || !prevState || state[k]!==prevState[k])
      .filter(([ _, v, ]) => v[isRequired])
      .filter(([ k, ]) => !state.hasOwnProperty(k))
      .map(([ k, ]) => k);
    if (missingRequiredFields.length) {
      DevSubStore.onMissingRequiredFields({ identity, missingRequiredFields, });
    }
  }

  static onExclusiveViolation({ key, identity, shape, value, }) {
    const children = getShapesChildren(shape);
    console.error('Validation prompt: '+identity.join(', ')+'\n'+
      'Has no validation for key: ' + key + '\n' +
      'With value: '+stringify(value)+'\n'+
      'Expected\n'+ entries(children).map(([ k, v, ]) => k + ': ' + v[type]).join('\n')+
      'Add the necessary validations, or add prop "loose" to the target, to avoid further prompts.'
    );
  }

  static onValidationError({ expected, actual, state, identity, isRequired, }) {
    console.error('Validation prompt:\n'+
    'Expected type: '+expected+'\n'+
    'But got: '+actual+'\n'+
    'Target: '+identity.join(' ,')+'\n'+
    'isRequired: '+isRequired+'\n'+
    'State: '+stringify(state));
  }

  static onMissingRequiredFields({ identity, missingRequiredFields, }) {
    console.error('Validation prompt:\n'+
    'Missing required fields: '+missingRequiredFields+'\n'+
    'Target: "'+identity.join(', ')+'"');
  }
  static onStateOnlyViolation(identity) {
    console.error('Validation prompt\n'+
    'Expected '+identity.join(', ')+' to be "stateOnly"\n'+
    'Use "createLeaf" to avoid creating unnecessary SubStores');
  }

  static checkStorelessStateRecursively(state, shape, identity) {
    const childShapes = getShapesChildren(shape);
    const merge = { ...state, ...childShapes, };
    for (const key in merge) {
      let subShape = childShapes[key];
      const subState = state[key];
      const subIdentity = [ ...identity, key, ];
      const actualType = getValueTypeName(subState);
      if (!subShape && shape[many]) {
        subShape = shape[many];
      }
      if (subShape) {
        if (state.hasOwnProperty(key)) {
          const subType = subShape[type];
          if (checkers[subType](subState)) {
            if (!subType[leaf]) {
              DevSubStore.checkStorelessStateRecursively(subState, subShape, subIdentity);
            }
          } else if (subShape[isRequired] || !checkers.none(subState)) {
            DevSubStore.onValidationError({
              expected: subType,
              actual: actualType,
              state: subState,
              identity: subIdentity,
              isRequired: subShape[isRequired],
            });
          }
        } else if (subShape[isRequired]) {
          DevSubStore.onMissingRequiredFields({ identity, missingRequiredFields: [ key, ], });
        }
      } else if (shape[strict]) {
        DevSubStore.onExclusiveViolation({ key, identity, shape, value: state[key], });
      }
    }
  }
}