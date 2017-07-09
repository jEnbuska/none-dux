import { any, spec, naturalLeafTypes, checkers, } from './common';
import onShapeError from './onShapeErrorHandler';

const { keys, getPrototypeOf, } = Object;

export default function validateRecursively(state, prevState, identity, shape, initial) {
  const { [spec]: specification, [any]: _, ...children } = shape;
  const { name, strict, isRequired, } = specification || {};
  if (checkers[name](state)) {
    if (state && !naturalLeafTypes[getPrototypeOf(state).constructor.name]) {
      keys({ ...state, ...children, })
        .filter((k) => {
          try {
            return initial || !prevState || state[k] !== prevState[k] || !prevState.hasOwnProperty(k);
          } catch (Exception) {
            return true;
          }
        })
        .forEach((k) => {
          const subShape = shape[k] || shape[any];
          if (!subShape && strict) {
            onShapeError.onStrictError(identity, k, state[k]);
          } else if (subShape) {
            if (state[k] === null || state[k] === undefined) {
              if (subShape[spec].isRequired) {
                onShapeError.onRequiredError(identity, k);
              }
            } else {
              validateRecursively(
                state[k],
                prevState && prevState.hasOwnProperty(k) ? prevState[k] : undefined,
                [ ...identity, k, ],
                subShape,
                initial,
              );
            }
          }
        });
    }
  } else {
    onShapeError.onTypeError(name, state, identity);
  }
}