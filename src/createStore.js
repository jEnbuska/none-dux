import SubStore, { CLEAR_STATE, } from './SubStore';
import DevSubStore from './DevSubStore';
import { spec, object, } from './shape';

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
        [spec]: { type: object, },
        ...shape,
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

  remove() {
  }

  stillAttatched(){
    return true;
  }

  static killSwitch = () => {
    console.trace();
    this.subject.remove();
    throw new Error('Infinite recursion on SubStore');
  };

  static validateShape(shape, identity=[ 'root', ], errors = []) {
    if (!(shape instanceof Object)) {
      return [];
    }
    if (!shape[spec]) {
      errors.push({ identity, msg: 'missing property spec', });
    } else if (!shape[spec].type) {
      errors.push({ identity, msg: 'missing spec type', });
    }
    Object.entries(shape)
      .filter(([ k, ]) => k!==spec)
      .forEach(([ k, v, ]) => {
        StoreCreator.validateShape(v, [ ...identity, k, ], errors);
      });
    return errors;
  }
}
