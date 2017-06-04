import React from 'react';

function Div({ children, style, onClick, }) {
  style = { ...{ border: '1px solid black', borderRadius: '.3em', background: 'white', boxShadow: '5px 5px 5px  #a1a1a1', padding: '.5em', }, ...style, };
  return (<div style={style} onClick={onClick}>{children}</div>);
}

export default Div;