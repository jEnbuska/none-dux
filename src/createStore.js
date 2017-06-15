import SubStore, { CLEAR_STATE, } from './SubStore';
import DevSubStore from './DevSubStore';

export default function createStore(initialState, shape) {
  return new StoreCreator(initialState, shape).subject;
}

export const TARGET_ANY = '_TARGET_ANY_';
export const TYPE_ANY = '_TYPE_ANY_';
export const TYPE = '_TYPE_OF_';
export const VALIDATE = '_VALIDATE_';
export class StoreCreator {

  static killSwitch = () => {
    console.trace();
    this.subject.remove();
    throw new Error('Infinite recursion on SubStore');
  };

  _id = '__ground__';
  _identity = [];

  constructor(state = {}, shape) {
    SubStore.__kill = () => StoreCreator.killSwitch();
    if (shape && process.env.NODE_ENV!=='production') {
      shape = {
        [TYPE]: 'object',
        ...shape,
      };
      this.subject = new DevSubStore(state, 'root', this, 0, shape);
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
    SubStore.lastInteraction = { target: [ 'root', ], action: CLEAR_STATE, param: state, };
  }

  _notifyUp() {
    Object.values(this.subject.subscribers).forEach(function (sub) { sub(); });
  }

  remove() {
  }
}
