import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar as BSNavbar, Nav, Container, Button, Badge } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import { useLanguage } from '../hooks/useLanguage';
import { messageAPI } from '../services/api';
import AuthModal from './AuthModal';
import Login from '../pages/Login';
import Register from '../pages/Register';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { language, toggleLanguage } = useLanguage();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'

  useEffect(() => {
    let timer;

    const fetchUnreadCount = async () => {
      if (!user) {
        setUnreadCount(0);
        return;
      }

      try {
        const response = await messageAPI.getUnreadCount();
        setUnreadCount(Number(response.data?.unreadCount || 0));
      } catch (error) {
        setUnreadCount(0);
      }
    };

    fetchUnreadCount();
    if (user) {
      timer = setInterval(fetchUnreadCount, 10000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [user]);

  const handleLanguageToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleLanguage();
  };

  const dashboardRoute = user?.userType === 'worker'
    ? '/worker/dashboard'
    : user?.userType === 'employer'
    ? '/employer/dashboard'
    : user?.userType === 'admin'
    ? '/admin/dashboard'
    : '/worker/dashboard';

  return (
    <>
      <BSNavbar
        expand="lg"
        sticky="top"
        className="navbar-custom"
        style={{
          background: 'linear-gradient(90deg, #e0f2fe 0%, #f8fafc 100%)',
          borderBottom: '1.5px solid #bae6fd',
          minHeight: 68,
          borderRadius: 0,
          boxShadow: '0 2px 16px 0 #bae6fd33',
          padding: '0 0',
        }}
      >
        <Container fluid style={{ maxWidth: 1400 }}>
          <BSNavbar.Brand
            as={Link}
            to="/"
            className="fw-bold d-flex align-items-center gap-2"
            style={{
              fontSize: '1.7rem',
              letterSpacing: 0.5,
              color: '#0ea5e9',
              padding: '0.2rem 0',
              borderRadius: 18,
              fontWeight: 900,
              background: 'none',
              boxShadow: 'none',
            }}
          >
            <span style={{fontSize: '2.1rem'}}>🌾</span> Rural Employment
          </BSNavbar.Brand>
          <BSNavbar.Toggle aria-controls="basic-navbar-nav" />
          <BSNavbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto align-items-center gap-2" style={{gap: 12}}>
              <Nav.Link as={Link} to="/" className="nav-link-item px-3 py-2 rounded-pill fw-semibold" style={{fontSize:'1.08rem', color:'#0369a1', transition:'all 0.18s', background:'#e0f2fe', marginRight:2}}>
                🏠 Home
              </Nav.Link>
              <Nav.Link as={Link} to="/jobs" className="nav-link-item px-3 py-2 rounded-pill fw-semibold" style={{fontSize:'1.08rem', color:'#0369a1', transition:'all 0.18s', background:'#e0f2fe', marginRight:2}}>
                All Jobs
              </Nav.Link>
              <Nav.Link as={Link} to="/about" className="nav-link-item px-3 py-2 rounded-pill fw-semibold" style={{fontSize:'1.08rem', color:'#0369a1', transition:'all 0.18s', background:'#e0f2fe', marginRight:2}}>
                About
              </Nav.Link>
              {/* Language Toggle */}
              <div className="nav-link-item">
                <Button
                  variant="outline-primary"
                  onClick={handleLanguageToggle}
                  size="sm"
                  className="fw-bold rounded-pill"
                  title="Toggle language / भाषा बदलें"
                  style={{ cursor: 'pointer', minWidth: '100px', border:'1.5px solid #0ea5e9', color:'#0ea5e9', background:'#f8fafc' }}
                >
                  🌐 {language === 'hi' ? 'English' : 'हिंदी'}
                </Button>
              </div>
              {user ? (
                <>
                  <Nav.Link as={Link} to={dashboardRoute} className="nav-link-item nav-dashboard-link px-3 py-2 rounded-pill fw-bold" style={{fontSize:'1.08rem',color:'#fff',background:'linear-gradient(90deg, #0ea5e9 0%, #38bdf8 100%)', boxShadow:'0 2px 8px #bae6fd33', marginRight:2}}>
                    📊 Dashboard
                  </Nav.Link>
                  <Nav.Link as={Link} to="/messages" className="nav-link-item position-relative px-3 py-2 rounded-pill fw-semibold" style={{fontSize:'1.08rem',color:'#0369a1',background:'#e0f2fe',marginRight:2}}>
                    💬 Messages
                    {unreadCount > 0 && (
                      <Badge bg="danger" pill className="ms-2">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </Badge>
                    )}
                  </Nav.Link>
                  <div className="nav-link-item">
                    <Button
                      variant="outline-danger"
                      onClick={logout}
                      size="sm"
                      className="fw-bold rounded-pill"
                      style={{border:'1.5px solid #ef4444', color:'#ef4444', background:'#fff'}}
                    >
                      🚪 Logout
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Nav.Link as={Link} to="#" className="nav-link-item px-3 py-2 rounded-pill fw-semibold" style={{fontSize:'1.08rem',color:'#0ea5e9',background:'#e0f2fe',marginRight:2}} onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}>
                    🔓 Login
                  </Nav.Link>
                  <div className="nav-link-item">
                    <Button
                      as={Link}
                      to="#"
                      variant="primary"
                      size="sm"
                      className="fw-bold rounded-pill"
                      style={{background:'linear-gradient(90deg, #0ea5e9 0%, #38bdf8 100%)', border:'none'}}
                      onClick={() => { setAuthMode('register'); setShowAuthModal(true); }}
                    >
                      ✨ Register
                    </Button>
                  </div>
                </>
              )}
            </Nav>
          </BSNavbar.Collapse>
        </Container>
      </BSNavbar>
      <AuthModal show={showAuthModal} onHide={() => setShowAuthModal(false)}>
        {authMode === 'login' ? <Login /> : <Register />}
      </AuthModal>
    </>
  );
};

export default Navbar;
