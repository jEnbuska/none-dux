import React from 'react';
import { string, } from 'prop-types';
import { Link, } from 'react-router-dom';

const LinkDefault = ({ to, children, className, }) => (
  <Link disabled to={to} className={`link-default ${className}`}>
    <span>
    {children}
    </span>
  </Link>);

LinkDefault.propTypes = {
  to: string.isRequired,
  className: string,
};
LinkDefault.defaultProps= {
  className: '',
};

export default LinkDefault;