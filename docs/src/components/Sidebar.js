import React from 'react';
import { withRouter, } from 'react-router-dom';
import { SidebarItem, SidebarLink, SidebarPenLink, SidebarSmallItem, } from './SidebarContent';

const LINKS = [
  { path: '/jsxSyntax', name: 'JSX Syntax', exercise: true, },
  { path: '/Lists', name: 'JSX Lists', exercise: true, },
  { path: '/componentState', name: 'Component State', exercise: true, },
  { path: '/componentProps', name: 'Component Props', exercise: true, },
  { path: '/componentLifecycle', name: 'Component Lifecycle', exercise: true, },
  { path: '/Redux', name: 'Redux', },
  { path: '/reactRedux', name: 'React Redux', exercise: true, },
  { path: '/usingRestApis', name: 'Using Rest apis', exercise: true, },
  { path: '/extra', name: 'Extra', },
];

class Sidebar extends React.Component {

  state = { pathname: null, showMobileSidebar: false, };
  componentWillMount() {
    const { location, history, } = this.props;

    this.setState({ pathname: location.pathname, });
    this.routeSubscription = history.listen(({ pathname, }) => this.setState({ pathname, }));
  }

  render() {
    const { pathname, showMobileSidebar, } = this.state;
    return (
      <span>
        <i name='bars' className={`mobile-toggle-sidebar${showMobileSidebar ? '' : '-inactive'}`} onClick={() => this.setState({ showMobileSidebar: !showMobileSidebar, })} />
        <aside id='sidebar' className={`sidebar ${showMobileSidebar ? 'sidebar-active' : 'sidebar-hidden-on-mobile'}`}>
          <div className='sidebar-small-item-row'>
            <SidebarSmallItem
              selected={pathname === '/'}
              onClick={() => this.onLinkClick('/')}
              name='home'
              id='homeLink' />
            <SidebarSmallItem
              selected={pathname === '/firebase'}
              onClick={() => this.onLinkClick('/firebase')}
              name='comment'
              id='homeLink' />
          </div>
          {LINKS.map(({ path, name, exercise, }) => (
            <SidebarItem key={path}>
              <SidebarLink
                onClick={() => { this.onLinkClick(path); }}
                selected={path === pathname}>
                {name}
              </SidebarLink>
              {exercise && (<SidebarPenLink
                selected={(`${path}/exercise`) === pathname}
                onClick={() => this.onLinkClick(`${path}/exercise`)} />)}
            </SidebarItem>))}
        </aside>
      </span>
    );
  }

  onLinkClick = (path) => {
    this.setState({ showMobileSidebar: false, });
  }

}

export default withRouter(Sidebar);
