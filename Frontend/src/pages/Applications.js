import React, { useState, useEffect } from 'react';
import { Container, Card, Badge, Button, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { applicationAPI } from '../services/api';
import { useLanguage } from '../hooks/useLanguage';

const Applications = () => {
  const { t } = useLanguage();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await applicationAPI.getMyApplications();
      setApplications(response.data.applications);
    } catch (error) {
      toast.error('अर्ज़ियाँ लाने में दिक्कत हुई');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (applicationId) => {
    if (window.confirm('क्या आप यह अर्ज़ी रद्द करना चाहते हैं?')) {
      try {
        await applicationAPI.cancel(applicationId);
        toast.success('अर्ज़ी रद्द हो गई');
        fetchApplications();
      } catch (error) {
        toast.error('अर्ज़ी रद्द करने में दिक्कत हुई');
      }
    }
  };

  if (loading) {
    return (
      <Container className="my-3 my-md-5 text-center">
        <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }

  return (
    <Container className="my-3 my-md-5 py-2">
      <div className="mb-4">
        <h2 className="fw-bold mb-2">📋 My Applications</h2>
        <p className="text-muted">Track all your job applications</p>
      </div>

      {applications.length === 0 ? (
        <Card className="shadow-sm border-0 rounded-4">
          <Card.Body className="text-center py-5">
            <div style={{ fontSize: '4rem' }} className="mb-3">📭</div>
            <h4 className="fw-bold mb-2">No Applications Yet</h4>
            <p className="text-muted mb-4">Apply to jobs and track them here</p>
            <Button as={Link} to="/jobs" variant="primary" size="lg" className="rounded-3 px-4">
              🔍 Browse Jobs
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Row>
          {applications.map((app) => (
            <Col xs={12} key={app._id} className="mb-3">
              <Card className="shadow-sm border-0 rounded-4 overflow-hidden">
                <Card.Body className="p-3 p-md-4">
                  <Row className="align-items-start">
                    <Col xs={12} lg={8} className="mb-3 mb-lg-0">
                      <div className="d-flex align-items-start mb-2">
                        <div className="me-2" style={{ fontSize: '1.5rem' }}>💼</div>
                        <div>
                          <h5 className="fw-bold mb-1">{app.jobId?.title || 'Job'}</h5>
                          <p className="text-muted small mb-2">
                            🏢 {app.employerId?.companyName || 'Company'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mb-2">
                        <Badge 
                          bg={
                            app.status === 'accepted' ? 'success' :
                            app.status === 'rejected' ? 'danger' :
                            app.status === 'applied' ? 'primary' : 
                            app.status === 'completed' ? 'info' : 'secondary'
                          }
                          className="me-2 px-3 py-2"
                          style={{ fontSize: '0.9rem' }}
                        >
                          {app.status === 'accepted'
                            ? '✅ Accepted'
                            : app.status === 'rejected'
                            ? '❌ Rejected'
                            : app.status === 'applied'
                            ? '📤 Applied'
                            : app.status === 'completed'
                            ? '✔️ Completed'
                            : '⏳ Processing'}
                        </Badge>
                      </div>

                      <div className="small">
                        <p className="mb-1">
                          <strong>📍 Location:</strong> {app.jobId?.location?.district}, {app.jobId?.location?.state}
                        </p>
                        <p className="mb-1">
                          <strong>💰 Salary:</strong> ₹{app.jobId?.salary?.amount} / {app.jobId?.salary?.period}
                        </p>
                        <p className="mb-1">
                          <strong>📅 Applied:</strong> {new Date(app.applicationDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>

                      {app.appliedMessage && (
                        <div className="mt-2 p-2 bg-light rounded-3">
                          <strong className="small">Your Message:</strong>
                          <p className="mb-0 small text-muted">{app.appliedMessage}</p>
                        </div>
                      )}
                      {app.employerNotes && (
                        <div className="mt-2 p-2 bg-info bg-opacity-10 rounded-3">
                          <strong className="small">Employer Note:</strong>
                          <p className="mb-0 small text-muted">{app.employerNotes}</p>
                        </div>
                      )}
                    </Col>
                    
                    <Col xs={12} lg={4} className="text-lg-end">
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        className="rounded-3 w-100 w-lg-auto"
                        onClick={() => handleCancel(app._id)}
                        disabled={app.status !== 'applied'}
                      >
                        ❌ Cancel
                      </Button>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default Applications;
