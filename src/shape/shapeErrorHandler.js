import { stringify, } from '../common';

export default {
  onStrictError: (identity, key, state) =>
    console.error('"strict" validation failed:' +
      '\nAt: "'+identity.join(', ')+'"' +
      '\nNo validations for key: '+key +'' +
      '\nWith value: '+ stringify(state)),
  onRequiredError: (identity, key) =>
    console.error('"isRequired" validation failed:' +
      '\nAt: "'+identity.join(', ')+'"' +
      '\nIs missing value for key: '+key),
  onTypeError: (type, state, identity) =>
    console.error('Validation failed at "'+identity.join(', ')+'"\n' +
      'Expected: '+ type+'' +
      '\nBut got '+stringify(state)),
};
