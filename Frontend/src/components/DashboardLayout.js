import React from 'react';
import { Row, Col, Card, Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

const DashboardLayout = ({ title, subtitle, menuItems = [], accountInfo, children }) => {
  const location = useLocation();

  return (
    <div className="dashboard-layout">
      <Row>
        <Col lg={3} className="mb-3">
          <Card className="dashboard-sidebar sticky-top" style={{ top: '90px' }}>
            <Card.Body>
              <h5 className="mb-1">{title}</h5>
              {subtitle && <p className="text-muted small mb-3">{subtitle}</p>}

              <Nav className="flex-column gap-2 mb-3">
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.to;
                  return (
                    <Nav.Link
                      key={item.to}
                      as={Link}
                      to={item.to}
                      className={`dashboard-side-link ${isActive ? 'active' : ''}`}
                    >
                      <span className="me-2">{item.icon}</span>
                      {item.label}
                    </Nav.Link>
                  );
                })}
              </Nav>

              {accountInfo && (
                <Card className="bg-light border-0">
                  <Card.Body className="p-2">
                    <p className="mb-1 small"><strong>Account:</strong> {accountInfo.name || '-'}</p>
                    <p className="mb-1 small"><strong>Email:</strong> {accountInfo.email || '-'}</p>
                    <p className="mb-0 small"><strong>Type:</strong> {accountInfo.type || '-'}</p>
                  </Card.Body>
                </Card>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={9}>{children}</Col>
      </Row>
    </div>
  );
};

export default DashboardLayout;
