import React from 'react';
import propTypes from 'prop-types';

const { string, func, any, } = propTypes;
const Input = ({ id, autocomplete, value, label, min, max, checked, className='',  name, placeholder, type='text', onChange = () => console.log('on change not implemented'), }) => [
  (<label key={`${id}-label`} htmlFor={id} id={`${id}-label`} className='input-label'>
    {label}
  </label>),
  (<span key={`${id}-span`} className='input-wrapper'>
    <input
      id={id}
      name={name}
      autoComplete={autocomplete}
      min={min}
      max={max}
      type={type}
      value={value || ''}
      checked={checked || false}
      className={`input-default ${className}`}
      placeholder={placeholder}
      onChange={e => onChange(e.target.value)} />
  </span>),
];
Input.propTypes = {
  id: string,
  value: any,
  label: string,
  className: string,
  placeholder: string,
  type: string,
  onChange: func,
};
export default Input;
