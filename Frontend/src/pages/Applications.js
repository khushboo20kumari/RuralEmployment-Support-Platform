import React, { useState, useEffect } from 'react';
import { Container, Card, Badge, Button, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { applicationAPI, messageAPI } from '../services/api';

const Applications = () => {
  const navigate = useNavigate();
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
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (applicationId) => {
    if (window.confirm('Are you sure you want to cancel this application?')) {
      try {
        await applicationAPI.cancel(applicationId);
        toast.success('Application cancelled');
        fetchApplications();
      } catch (error) {
        toast.error('Failed to cancel application');
      }
    }
  };

  const handleMarkCompleted = async (applicationId) => {
    if (window.confirm('Have you completed this job? The employer can then release your final payment.')) {
      try {
        await applicationAPI.markAsCompleted(applicationId);
        toast.success('✅ Job marked complete! Employer has been notified.');
        fetchApplications();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to mark job complete');
      }
    }
  };

  const handleUpdateProgress = async (applicationId, progressPercent) => {
    try {
      const note = window.prompt('Short progress note (optional):', '');
      await applicationAPI.updateWorkProgress(applicationId, { progressPercent, note: note || '' });
      toast.success(`Progress updated to ${progressPercent}%`);
      fetchApplications();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update progress');
    }
  };

  const formatUpdatedBy = (updatedBy) => {
    if (updatedBy === 'worker') return 'Worker';
    if (updatedBy === 'employer') return 'Employer';
    if (updatedBy === 'admin') return 'Admin';
    return 'System';
  };

  const formatPaymentStatus = (paymentStatus) => {
    if (!paymentStatus) return 'Not started';
    if (paymentStatus === 'advance_paid') return 'Advance paid by employer';
    if (paymentStatus === 'pending') return 'On platform, waiting release';
    if (paymentStatus === 'completed') return 'Released to worker';
    if (paymentStatus === 'failed') return 'Payment failed';
    return paymentStatus;
  };

  const openGroupChat = async (jobId) => {
    try {
      const response = await messageAPI.getOrCreateJobGroup(jobId);
      const groupChatId = response.data?.chat?._id;
      if (!groupChatId) {
        toast.error('Group chat not available');
        return;
      }
      navigate(`/messages/group/${groupChatId}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to open group chat');
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
          {applications.map((app) => {
            const normalizedStatus = (app.status || '').toLowerCase();

            return (
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
                            normalizedStatus === 'accepted' ? 'success' :
                            normalizedStatus === 'rejected' ? 'danger' :
                            normalizedStatus === 'applied' ? 'primary' : 
                            normalizedStatus === 'shortlisted' ? 'warning' :
                            normalizedStatus === 'completed' ? 'info' : 'secondary'
                          }
                          className="me-2 px-3 py-2"
                          style={{ fontSize: '0.9rem' }}
                        >
                          {normalizedStatus === 'accepted'
                            ? '✅ Accepted'
                            : normalizedStatus === 'rejected'
                            ? '❌ Rejected'
                            : normalizedStatus === 'applied'
                            ? '📤 Applied'
                            : normalizedStatus === 'shortlisted'
                            ? '📝 Shortlisted'
                            : normalizedStatus === 'completed'
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
                        <p className="mb-1">
                          <strong>🗓️ Work Duration:</strong>{' '}
                          {app.jobId?.startDate ? new Date(app.jobId.startDate).toLocaleDateString('en-IN') : '-'}
                          {' '}to{' '}
                          {app.jobId?.endDate ? new Date(app.jobId.endDate).toLocaleDateString('en-IN') : '-'}
                        </p>
                        {normalizedStatus === 'accepted' && (
                          <p className="mb-1">
                            <strong>🚀 Work Started:</strong> {app.workStarted ? 'Yes' : 'Not started yet by employer'}
                          </p>
                        )}
                        {normalizedStatus === 'accepted' && (
                          <p className="mb-1">
                            <strong>📍 Attendance Marked:</strong> {app.attendanceCount || 0} day(s)
                          </p>
                        )}
                        {normalizedStatus === 'accepted' && (
                          <p className="mb-1">
                            <strong>📈 Latest Progress:</strong>{' '}
                            {(() => {
                              const updates = app.progressUpdates || [];
                              if (!updates.length) return '0%';
                              const latest = updates[updates.length - 1];
                              return `${latest.progressPercent || 0}%`;
                            })()}
                          </p>
                        )}
                        <p className="mb-1">
                          <strong>💳 Payment Status:</strong> {formatPaymentStatus(app.latestPayment?.status)}
                          {app.latestPayment?.updatedAt && (
                            <span className="text-muted"> • {new Date(app.latestPayment.updatedAt).toLocaleString('en-IN')}</span>
                          )}
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

                      <div className="mt-2 p-2 bg-light rounded-3">
                        <strong className="small">Shared Work Updates:</strong>
                        {(() => {
                          const updates = app.progressUpdates || [];
                          if (!updates.length) {
                            return <p className="mb-0 small text-muted">No progress updates yet.</p>;
                          }

                          return (
                            <div className="small mt-1">
                              {updates.slice(-3).reverse().map((update, idx) => (
                                <div key={`${app._id}-progress-${idx}`} className="mb-1">
                                  <span className="fw-semibold">{update.progressPercent || 0}%</span> • {update.note || 'Progress updated'}
                                  <div className="text-muted">
                                    {formatUpdatedBy(update.updatedBy)} • {new Date(update.updatedAt).toLocaleString('en-IN')}
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                    </Col>
                    
                    <Col xs={12} lg={4} className="text-lg-end">
                      <div className="d-grid gap-2">
                        {normalizedStatus === 'accepted' && (
                          <>
                            <div className="d-flex gap-1 flex-wrap mb-1 justify-content-lg-end">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="rounded-3"
                                onClick={() => handleUpdateProgress(app._id, 25)}
                              >
                                25%
                              </Button>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="rounded-3"
                                onClick={() => handleUpdateProgress(app._id, 50)}
                              >
                                50%
                              </Button>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="rounded-3"
                                onClick={() => handleUpdateProgress(app._id, 75)}
                              >
                                75%
                              </Button>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="rounded-3"
                                onClick={() => handleUpdateProgress(app._id, 100)}
                              >
                                100%
                              </Button>
                            </div>

                          </>
                        )}
                        {normalizedStatus === 'accepted' && (
                          <Button 
                            variant="success" 
                            size="sm"
                            className="rounded-3"
                            onClick={() => handleMarkCompleted(app._id)}
                          >
                            ✅ काम पूरा हुआ (Mark Completed)
                          </Button>
                        )}
                        {['accepted', 'completed'].includes(normalizedStatus) && (
                          <Button
                            variant="outline-info"
                            size="sm"
                            className="rounded-3"
                            onClick={() => openGroupChat(app.jobId?._id)}
                          >
                            💬 Group Chat (Admin + Employer)
                          </Button>
                        )}
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          className="rounded-3"
                          onClick={() => handleCancel(app._id)}
                          disabled={!['applied', 'shortlisted'].includes(normalizedStatus)}
                        >
                          ❌ Cancel
                        </Button>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
            );
          })}
        </Row>
      )}
    </Container>
  );
};

export default Applications;
