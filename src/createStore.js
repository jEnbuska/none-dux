import SubStore, { CLEAR_STATE, } from './SubStore';
import DevSubStore from './DevSubStore';
import { spec, object, array, anyLeaf, isRequired, number, none, symbol, string, bool, regex, func, } from './shape';

const { entries, assign, } = Object;
const parentTypes = { object, array, };
const childTypes = { anyLeaf, number, symbol, string, bool, regex, func, };
const types = { ...parentTypes, ...childTypes, none, };

export default function createStore(initialState, shape) {
  return new StoreCreator(initialState, shape).subject;
}

export class StoreCreator {

  __substore_id__ = '__ground__';
  __substore_identity__ = [];

  constructor(state = {}, shape) {
    SubStore.__kill = () => StoreCreator.killSwitch();
    if (shape && process.env.NODE_ENV!=='production') {
      shape = {
        [spec]: { types: [ object, ], isRequired, },
        ...StoreCreator.reformatShape(shape),
      };
      const shapeErrors = StoreCreator.validateShape(shape);
      if (shapeErrors.length) {
        console.error('DevSubStore could not be used:\n'+JSON.stringify(shapeErrors, null, 1)+'\nCreated default SubStore instead');
        this.subject = new SubStore(state, 'root', this, 0);
      } else {
        this.subject = new DevSubStore(state, 'root', this, 0, shape);
      }
    } else {
      this.subject = new SubStore(state, 'root', this, 0);
    }
    const { subject, } = this;
    subject.subscriptionCount = 0;
    subject.subscribers = {};
    subject.subscribe = function (callback) {
      const { subscriptionCount, subscribers, } = this;
      subscribers[subscriptionCount] = callback;
      subject.subscriptionCount++;
      return () => delete subscribers[subscriptionCount];
    }.bind(subject);
    SubStore.lastChange = { target: [ 'root', ], action: CLEAR_STATE, param: state, };
  }

  _notifyUp() {
    Object.values(this.subject.subscribers).forEach(function (sub) { sub(); });
  }

  remove() {}

  stillAttatched() {
    return true;
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
        acc[key] = StoreCreator.reformatShape(value);
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
        StoreCreator.validateShape(v, [ ...identity, k, ], errors);
      });

    return errors;
  }
}
