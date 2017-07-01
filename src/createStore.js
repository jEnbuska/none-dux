import SubStore from './SubStore';
import { APPLICATION_STATE, CLEAR_STATE, } from './common';

export default function createStore(initialState, description) {
  return new StoreCreator(initialState, description).subject;
}

export class StoreCreator {

  __substore_id__ = '__ground__';
  __substore_identity__ = [];

  constructor(state = {}, description) {
    SubStore.__kill = () => StoreCreator.killSwitch();
    if (process.env.NODE_ENV!=='production' && description) {
      const DevSubStore = require('./DevSubStore').default;
      this.subject = new DevSubStore(state, APPLICATION_STATE, this, 0, description);
    } else {
      this.subject = new SubStore(state, APPLICATION_STATE, this, 0);
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
    subject.getShape = () => subject.__substore_shape__;
    SubStore.lastChange = { target: [ APPLICATION_STATE, ], action: CLEAR_STATE, param: state, };
  }

  _notifyUp() {
    Object.values(this.subject.subscribers).forEach(function (sub) { sub(); });
  }

  remove() {}

  stillAttatched() {
    return true;
  }

  static killSwitch = () => {
    console.trace();
    this.subject.removeSelf();
    throw new Error('Infinite recursion on SubStore');
  };
}
