import React from 'react';

function Div({ children, onClick, className, }) {
  return (<div onClick={onClick} className={`div-default ${className}`}>{children}</div>);
}

export default Div;