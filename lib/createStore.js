'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.StoreCreator = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = createStore;

var _SubStore = require('./SubStore');

var _SubStore2 = _interopRequireDefault(_SubStore);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function createStore(initialState) {
  return new StoreCreator(initialState).subject;
}

var StoreCreator = exports.StoreCreator = function () {
  function StoreCreator() {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, StoreCreator);

    this._id = '__ground__';

    this.state = state;
    _SubStore2.default.__kill = function () {
      return StoreCreator.killSwitch();
    };
    var subject = new _SubStore2.default(state, 'root', this);
    subject.subscriptionCount = 0;
    subject.subscribers = {};
    subject.subscribe = function (callback) {
      var subscriptionCount = subject.subscriptionCount,
          subscribers = subject.subscribers;

      subscribers[subscriptionCount] = callback;
      subject.subscriptionCount++;
      return function () {
        return delete subscribers[subscriptionCount];
      };
    };
    subject._version = 0;
    subject.subscribe(function () {
      subject._version++;
    });
    _SubStore2.default.lastInteraction = { target: ['root'], action: _SubStore.RESET_STATE, param: state };
    this.subject = subject;
  }

  _createClass(StoreCreator, [{
    key: '_notifyUp',
    value: function _notifyUp() {
      Object.values(this.subject.subscribers).forEach(function (sub) {
        sub();
      });
    }
  }, {
    key: 'remove',
    value: function remove() {
      for (var _len = arguments.length, params = Array(_len), _key = 0; _key < _len; _key++) {
        params[_key] = arguments[_key];
      }

      console.log(params);
    }
  }]);

  return StoreCreator;
}();

StoreCreator.killSwitch = function () {
  console.trace();
  undefined.subject.remove();
  throw new Error('Infinite recursion on SubStore');
};