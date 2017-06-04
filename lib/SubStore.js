'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var keys = Object.keys;
var SET_STATE = exports.SET_STATE = Symbol.for('SET_STATE');
var RESET_STATE = exports.RESET_STATE = Symbol.for('RESET_STATE');
var REMOVE = exports.REMOVE = Symbol.for('REMOVE');

var SubStore = function () {
  function SubStore(initialValue, key, parent) {
    var depth = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

    _classCallCheck(this, SubStore);

    this.prevState = {};

    if (depth > 100) {
      SubStore.__kill();
    }
    this._depth = depth;
    this._id = key;
    this._parent = parent;
    this._setInitialState(initialValue);
  }

  _createClass(SubStore, [{
    key: '_setInitialState',
    value: function _setInitialState(initialValue) {
      if (initialValue instanceof Object) {
        for (var k in initialValue) {
          this[k] = new SubStore(initialValue[k], k, this, this._depth + 1);
        }
      }
      this.state = initialValue;
      this._identity = SubStore.identityOf(this).reverse();
    }
  }, {
    key: 'getParent',
    value: function getParent() {
      return this._parent;
    }
  }, {
    key: 'getId',
    value: function getId() {
      return this._id;
    }
  }, {
    key: 'setState',
    value: function setState(value) {
      if (value instanceof SubStore) {
        throw new Error('SubStore does not take other SubStores as setState parameters. Got:', value + '. Identity:', JSON.stringify(this._identity));
      } else if (!this._parent) {
        throw new Error('detached SubStore action: setState', JSON.stringify(this._identity));
      }
      var prevState = this.state,
          _parent = this._parent;

      if (value instanceof Object && prevState instanceof Object) {
        this.state = this._merge(value, prevState);
      } else {
        this._reset(value, prevState);
      }
      this.prevState = prevState;
      SubStore.lastInteraction = { func: SET_STATE, target: this._identity, param: value };
      _parent._notifyUp(this);
      return this;
    }
  }, {
    key: 'clearState',
    value: function clearState(value) {
      if (!this._parent) {
        throw new Error('detached SubStore action: clearState', JSON.stringify(this._identity));
      } else if (value instanceof SubStore) {
        throw new Error('SubStore does not take other SubStores as resetState parameters. Got:', value + '. Identity:', JSON.stringify(this._identity));
      }
      var prevState = this.state;
      this._reset(value, prevState);
      this.prevState = prevState;
      SubStore.lastInteraction = { func: RESET_STATE, target: this._identity, param: value };
      this._parent._notifyUp(this);
      return this;
    }
  }, {
    key: 'remove',
    value: function remove() {
      for (var _len = arguments.length, ids = Array(_len), _key = 0; _key < _len; _key++) {
        ids[_key] = arguments[_key];
      }

      if (!this._parent) {
        throw new Error('detached SubStore action: remove', JSON.stringify(this._identity));
      }
      if (ids.length) {
        this.prevState = this.state;
        if (!(this.state instanceof Object)) {
          throw new Error('Remove error:', JSON.stringify(this._identity) + '. Has no children, was given,' + JSON.stringify(ids) + ' when state: ' + this.state);
        }
        var nextState = _extends({}, this.state);
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = ids[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var id = _step.value;

            if (this[id] && this[id] instanceof SubStore) {
              delete nextState[id];
              var targetChild = this[id];
              targetChild._onDetach();
              delete this[id];
            } else {
              throw new Error('Remove error:', JSON.stringify(this._identity), 'Has no such child as ' + id + ' when state: ' + JSON.stringify(this.state, null, 1));
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        this.state = nextState;
        SubStore.lastInteraction = { target: this._identity, func: REMOVE, param: ids };
        this._parent._notifyUp(this);
      } else {
        this._parent.remove(this._id);
      }
      return this;
    }
  }, {
    key: '_merge',
    value: function _merge(obj, prevState) {
      var nextState = _extends({}, prevState, obj);
      for (var k in nextState) {
        var child = this[k];
        if (child) {
          if (obj.hasOwnProperty(k)) {
            child._reset(obj[k], prevState[k]);
          }
        } else {
          this[k] = new SubStore(obj[k], k, this, this._depth + 1);
        }
      }
      return nextState;
    }
  }, {
    key: '_reset',
    value: function _reset(nextState, prevState) {
      if (nextState instanceof Object) {
        if (prevState instanceof Object) {
          var merge = _extends({}, prevState, nextState);
          for (var k in merge) {
            if (this[k]) {
              if (nextState.hasOwnProperty(k)) {
                this[k]._reset(nextState[k], prevState[k]);
              } else {
                this[k]._onDetach();
                delete this[k];
              }
            } else {
              this[k] = new SubStore(nextState[k], k, this, this._depth + 1);
            }
          }
        } else {
          for (var _k in nextState) {
            this[_k] = new SubStore(nextState[_k], _k, this, this._depth + 1);
          }
        }
      } else if (prevState instanceof Object) {
        for (var _k2 in prevState) {
          this[_k2]._onDetach();
          delete this[_k2];
        }
      }
      this.state = nextState;
    }
  }, {
    key: '_notifyUp',
    value: function _notifyUp(child) {
      var _id = child._id,
          state = child.state;

      var prevState = this.state;
      this.state = _extends({}, prevState, _defineProperty({}, _id, state));
      this.prevState = prevState;
      this._parent._notifyUp(this);
    }

    /* for testing and debug*/

  }, {
    key: 'getChildrenRecursively',
    value: function getChildrenRecursively() {
      return this.children().reduce(function (acc, child) {
        acc.push(child);
        return [].concat(_toConsumableArray(acc), _toConsumableArray(child.getChildrenRecursively()));
      }, []);
    }
  }, {
    key: '_onDetach',
    value: function _onDetach() {
      var ownChildren = this.children();
      delete this._parent;
      this.prevState = this.state;
      delete this.state;
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = ownChildren[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var child = _step2.value;

          child._onDetach();
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }
    }
  }, {
    key: 'children',
    value: function children() {
      var _this = this;

      return this.state instanceof Object ? keys(this.state).map(function (k) {
        return _this[k];
      }) : [];
    }
  }], [{
    key: 'identityOf',
    value: function identityOf(subject) {
      var acc = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

      acc.push(subject._id);
      if (subject._parent._id !== '__ground__') {
        SubStore.identityOf(subject._parent, acc);
      }
      return acc;
    }
  }, {
    key: '__kill',
    value: function __kill() {/* redefined by StoreCreator*/}
  }]);

  return SubStore;
}();

exports.default = SubStore;