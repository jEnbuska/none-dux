import React from 'react';
import { string, func, any, bool, } from 'prop-types';

const Input = ({ id, onFocus, invalid, missing, disabled, autocomplete, value, min, max, checked, name, placeholder, onBlur, type='text', onChange = () => console.log('on change not implemented'), }) => (
  <span className='flex'>
    <input
      id={id}
      onBlur={onBlur}
      onFocus={onFocus}
      name={name}
      disabled={disabled}
      autoComplete={autocomplete}
      min={min}
      max={max}
      type={type}
      value={value}
      checked={checked || false}

      className={`input-default ${invalid ? 'input-invalid' : missing ? 'input-required': ''}`}
      placeholder={placeholder}
      onChange={e => onChange(e.target.value)} />
  </span>
  );
Input.propTypes = {
  id: string,
  checked: bool,
  value: any,
  placeholder: string,
  type: string,
  onChange: func,
};

Input.defaultProps = {
  required: false,
  value: '',
  checked: false,
  state: 'default',
};
export default Input;
