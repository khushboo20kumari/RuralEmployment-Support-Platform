import React from 'react';
import { Row, Col, Card, Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

const DashboardLayout = ({ title, subtitle, menuItems = [], accountInfo, children }) => {
  const location = useLocation();

  return (

    <div className="dashboard-layout">
      <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
        {/* Sidebar - fixed, always visible, modern UI */}
        {/* Interactive Sidebar with collapse */}
        <Sidebar menuItems={menuItems} accountInfo={accountInfo} location={location} />
        {/* Main Content - with left margin for sidebar */}
        <div style={{ marginLeft: 270, flex: 1, width: '100%' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 18px 18px 18px' }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// Sidebar component for interactivity
function Sidebar({ menuItems, accountInfo, location }) {
  const [collapsed, setCollapsed] = React.useState(false);
  // Add marginTop to push below navbar (assume navbar height 64px)
  return (
    <div className="dashboard-sidebar" style={{
      width: collapsed ? 72 : 270,
      minWidth: collapsed ? 56 : 220,
      maxWidth: collapsed ? 80 : 320,
      background: '#fff',
      color: '#1F2937',
      minHeight: '100vh',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 100,
      boxShadow: '2px 0 16px 0 #3b82f633',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      padding: '0 0 24px 0',
      transition: 'all 0.2s',
      marginTop: 64,
      height: 'calc(100vh - 64px)',
    }}>
      {/* Collapse/Expand Button */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        style={{
          background: 'none',
          border: 'none',
          color: '#e0f2fe',
          fontSize: 22,
          position: 'absolute',
          top: 18,
          right: collapsed ? 10 : 18,
          cursor: 'pointer',
          zIndex: 10,
          transition: 'right 0.2s',
        }}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? '»' : '«'}
      </button>
      {/* Logo/Avatar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: collapsed ? 0 : 14,
        justifyContent: collapsed ? 'center' : 'flex-start',
        padding: collapsed ? '32px 0 18px 0' : '32px 28px 18px 28px',
        borderBottom: '1.5px solid #bae6fd',
        marginBottom: 8,
        transition: 'all 0.2s',
      }}>
        <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="User" style={{ width: 48, height: 48, borderRadius: '50%', boxShadow: '0 2px 8px #bae6fd' }} />
        {!collapsed && (
          <div>
            <div style={{ fontWeight: 800, fontSize: 20, letterSpacing: 0.5, color: '#fff' }}>
              {accountInfo?.name?.split(' ')[0] || 'User'}
            </div>
            <div style={{ fontSize: 13, color: '#e0f2fe', opacity: 0.95 }}>{accountInfo?.email || ''}</div>
          </div>
        )}
      </div>
      {/* Menu */}
      <nav style={{ flex: 1, padding: collapsed ? '0 2px' : '0 10px' }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`dashboard-side-link d-flex align-items-center fw-semibold mb-2 px-2 py-3 rounded-3${isActive ? ' active' : ''}`}
              style={{
                textDecoration: 'none',
                fontSize: 17,
                fontWeight: 600,
                justifyContent: collapsed ? 'center' : 'flex-start',
                transition: 'all 0.2s',
              }}
              title={item.label}
            >
              <span className="me-3 fs-4">{item.icon}</span>
              {!collapsed && item.label}
            </Link>
          );
        })}
      </nav>
      {/* Account Info */}
      {accountInfo && !collapsed && (
        <div style={{
          background: 'rgba(255,255,255,0.10)',
          borderRadius: 12,
          margin: '0 18px',
          padding: '14px 16px',
          color: '#e0f2fe',
          fontSize: 14,
          marginTop: 12,
          boxShadow: '0 2px 8px #bae6fd33',
        }}>
          <div><strong>Type:</strong> {accountInfo.type || '-'}</div>
        </div>
      )}
    </div>
  );
}

export default DashboardLayout;
