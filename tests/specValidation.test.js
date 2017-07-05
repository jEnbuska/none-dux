import ReducerParent from '../src/ReducerParent';
import Validator, { spec, } from '../src/shape/Validator';
import createValidator, { toType, any, } from '../src/shape/createValidator';
import { array, object, number, strict, isRequired, string, bool, } from '../src/shape/types';

ReducerParent.onDevSubStoreCreationError = () => {};

function reParse(val) {
  return JSON.parse(JSON.stringify(val));
}

function createSpec(name = 'Object', isRequired = false, strict = false) {
  return {
    [spec]: {
      isRequired,
      strict,
      name,
    },
  };
}

describe('Validate shape', () => {
  test('init Validator', () => {
    const validator = new Validator('Object');
    expect(validator).toEqual({ [spec]: { isRequired: false, strict: false, name: 'Object', }, });

    expect(validator.isRequired.strict).toEqual({ [spec]: { isRequired: true, strict: true, name: 'Object', }, });
  });
  test('create validator object validator with required number', () => {
    const validator = createValidator({
      a: number.isRequired,
    });
    expect(reParse(validator)).toEqual({
      ...createSpec(),
      a: { ...createSpec('Number', true), },
    });
  });

  test('create validator object with initial spec', () => {
    const validator = createValidator({
      ...strict.isRequired,
    });
    const parsed = reParse(validator);
    expect(parsed).toEqual({ ...createSpec('Object', true, true), });
  });

  test('create validator array with initial spec', () => {
    const validator = createValidator([
      isRequired,
    ]);
    const parsed = reParse(validator);
    expect(parsed).toEqual(createSpec('Array', true));
  });

  test('create nested arrays with child Object', () => {
    const validator = createValidator({
      a: [
        [
          [
            [
              {},
            ],
          ],
        ],
      ],
    });
    expect(reParse(validator)).toEqual({
      ...createSpec(),
      a: {
        ...createSpec('Array'),
        [any]: {
          ...createSpec('Array'),
          [any]: {
            ...createSpec('Array'),
            [any]: {
              ...createSpec('Array'),
              [any]: createSpec(),
            },
          },
        },
      },
    });
  });

  test('create nested arrays with child Number', () => {
    const validator = createValidator({
      a: [
        [
          [
            [
              number.isRequired,
            ],
          ],
        ],
      ],
    });
    expect(reParse(validator)).toEqual({
      ...createSpec(),
      a: {
        ...createSpec('Array'),
        [any]: {
          ...createSpec('Array'),
          [any]: {
            ...createSpec('Array'),
            [any]: {
              ...createSpec('Array'),
              [any]: createSpec('Number', true),
            },
          },
        },
      },
    });
  });

  test('create nested object with child Array', () => {
    const validator = createValidator({
      a: {
        b: {
          c: {
            e: [],
          },
        },
      },
    });
    expect(reParse(validator)).toEqual({
      ...createSpec(),
      a: {
        ...createSpec(),
        b: {
          ...createSpec(),
          c: {
            ...createSpec(),
            e: {
              ...createSpec('Array'),
            },
          },
        },
      },
    });
  });

  test('create nested array with specs', () => {
    const validator = createValidator({
      a: [
        isRequired,
        [
          isRequired,
          [
            isRequired,
            [],
          ],
        ],
      ],
    });
    expect(reParse(validator)).toEqual({
      ...createSpec(),
      a: {
        ...createSpec('Array', true),
        [any]: {
          ...createSpec('Array', true),
          [any]: {
            ...createSpec('Array', true),
            [any]: {
              ...createSpec('Array'),
            },
          },
        },
      },
    });
  });

  test('create nested object with specs', () => {
    const validator = createValidator({
      a: {
        ...isRequired,
        b: {
          ...isRequired.strict,
          [any]: { ...isRequired, },
          c: {
            ...strict,
            d: number,
            e: {},
          },
        },
      },
    });
    expect(reParse(validator)).toEqual({
      ...createSpec(),
      a: {
        ...createSpec('Object', true),
        b: {
          ...createSpec('Object', true, true),
          [any]: {
            ...createSpec('Object', true),
          },
          c: { ...createSpec('Object', false, true),
            d: createSpec('Number'),
            e: {
              ...createSpec(),
            },
          },
        },
      },
    });
  });

  test('create more complicated validator', () => {
    const validator = createValidator({
      a: {
        b: {
          ...isRequired.strict,
          c: {},
          ...[ 'd', 'e', 'f', ].reduce(toType(string), {}),
          g: number.isRequired,
        },
        h: [
          [
            isRequired,
            number,
          ],
        ],
        i: [
          { k: {
            l: number,
            [any]: {
              ...strict,
              m: number,
              n: bool.isRequired,
            },
          }, },
        ],
      },
    });
    const output = reParse(validator);
    const expected = {
      ...createSpec(),
      a: {
        ...createSpec(),
        b: {
          ...createSpec(undefined, true, true),
          c: {
            ...createSpec(),
          },
          d: { ...createSpec('String'), },
          e: { ...createSpec('String'), },
          f: { ...createSpec('String'), },
          g: { ...createSpec('Number', true), },
        },
        h: {
          ...createSpec('Array'),
          [any]: {
            ...createSpec('Array', true),
            [any]: { ...createSpec('Number'), },
          },
        },
        i: {
          ...createSpec('Array'),
          [any]: {
            ...createSpec(),
            k: {
              ...createSpec(),
              l: {
                ...createSpec('Number'),
              },
              [any]: {
                ...createSpec('Object', false, true),
                m: {
                  ...createSpec('Number'),
                },
                n: {
                  ...createSpec('Boolean', true),
                },
              },
            },
          },
        },
      },
    };
    expect(output).toEqual(expected);
  });
});
