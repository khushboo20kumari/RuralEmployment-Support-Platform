import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Navbar as BSNavbar, Nav, Container, Button, Dropdown } from 'react-bootstrap';
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

  return (
    <BSNavbar bg="dark" variant="dark" expand="lg" sticky="top" className="navbar-custom">
      <Container>
        <BSNavbar.Brand as={Link} to="/" className="fw-bold">
          🌾 ग्रामीण रोजगार मंच
        </BSNavbar.Brand>
        <BSNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BSNavbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/" className="nav-link-item">
              🏠 होम
            </Nav.Link>
            <Nav.Link as={Link} to="/jobs" className="nav-link-item">
              💼 काम देखें
            </Nav.Link>
            
            {/* Language Toggle */}
            <div className="nav-link-item">
              <Button 
                variant="outline-info" 
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
                {user.userType === 'worker' && (
                  <Dropdown className="nav-link-item">
                    <Dropdown.Toggle variant="none" id="worker-dropdown" className="nav-link">
                      👷 मज़दूर मेनू
                    </Dropdown.Toggle>
                    <Dropdown.Menu align="end">
                      <Dropdown.Item as={Link} to="/worker/dashboard">
                        📊 डैशबोर्ड
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/worker/applications">
                        📋 मेरी अर्ज़ियाँ
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/worker/payments">
                        💰 मेरी कमाई
                      </Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Item as={Link} to="/profile">
                        👤 प्रोफाइल
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                )}
                
                {user.userType === 'employer' && (
                  <Dropdown className="nav-link-item">
                    <Dropdown.Toggle variant="none" id="employer-dropdown" className="nav-link">
                      🏢 मालिक मेनू
                    </Dropdown.Toggle>
                    <Dropdown.Menu align="end">
                      <Dropdown.Item as={Link} to="/employer/dashboard">
                        📊 डैशबोर्ड
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/employer/post-job">
                        ➕ काम डालें
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/employer/payments">
                        💳 भुगतान
                      </Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Item as={Link} to="/profile">
                        👤 प्रोफाइल
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                )}
                
                {user.userType === 'admin' && (
                  <Dropdown className="nav-link-item">
                    <Dropdown.Toggle variant="none" id="admin-dropdown" className="nav-link">
                      👨‍⚖️ एडमिन मेनू
                    </Dropdown.Toggle>
                    <Dropdown.Menu align="end">
                      <Dropdown.Item as={Link} to="/admin/dashboard">
                        📊 डैशबोर्ड
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/profile">
                        👤 प्रोफाइल
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                )}
                
                <div className="nav-link-item">
                  <Button 
                    variant="outline-danger" 
                    onClick={logout} 
                    size="sm"
                    className="fw-bold"
                  >
                    🚪 लॉगआउट
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login" className="nav-link-item">
                  🔓 लॉगिन
                </Nav.Link>
                <div className="nav-link-item">
                  <Button 
                    as={Link} 
                    to="/register" 
                    variant="primary" 
                    size="sm"
                    className="fw-bold"
                  >
                    ✨ रजिस्टर
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
