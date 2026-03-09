import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Navbar as BSNavbar, Nav, Container, Button } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import { useLanguage } from '../hooks/useLanguage';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { language, toggleLanguage } = useLanguage();

  const handleLanguageToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleLanguage();
  };

  const dashboardRoute = user?.userType === 'worker'
    ? '/worker/dashboard'
    : user?.userType === 'employer'
    ? '/employer/dashboard'
    : '/admin/dashboard';

  return (
    <BSNavbar bg="light" variant="light" expand="lg" sticky="top" className="navbar-custom">
      <Container>
        <BSNavbar.Brand as={Link} to="/" className="fw-bold">
          🌾 Rural Employment Platform
        </BSNavbar.Brand>
        <BSNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BSNavbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/" className="nav-link-item">
              🏠 Home
            </Nav.Link>
            <Nav.Link as={Link} to="/about" className="nav-link-item">
              ℹ️ About
            </Nav.Link>
            
            {/* Language Toggle */}
            <div className="nav-link-item">
              <Button 
                variant="outline-dark" 
                onClick={handleLanguageToggle}
                size="sm"
                className="fw-bold"
                title="Toggle language / भाषा बदलें"
                style={{ cursor: 'pointer', minWidth: '100px' }}
              >
                🌐 {language === 'hi' ? 'English' : 'हिंदी'}
              </Button>
            </div>
            
            {user ? (
              <>
                <Nav.Link as={Link} to={dashboardRoute} className="nav-link-item">
                  📊 Dashboard
                </Nav.Link>
                {user.userType !== 'admin' && (
                  <Nav.Link as={Link} to="/profile" className="nav-link-item">
                    👤 Account
                  </Nav.Link>
                )}
                
                <div className="nav-link-item">
                  <Button 
                    variant="outline-dark" 
                    onClick={logout} 
                    size="sm"
                    className="fw-bold"
                  >
                    🚪 Logout
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login" className="nav-link-item">
                  🔓 Login
                </Nav.Link>
                <div className="nav-link-item">
                  <Button 
                    as={Link} 
                    to="/register" 
                    variant="dark" 
                    size="sm"
                    className="fw-bold"
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
  );
};

export default Navbar;
