import SubStore from './SubStore';

export default class ReducerParent extends SubStore {

  __substore_id__ = 'root';
  __substore_identity__ = [];
  __substore_parent__ = { _notifyUp() {}, };

  constructor(state) {
    super({}, 'root', { _notifyUp() {}, }, 0, [], { dispatch: () => { }, });
    this._onSetState(state);
  }
/*
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
        acc[key] = ReducerParent.reformatShape(value);
      }
      return acc;
    }, {});
  }

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
        ReducerParent.validateShape(v, [ ...identity, k, ], errors);
      });
    return errors;
  }*/
}
