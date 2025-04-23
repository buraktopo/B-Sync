import React, { useState, useEffect, useCallback } from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuIcon from '@mui/icons-material/Menu';
import { useLocation } from 'react-router-dom';
import logo from '../assets/lightLogo.png'; // Import the logo
import '../styles/SidebarLayout.css'; // Import the CSS file

const minCollapsedWidth = 80;
const minExpandedWidth = 230;

const userAvatarStyle = (name) => ({
  backgroundColor: `hsl(${Math.floor(name?.charCodeAt(0) * 10 % 360)}, 70%, 60%)`,
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '20px',
  color: '#fff',
  fontWeight: 'bold',
  flexShrink: 0,
});

export default function SidebarLayout({ children, sidebarContent }) {
  const [collapsed, setCollapsed] = useState(() => {
    const storedCollapsed = localStorage.getItem('sidebar-collapsed');
    return storedCollapsed === 'true';
  });

  const [userInfo, setUserInfo] = useState(null);

  const fetchUserInfo = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://192.168.1.204:5001/api/user/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      const userData = {
        name: data.name,
        title: data.title,
        profilePhotoUrl: data.profilePhotoUrl,
      };
      setUserInfo(userData);
      localStorage.setItem('user-info', JSON.stringify(userData));
    } catch (err) {
      console.error('Failed to load user info:', err.message);
    }
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('user-info');
    if (storedUser) {
      setUserInfo(JSON.parse(storedUser));
    }
    fetchUserInfo();
  }, [fetchUserInfo]);

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', collapsed);
  }, [collapsed]);

  const toggleCollapsed = () => {
    setCollapsed((prev) => !prev);
  };

  const location = useLocation();

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { to: '/settings', label: 'Settings', icon: <SettingsIcon /> },
  ];

  return (
    <div
      className={`sidebar-layout-wrapper ${collapsed ? 'collapsed' : 'expanded'}`}
    >
      <nav className={`sidebar ${collapsed ? 'collapsed' : 'expanded'}`} aria-label="Sidebar navigation">
        <button
          onClick={toggleCollapsed}
          className={`sidebar-toggle-button ${collapsed ? 'collapsed' : 'expanded'}`}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          type="button"
        >
          <MenuIcon />
        </button>
        <div className="sidebar-header">
          {!collapsed && (
            <img src={logo} alt="Logo" className="sidebar-logo" />
          )}
        </div>
        <div className="sidebar-content">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <a
                key={link.to}
                href={link.to}
                className={`sidebar-link ${collapsed ? 'collapsed' : ''}`}
                style={{ backgroundColor: isActive ? '#1abc9c' : 'transparent' }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = isActive ? '#1abc9c' : '#34495e';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = isActive ? '#1abc9c' : 'transparent';
                }}
              >
                <div className={`sidebar-link-content ${collapsed ? 'collapsed' : ''}`}>
                  {link.icon}
                  {!collapsed && link.label}
                </div>
              </a>
            );
          })}
          {sidebarContent}
        </div>
        <footer className="sidebar-footer">
          {userInfo && (
            <div className="sidebar-user-info">
              <div style={userAvatarStyle(userInfo.name)} aria-hidden="true">
                {userInfo.name?.[0]?.toUpperCase()}
              </div>
              {!collapsed && (
                <div style={{ overflow: 'hidden' }}>
                  <div className="sidebar-user-name">{userInfo.name}</div>
                  <div className="sidebar-user-title">{userInfo.title}</div>
                </div>
              )}
            </div>
          )}
        </footer>
      </nav>
      <main style={{ flex: 1, overflow: 'auto' }}>{children}</main>
    </div>
  );
}
