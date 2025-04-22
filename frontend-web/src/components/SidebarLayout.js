import React, { useState, useEffect, useRef } from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuIcon from '@mui/icons-material/Menu';
import { useLocation } from 'react-router-dom';

const minCollapsedWidth = 80;
const minExpandedWidth = 220;
const MAX_WIDTH = 350; // Maximum width for the sidebar

export default function SidebarLayout({ children, sidebarContent }) {
  const [collapsed, setCollapsed] = useState(() => {
    const storedCollapsed = localStorage.getItem('sidebar-collapsed');
    return storedCollapsed === 'true' ? true : false;
  });

  const [width, setWidth] = useState(() => {
    const storedWidth = parseInt(localStorage.getItem('sidebar-width'), 10);
    if (!isNaN(storedWidth)) {
      return storedWidth < minExpandedWidth ? minExpandedWidth : storedWidth;
    }
    return minExpandedWidth;
  });

  const sidebarRef = useRef(null);
  const isResizing = useRef(false);
  const lastWidth = useRef(width);

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', collapsed);
  }, [collapsed]);

  useEffect(() => {
    localStorage.setItem('sidebar-width', width);
  }, [width]);

  const onMouseDown = (e) => {
    isResizing.current = true;
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const onMouseMove = (e) => {
    if (!isResizing.current) return;
    const newWidth = e.clientX;

    if (newWidth > MAX_WIDTH) {
      setCollapsed(false);
      setWidth(MAX_WIDTH);
      lastWidth.current = MAX_WIDTH;
      return;
    }

    if (newWidth < minExpandedWidth && newWidth > minExpandedWidth - 80) return;

    if (newWidth <= minExpandedWidth - 80) {
      setCollapsed(true);
      setWidth(minCollapsedWidth);
    } else {
      setCollapsed(false);
      setWidth(newWidth);
      lastWidth.current = newWidth;
    }
  };

  const onMouseUp = () => {
    isResizing.current = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  };

  const toggleCollapsed = () => {
    if (collapsed) {
      const newWidth = lastWidth.current >= minExpandedWidth ? lastWidth.current : minExpandedWidth;
      setWidth(newWidth);
      setCollapsed(false);
    } else {
      lastWidth.current = width;
      setCollapsed(true);
      setWidth(minCollapsedWidth);
    }
  };

  const sidebarStyle = {
    width: collapsed ? minCollapsedWidth : width,
    transition: 'width 0.1s linear',
    height: '100vh',
    backgroundColor: '#2c3e50',
    color: '#ecf0f1',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'fixed',
    top: 0,
    left: 0,
    overflow: 'hidden',
    userSelect: 'none',
    fontFamily: 'Inter, sans-serif',
  };

  const toggleButtonStyle = {
    position: 'absolute',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    color: '#ecf0f1',
    fontSize: '18px',
    padding: '8px',
    transition: 'all 0.3s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  if (collapsed) {
    toggleButtonStyle.top = '8px';
    toggleButtonStyle.left = '50%';
    toggleButtonStyle.transform = 'translateX(-50%)';
  } else {
    toggleButtonStyle.top = '8px';
    toggleButtonStyle.right = '8px';
    toggleButtonStyle.transform = 'none';
  }

  const contentStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center', // Center the links vertically
    width: '100%',
    paddingTop: '40px',
    boxSizing: 'border-box',
    gap: '10px',
  };

  const resizerStyle = {
    width: '5px',
    cursor: 'col-resize',
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    userSelect: 'none',
  };

  const location = useLocation();

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { to: '/settings', label: 'Settings', icon: <SettingsIcon /> },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', marginLeft: collapsed ? minCollapsedWidth : width }}>
      <div ref={sidebarRef} style={sidebarStyle}>
        <button onClick={toggleCollapsed} style={toggleButtonStyle} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          {<MenuIcon />}
        </button>
        <div style={contentStyle}>
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <a
                key={link.to}
                href={link.to}
                style={{
                  display: 'flex',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  alignItems: 'center',
                  color: 'white',
                  textDecoration: 'none',
                  fontSize: '20px',
                  width: collapsed ? '48px' : '150px',
                  maxWidth: '240px',
                  padding: '10px',
                  borderRadius: '10px',
                  backgroundColor: isActive ? '#1abc9c' : 'transparent',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s',
                  fontWeight: 500,
                  margin: '4px auto',
                  textAlign: 'left',
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = isActive ? '#1abc9c' : '#34495e')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = isActive ? '#1abc9c' : 'transparent')}
              >
                <div 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    gap: collapsed ? '0px' : '12px',
                    width: '100%',
                  }}>
                  {link.icon}
                  {!collapsed && link.label}
                </div>
              </a>
            );
          })}
          {sidebarContent}
        </div>
        <div style={resizerStyle} onMouseDown={onMouseDown} />
      </div>
      <div style={{ flex: 1, overflow: 'auto' }}>
        {children}
      </div>
    </div>
  );
}
