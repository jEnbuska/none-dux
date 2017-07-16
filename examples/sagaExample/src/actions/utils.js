export function dispatch(...params) {
  return function (_, { dispatch: actual, }) {
    actual(...params);
  };
}