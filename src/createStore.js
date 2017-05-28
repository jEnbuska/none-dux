import SubStore, { RESET_STATE, } from './SubStore';

export default function createStore(initialState) {
  return new StoreCreator(initialState).subject;
}

export class StoreCreator {

  _id = '__ground__';
  static killSwitch = () => {
    console.trace();
    this.subject.remove();
    throw new Error('Infinite recursion on SubStore');
  };
  constructor(state = {}) {
    this.state = state;
    SubStore.__kill = () => StoreCreator.killSwitch();
    const subject = new SubStore(state, 'root', this);
    subject.subscriptionCount = 0;
    subject.subscribers = {};
    subject.subscribe = (callback) => {
      const { subscriptionCount, subscribers, } = subject;
      subscribers[subscriptionCount] = callback;
      subject.subscriptionCount++;
      return () => delete subscribers[subscriptionCount];
    };
    subject._version = 0;
    subject.subscribe(() => {
      subject._version++;
    });
    SubStore.lastInteraction = { target: [ 'root', ], action: RESET_STATE, param: state, };
    this.subject = subject;
  }
  _notifyUp() {
    Object.values(this.subject.subscribers).forEach(function (sub) { sub(); });
  }

  remove(...params) {
    console.log(params);
  }
}
