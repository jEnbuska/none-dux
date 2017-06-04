import React from 'react';
import propTypes from 'prop-types';

const Form = ({ style, className, onSubmit, children, }) => (
  <form
    style={style} className={className} onSubmit={e => {
      e.preventDefault();
      onSubmit();
    }}>
    {children}
  </form>);

Form.PropTypes = {
  onSubmit: propTypes.func,
};

export default Form;