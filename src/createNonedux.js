import { combineReducers, } from 'redux';
import SubStore, { CLEAR_STATE, SET_STATE, REMOVE, } from './SubStore';
import DevSubStore from './DevSubStore';
import { spec, object, array, anyLeaf, isRequired, number, none, symbol, string, bool, regex, func, date, anyValue, } from './shape';

const { entries, assign, } = Object;
const parentTypes = { object, array, };
const childTypes = { anyLeaf, number, symbol, string, bool, regex, func, anyValue, date, };
const types = { ...parentTypes, ...childTypes, none, };

export default function createNoneDux(initialState = {}, shape) {
  const { subject, } = new StoreParent(initialState, shape);
  const reducer = createReducer(initialState, subject);
  const thunk = () => next => action => {
    if (typeof action === 'function') {
      return action(subject);
    }
    return next(action);
  };
  const dispatcher = store => {
    SubStore.onAction = action => store.dispatch(action);
  };
  return {
    reducer,
    thunk,
    dispatcher,
    subject,
  };
}

function createReducer(initialState, subject) {
  const reducerTemplate = entries(initialState)
    .reduce((acc, [ k, v, ]) => {
      acc[k] = (state=v, { type, target, param, }) => {
        if (target && target[0]===k) {
          const child = target.reduce((t, key) => t[key], subject);
          switch (type) {
            case SET_STATE:
              child._onSetState(param);
              break;
            case CLEAR_STATE:
              child._onClearState(param);
              break;
            case REMOVE:
              child._onRemove(param);
              break;
            default:
              console.error('Invalid action');
              console.error({ type, target, param, });
          }
        }
        return subject.state[k];
      };
      return acc;
    }, {});
  return combineReducers(reducerTemplate);
}

export class StoreParent{
  __substore_id__ = '__ground__';
  __substore_identity__ = [];

  constructor(state, shape) {
    if (shape && process.env.NODE_ENV!=='production') {
      shape = {
        [spec]: { types: [ object, ], isRequired, },
        ...StoreParent.reformatShape(shape),
      };
      const shapeErrors = StoreParent.validateShape(shape);
      if (shapeErrors.length) {
        StoreParent.onDevSubStoreCreationError('DevSubStore could not be used:\n'+JSON.stringify(shapeErrors, null, 1)+'\nCreated default SubStore instead');
        this.subject = new SubStore(state, 'root', this, 0, undefined, []);
      } else {
        this.subject = new DevSubStore(state, 'root', this, 0, shape, []);
      }
    } else {
      this.subject = new SubStore(state, 'root', this, 0, undefined, []);
      SubStore.killSwitch = () => this.subject.remove(...this.subject.getChildren().map(child => child.getId()))
    }
  }

  _notifyUp() {}

  remove() {}

  stillAttatched() {
    return true;
  }

  static onDevSubStoreCreationError(shapeErrors) {
    console.error('DevSubStore could not be used:\n'+JSON.stringify(shapeErrors, null, 1)+'\nCreated default SubStore instead');
  }

  static reformatShape(shape) {
    return entries(shape).reduce((acc, [ key, value, ]) => {
      const { isRequired, exclusive, } = value;
      acc[key] = {};
      if (isRequired) {
        acc[key].isRequired = isRequired;
      }
      if (exclusive) {
        acc[key].exclusive = exclusive;
      }
      if (key===spec) {
        acc[spec].types = entries(value)
          .filter(([ k, ]) => types[k])
          .map(([ _, v, ]) => v); // remove name
        if (acc[spec].types.length && !value.none && !isRequired) {
          acc[spec].types.push(none);
        }
        assign((acc[key], { isRequired, exclusive, }));
      } else if (value[spec] || value[spec]) {
        acc[key] = StoreParent.reformatShape(value);
      }
      return acc;
    }, {});
  }

  static killSwitch = () => {
    console.trace();
    this.subject.removeSelf();
    throw new Error('Infinite recursion on SubStore');
  };

  static validateShape(shape, identity=[ 'root', ], errors = []) {
    if (!(shape instanceof Object)) {
      return [];
    }
    const entryMap = entries(shape)
      .filter(([ k, ]) => k!==spec);
    if (!shape[spec]) {
      errors.push({ identity, msg: 'missing property spec', });
    } else if (!shape[spec].types || !shape[spec].types.length) {
      errors.push({ identity, msg: 'missing spec type', });
    } else {
      const childTypeNames = shape[spec].types.filter(type => childTypes[type.name]).map(it => it.name);
      if (entryMap.length && childTypeNames.length) {
        errors.push({ identity, msg: ('Shape types '+JSON.stringify(childTypeNames)+', Cannot have child properties'), });
      }
    }
    entryMap
      .forEach(([ k, v, ]) => {
        StoreParent.validateShape(v, [ ...identity, k, ], errors);
      });

    return errors;
  }
}
