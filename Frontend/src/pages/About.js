import React from 'react';
import { Container, Row, Col, Card, Badge, Accordion } from 'react-bootstrap';

const About = () => {
  return (
    <Container className="my-4 my-md-5">
      <Card className="border-0 shadow-sm rounded-4 mb-4 about-hero-card">
        <Card.Body className="p-4 p-md-5 text-center">
          <h2 className="fw-bold mb-2">🌾 About Rural Employment Platform</h2>
          <p className="text-muted mb-4">
            A trusted platform where workers and employers connect directly, safely, and transparently.
          </p>
          <div className="d-flex justify-content-center flex-wrap gap-2 mb-4">
            <Badge bg="dark" className="px-3 py-2">Direct Hiring</Badge>
            <Badge bg="secondary" className="px-3 py-2">Secure Payments</Badge>
            <Badge bg="success" className="px-3 py-2">Role-based Access</Badge>
          </div>

          <Row className="g-3 text-start">
            <Col md={4}>
              <Card className="border-0 shadow-sm rounded-3 h-100">
                <Card.Body>
                  <div className="small text-muted">Users</div>
                  <h5 className="mb-1">Workers + Employers</h5>
                  <div className="text-muted small">Direct connection model</div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="border-0 shadow-sm rounded-3 h-100">
                <Card.Body>
                  <div className="small text-muted">Payments</div>
                  <h5 className="mb-1">Advance + Final Release</h5>
                  <div className="text-muted small">Safe payment lifecycle</div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="border-0 shadow-sm rounded-3 h-100">
                <Card.Body>
                  <div className="small text-muted">Transparency</div>
                  <h5 className="mb-1">Live Job and Payment Status</h5>
                  <div className="text-muted small">Track every step clearly</div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <h4 className="fw-bold mb-3">👥 Who uses this platform</h4>
      <Row className="g-3 mb-4">
        <Col md={4}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-4">
              <h5 className="fw-bold mb-2">👷 Worker</h5>
              <p className="mb-3 text-muted">
                Worker can register, apply for jobs, track status, mark work complete, and receive payment.
              </p>
              <ul className="mb-0 text-muted small">
                <li>Apply for approved jobs</li>
                <li>Track accepted/completed work</li>
                <li>Check earnings history</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-4">
              <h5 className="fw-bold mb-2">🏢 Employer</h5>
              <p className="mb-3 text-muted">
                Employer can post jobs, accept workers, pay advance, mark completion, and release final payment.
              </p>
              <ul className="mb-0 text-muted small">
                <li>Post and manage jobs</li>
                <li>Hire and track workers</li>
                <li>Pay via Razorpay</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="border-0 shadow-sm rounded-4 mb-4">
        <Card.Body className="p-4">
          <h4 className="fw-bold mb-3">💳 Payment Flow (Step-by-Step)</h4>
          <Row className="g-3">
            <Col md={6} lg={4}><Card className="border rounded-3 h-100"><Card.Body><strong>1.</strong> Application Accepted</Card.Body></Card></Col>
            <Col md={6} lg={4}><Card className="border rounded-3 h-100"><Card.Body><strong>2.</strong> Employer pays Advance</Card.Body></Card></Col>
            <Col md={6} lg={4}><Card className="border rounded-3 h-100"><Card.Body><strong>3.</strong> Work is Completed</Card.Body></Card></Col>
            <Col md={6} lg={6}><Card className="border rounded-3 h-100"><Card.Body><strong>4.</strong> Employer releases Final Payment</Card.Body></Card></Col>
            <Col md={6} lg={6}><Card className="border rounded-3 h-100"><Card.Body><strong>5.</strong> Worker receives payment directly</Card.Body></Card></Col>
          </Row>
        </Card.Body>
      </Card>

      <Row className="g-3 mb-4">
        <Col lg={6}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-4">
              <h4 className="fw-bold mb-3">✅ Why this platform is useful</h4>
              <Row className="g-3 text-muted">
                <Col md={6}><div>• Direct worker-employer connection</div></Col>
                <Col md={6}><div>• No middleman exploitation</div></Col>
                <Col md={6}><div>• Transparent status tracking</div></Col>
                <Col md={6}><div>• Secure digital payment flow</div></Col>
                <Col md={6}><div>• Direct worker payout after completion</div></Col>
                <Col md={6}><div>• Mobile-friendly Bootstrap interface</div></Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-4">
              <h4 className="fw-bold mb-3">❓ Frequently Asked Questions</h4>
              <Accordion flush>
                <Accordion.Item eventKey="0">
                  <Accordion.Header>Who can post jobs?</Accordion.Header>
                  <Accordion.Body>Only employer accounts can post jobs.</Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="1">
                  <Accordion.Header>When is final payment released?</Accordion.Header>
                  <Accordion.Body>After work completion, employer releases final payment directly to worker.</Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="2">
                  <Accordion.Header>Is payment status trackable?</Accordion.Header>
                  <Accordion.Body>Yes. Worker and employer dashboards show payment status and progress.</Accordion.Body>
                </Accordion.Item>
              </Accordion>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default About;
