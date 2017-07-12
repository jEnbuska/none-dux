import React from 'react';

const { bool, func, string, } = React.PropTypes;

const SidebarItem = ({ children, }) => (
  <div className='sidebar-item'>
    {children}
  </div>
  );

exports.SidebarItem = SidebarItem;

const SidebarLink = ({ id, selected, onClick, children, }) => (
  <div
    id={id}
    className={`sidebar-link ${selected && 'selected-link'}`}
    onClick={onClick}>{children}</div>
  );
SidebarLink.propTypes = {
  id: string,
  selected: bool,
  onClick: func,
};
exports.SidebarLink = SidebarLink;

const SidebarSmallItem = ({ id, selected, onClick, name, }) => (
  <div id={id} className='sidebar-item-small' onClick={onClick}>
    <i name={name} className={`sidebar-link sidebar-home ${selected && 'selected-link'}`} />
  </div>
  );
SidebarSmallItem.propTypes = {
  id: string,
  selected: bool,
  onClick: func,
  name: string,
};
exports.SidebarSmallItem = SidebarSmallItem;

const SidebarPenLink = ({ id, selected, onClick, }) => (
  <i
    name='pencil'
    className={`sidebar-link sidebar-pencil ${selected && 'selected-link'}`}
    id={id} onClick={onClick} />
  );
SidebarPenLink.propTypes = {
  id: string,
  selected: bool,
  onClick: func,
};
exports.SidebarPenLink = SidebarPenLink;
