import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer mt-auto">
      <Container>
        <Row className="g-3">
          <Col md={6}>
            <h5 className="mb-2">🌾 Rural Employment Platform</h5>
            <p className="mb-0">Connecting workers and employers directly with secure, transparent payments.</p>
          </Col>
          <Col md={3}>
            <h6 className="mb-2">Quick Links</h6>
            <div className="d-flex flex-column gap-1">
              <Link to="/" className="footer-link">Home</Link>
              <Link to="/about" className="footer-link">About</Link>
              <Link to="/jobs" className="footer-link">Jobs</Link>
            </div>
          </Col>
          <Col md={3}>
            <h6 className="mb-2">Support</h6>
            <p className="mb-1">Email: support@ruralemp.com</p>
            <p className="mb-0">© {new Date().getFullYear()} Rural Employment</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
