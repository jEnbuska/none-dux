'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var entries = Object.entries,
    keys = Object.keys;

var connector = function connector(Component, mapStateToProps, mapDispatchToProps) {
  var _class, _temp2;

  return _temp2 = _class = function (_React$Component) {
    _inherits(Connect, _React$Component);

    function Connect() {
      var _ref;

      var _temp, _this, _ret;

      _classCallCheck(this, Connect);

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Connect.__proto__ || Object.getPrototypeOf(Connect)).call.apply(_ref, [this].concat(args))), _this), _this.state = {}, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(Connect, [{
      key: 'componentWillMount',
      value: function componentWillMount() {
        var _this2 = this;

        var props = this.props,
            _context = this.context,
            store = _context.store,
            subscribe = _context.subscribe;

        this.mapDispatchToProps = entries(mapDispatchToProps).reduce(function (acc, _ref2) {
          var _ref3 = _slicedToArray(_ref2, 2),
              key = _ref3[0],
              value = _ref3[1];

          acc[key] = function () {
            return value.apply(undefined, arguments)(store, props);
          };
          return acc;
        }, {});
        var initialState = mapStateToProps(store.state, this.props);
        this.setState(initialState);
        this.subscription = subscribe(function () {
          var nextState = mapStateToProps(store.state, _this2.props);
          _this2.setState(nextState);
        });
      }
    }, {
      key: 'render',
      value: function render() {
        return _react2.default.createElement(Component, _extends({}, this.props, this.state, this.mapDispatchToProps));
      }
    }, {
      key: 'shouldComponentUpdate',
      value: function shouldComponentUpdate(nextProps, nextState) {
        var state = this.state,
            props = this.props;

        var propsChanges = keys(_extends({}, props, nextProps)).filter(function (k) {
          return props[k] !== nextProps[k];
        });
        if (propsChanges.length) {
          var store = this.context.store;

          this.mapDispatchToProps = entries(mapDispatchToProps).reduce(function (acc, _ref4) {
            var _ref5 = _slicedToArray(_ref4, 2),
                key = _ref5[0],
                value = _ref5[1];

            acc[key] = acc[key] = function () {
              return value.apply(undefined, arguments)(store, props);
            };
            return acc;
          }, {});
          return true;
        }
        return keys(_extends({}, state, nextState)).some(function (k) {
          return state[k] !== nextState[k];
        });
      }
    }, {
      key: 'componentWillUnmount',
      value: function componentWillUnmount() {
        this.subscription();
      }
    }]);

    return Connect;
  }(_react2.default.Component), _class.contextTypes = {
    store: _propTypes.object,
    subscribe: _propTypes.func
  }, _temp2;
};

exports.default = function (mapStateToProps, mapDispatchToProps) {
  return function (target) {
    return connector(target, mapStateToProps, mapDispatchToProps);
  };
};