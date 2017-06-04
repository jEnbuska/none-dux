import React from 'react';
import propTypes from 'prop-types';

function handleClick(e, onClick) {
  try {
    e.preventDefault();// prevent default for forms (get)
  } catch (Exception) {}
  onClick(e);
}

const { object, string, bool, func, } = propTypes;

export default class Button extends React.Component {

  static propTypes= {
    onClick: func.isRequired,
    disabled: bool,
    warn: bool,
    className: string,
    style: object,
  };

  render() {
    const { onClick, disabled, primary, warn, className, children, style, } = this.props;
    return (
      <button
        className={`${(primary && 'button-primary') || (warn && ' button-warning') || (' button-default')} ${className}`}
        style={style}
        disabled={disabled}
        onClick={(e) => handleClick(e, onClick)}>
        {children}
      </button>
    );
  }
}