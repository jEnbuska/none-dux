import React from 'react';
import propTypes from 'prop-types';

const { string, bool, func, } = propTypes;

const Button = ({ onClick, text, disabled, primary, warn, className, children, type, }) => (
  <button
    type={type}
    className={`${(primary && 'button-primary') || (warn && ' button-warning') || (' button-default')} ${className}`}
    disabled={disabled}
    onClick={onClick}>
    {text}
    {children}
  </button>
);

Button.propTypes= {
  onClick: func,
  text: string,
  type: string,
  disabled: bool,
  warn: bool,
  className: string,
};
export default Button;