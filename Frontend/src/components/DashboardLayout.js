import React from 'react';
import { Row, Col, Card, Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { PersonFill, ChevronLeft, ChevronRight } from 'react-bootstrap-icons';

const DashboardLayout = ({ title, subtitle, menuItems = [], accountInfo, children }) => {
  const location = useLocation();

  return (
    <div className="dashboard-layout">
      <div className="dashboard-flex-wrap">
        {/* Sidebar - fixed, always visible, modern UI */}
        <Sidebar menuItems={menuItems} accountInfo={accountInfo} location={location} />
        {/* Main Content - with left margin for sidebar on desktop only */}
        <div className="dashboard-main-content">
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
  // Role icon by type
  const roleIcon = accountInfo?.type === 'worker' ? '👷' : accountInfo?.type === 'employer' ? '🏢' : accountInfo?.type === 'admin' ? '🛡️' : '👤';
  // Add marginTop to push below navbar (assume navbar height 64px)
  return (
    <div className="dashboard-sidebar" style={{
      width: collapsed ? 72 : 270,
      minWidth: collapsed ? 56 : 220,
      maxWidth: collapsed ? 80 : 320,
      background: 'linear-gradient(135deg, #e0f2fe 0%, #fff 100%)',
      color: '#1F2937',
      minHeight: '100vh',
      position: 'sticky',
      top: 64,
      left: 0,
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      padding: '0 0 24px 0',
      transition: 'all 0.2s',
      marginTop: 0,
      height: 'calc(100vh - 64px)',
      borderRight: '1.5px solid #bae6fd',
    }}>
      {/* Collapse/Expand Button */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        style={{
          background: '#e0f2fe',
          border: 'none',
          color: '#0ea5e9',
          fontSize: 22,
          position: 'absolute',
          top: 18,
          right: collapsed ? 10 : 18,
          cursor: 'pointer',
          zIndex: 10,
          borderRadius: '50%',
          width: 36,
          height: 36,
          boxShadow: '0 2px 8px #bae6fd33',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'right 0.2s, background 0.2s',
        }}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>
      {/* Logo/Avatar and Role */}
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
        <span style={{fontSize: 36, marginRight: collapsed ? 0 : 8}}>{roleIcon}</span>
        {!collapsed && (
          <div>
            <div style={{ fontWeight: 800, fontSize: 20, letterSpacing: 0.5, color: '#0ea5e9' }}>
              {accountInfo?.name?.split(' ')[0] || 'User'}
            </div>
            {/* Email removed as per requirement */}
            <div style={{ fontSize: 13, color: '#059669', fontWeight: 600, marginTop: 2 }}>{roleIcon} {accountInfo?.type ? accountInfo.type.charAt(0).toUpperCase() + accountInfo.type.slice(1) : ''}</div>
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
                background: isActive ? 'linear-gradient(90deg, #bae6fd 0%, #e0f2fe 100%)' : 'none',
                color: isActive ? '#0ea5e9' : '#0369a1',
                boxShadow: isActive ? '0 2px 8px #bae6fd33' : 'none',
                cursor: 'pointer',
                marginBottom: 8,
              }}
              title={item.label}
            >
              {!collapsed && item.label}
            </Link>
          );
        })}
      </nav>
      {/* Account Info */}
      {accountInfo && !collapsed && (
        <div style={{
          background: 'linear-gradient(90deg, #e0f2fe 0%, #fff 100%)',
          borderRadius: 12,
          margin: '0 18px',
          padding: '14px 16px',
          color: '#0369a1',
          fontSize: 14,
          marginTop: 12,
          boxShadow: '0 2px 8px #bae6fd33',
        }}>
          <div><strong>Role:</strong> {roleIcon} {accountInfo.type || '-'}</div>
        </div>
      )}
    </div>
  );
}

export default DashboardLayout;

/* Responsive main content wrapper */
/* Add this to App.css:
.dashboard-flex-wrap {
  display: flex;
  min-height: 100vh;
}
.dashboard-main-content {
  flex: 1;
  width: 100%;
  margin-left: 270px;
  transition: margin-left 0.2s;
}
@media (max-width: 991.98px) {
  .dashboard-main-content {
    margin-left: 0 !important;
  }
  .dashboard-flex-wrap {
    flex-direction: column;
  }
}
*/
