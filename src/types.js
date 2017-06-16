
const primitiveTypes = [ 'number', 'string', 'boolean', ]
  .reduce((acc, type) => {
    acc[type] = {
      _hasError: (it) => {
        let deviation = checkType(it, type, 'undefined');
        if (deviation && it !==null) {
          if (deviation==='object' && it instanceof Array) {
            deviation = 'array';
          }
          return formatException(type+' or undefined', deviation, it);
        }
      },
      isRequired: {
        _hasError: (it) => {
          let deviation = checkType(it, type);
          if (deviation) {
            if (it===null) {
              return formatException(type, null);
            } else if (deviation==='object' && it instanceof Array) {
              deviation = 'array';
            }
            return formatException(type, deviation, it);
          }
        },
      },
    };
    return acc;
  }, {});

function checkType(it, ...options) {
  const type = typeof it;
  if (!options.some(t => t===type)) {
    return type;
  }
}

function formatException(expected, actual, value) {
  let formattedValue;
  try {
    formattedValue = JSON.stringify(value, null, 1);
  } catch (ignore) {
    formattedValue = value;
  }
  return 'Expected type '+expected+' but got '+ actual + (value !== undefined && value!==null ?(' with value: "'+formattedValue+'"') : '');
}

const basicObjects = {
  object: {
    _hasError: (it) => {
      const deviation = checkType(it, 'object', 'undefined');
      if (deviation) {
        return formatException('object or undefined', deviation, it);
      } else if (it && it.constructor.name==='Array') {
        return formatException('object or undefined', 'array', it);
      }
    },
    isRequired: {
      _hasError: (it) => {
        const deviation = checkType(it, 'object');
        if (deviation) {
          return formatException('object', deviation, it);
        } else if (!it) { // null
          return formatException('object', it, it);
        } else if (it.constructor.name ==='Array') {
          return formatException('object', 'array', it);
        }
      },
    },
  },
  array: {
    _hasError: (it) => {
      const deviation = checkType(it, 'object', 'undefined');
      if (deviation) {
        return formatException('array or undefined', deviation, it);
      } else if (it && it.constructor.name !=='Array') {
        return formatException('array or undefined', it.constructor.name.toLowerCase(), it);
      }
    },
    isRequired: {
      _hasError: (it) => {
        const deviation = checkType(it, 'object');
        if (deviation) {
          return formatException('array', deviation, it);
        } else if (!it) { // null
          return formatException('array', it, it);
        } else if (it.constructor.name !=='Array') {
          return formatException('array', it.constructor.name.toLowerCase(), it);
        }
      },
    },
  },
};
export const { boolean: bool, number, string, object, array, } = { ...primitiveTypes, ...basicObjects, };