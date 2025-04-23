import React, { useState, useEffect } from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuIcon from '@mui/icons-material/Menu';
import { useLocation } from 'react-router-dom';


const minCollapsedWidth = 80;
const minExpandedWidth = 220;

export default function SidebarLayout({ children, sidebarContent }) {
  const [collapsed, setCollapsed] = useState(() => {
    const storedCollapsed = localStorage.getItem('sidebar-collapsed');
    return storedCollapsed === 'true' ? true : false;
  });

  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user-info");
    if (storedUser) {
      setUserInfo(JSON.parse(storedUser));
    }

    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch("http://192.168.1.204:5001/api/user/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        const userData = {
          name: data.name,
          title: data.title,
          profilePhotoUrl: data.profilePhotoUrl,
        };
        setUserInfo(userData);
        localStorage.setItem("user-info", JSON.stringify(userData));
      } catch (err) {
        console.error("Failed to load user info:", err.message);
      }
    };

    fetchUserInfo();
  }, []);

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', collapsed);
  }, [collapsed]);

  const toggleCollapsed = () => {
    setCollapsed(prev => !prev);
  };

  const sidebarStyle = {
    width: collapsed ? minCollapsedWidth : minExpandedWidth,
    transition: 'width 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
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

  const location = useLocation();

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { to: '/settings', label: 'Settings', icon: <SettingsIcon /> },
  ];

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      marginLeft: collapsed ? minCollapsedWidth : minExpandedWidth,
      transition: 'margin-left 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
    }}>
      <div style={sidebarStyle}>
        {!collapsed && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px 8px 16px',
            width: '100%',
            boxSizing: 'border-box',
            justifyContent: 'flex-start',
          }}>
            <button onClick={toggleCollapsed} style={toggleButtonStyle} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
              {<MenuIcon />}
            </button>
            <span style={{
              fontSize: '30px',
              fontWeight: 'bold',
              color: '#ecf0f1',
            }}>AssistBC</span>
          </div>
        )}
        {collapsed && (
          <button onClick={toggleCollapsed} style={toggleButtonStyle} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            {<MenuIcon />}
          </button>
        )}
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
        <div style={{
          height: '100px',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderTop: '1px solid #34495e',
          marginTop: 'auto',
          padding: '0 16px',
          boxSizing: 'border-box',
          gap: '12px'
        }}>
          {userInfo && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              maxWidth: '150px',
              textAlign: 'left'
            }}>
              <div style={{
                backgroundColor: `hsl(${Math.floor(userInfo.name?.charCodeAt(0) * 10 % 360)}, 70%, 60%)`,
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                color: '#fff',
                fontWeight: 'bold',
                flexShrink: 0
              }}>
                {userInfo.name?.[0]?.toUpperCase()}
              </div>
              {!collapsed && (
                <div style={{ overflow: 'hidden' }}>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: 500,
                    color: '#ecf0f1',
                    whiteSpace: 'normal',
                    wordWrap: 'break-word',
                    lineHeight: '1.2'
                  }}>
                    {userInfo.name}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#bdc3c7',
                    whiteSpace: 'normal',
                    wordWrap: 'break-word',
                  }}>
                    {userInfo.title}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'auto' }}>
        {children}
      </div>
    </div>
  );
}
