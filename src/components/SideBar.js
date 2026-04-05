import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getBackendUrl } from '../utils/backend';
import { getCurrentUser } from '../utils/user';

export default function SideBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    const userData = await getCurrentUser();
    setCurrentUser(userData);
  };

  const menuItems = [
    { path: '/home', label: 'Dashboard' },
    { path: '/customer-list', label: 'Customer' },
    { path: '/visit-history', label: 'Visit History' },
    { path: '/scheduled-visit', label: "Scheduled Visits" },
    { path: '/create-visit', label: 'Create Visit' },
  ];

  const handleLogout = async () => {
    const response = await fetch(`${getBackendUrl()}/api/method/logout`, {
      method: "POST",
      credentials: "include",
    });
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>Sales Tracker</h3>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.path}
            className={`sidebar-btn ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </button>
        ))}
      </nav>
      
      <div className="sidebar-footer">
        {currentUser && (
          <div style={{ 
            padding: '10px', 
            borderBottom: '1px solid #eee', 
            fontSize: '12px',
            color: '#666'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
              {currentUser.user}
            </div>
            <div>
              {currentUser.roles && currentUser.roles.join(', ')}
            </div>
          </div>
        )}
        <button className="sidebar-btn logout-btn" onClick={handleLogout}>
          {/* <span className="sidebar-icon">🚪</span> */}
          <span className="sidebar-label">Logout</span>
        </button>
      </div>
    </div>
  );
}