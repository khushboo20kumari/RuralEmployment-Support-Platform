import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Card, Row, Col, Badge, Button, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { applicationAPI } from '../services/api';

const EmployerApplications = () => {
  const { jobId } = useParams();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [notesById, setNotesById] = useState({});

  const fetchApplications = useCallback(async () => {
    try {
      const res = await applicationAPI.getJobApplications(jobId);
      setApplications(res.data.applications || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Applications load karne me dikkat hui');
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const updateStatus = async (applicationId, status) => {
    try {
      setBusyId(applicationId);
      await applicationAPI.updateStatus(applicationId, {
        status,
        employerNotes: notesById[applicationId] || '',
      });
      toast.success(status === 'accepted' ? 'Worker accepted successfully' : 'Application rejected');
      fetchApplications();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Status update nahi ho paaya');
    } finally {
      setBusyId(null);
    }
  };

  const startWork = async (applicationId) => {
    try {
      setBusyId(applicationId);
      await applicationAPI.startWork(applicationId);
      toast.success('Work started. Now daily attendance mark kar sakte hain.');
      fetchApplications();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Work start nahi ho paaya');
    } finally {
      setBusyId(null);
    }
  };

  const markAttendance = async (applicationId) => {
    try {
      setBusyId(applicationId);
      await applicationAPI.markAttendance(applicationId);
      toast.success('Aaj ka attendance mark ho gaya');
      fetchApplications();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Attendance mark nahi ho paaya');
    } finally {
      setBusyId(null);
    }
  };

  const markComplete = async (applicationId) => {
    if (!window.confirm('Kya ye kaam complete ho gaya hai?')) return;

    try {
      setBusyId(applicationId);
      await applicationAPI.employerComplete(applicationId);
      toast.success('Work completed. Ab Payments page me final payment button use karein.');
      fetchApplications();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Complete mark nahi ho paaya');
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <Container className="my-5 text-center">
        <div className="spinner-border text-primary" role="status" />
      </Container>
    );
  }

  return (
    <Container className="my-3 my-md-4">
      <div className="mb-4">
        <h3 className="fw-bold mb-1">📋 Worker Applications</h3>
        <p className="text-muted mb-0">Accept worker → Start work → Mark daily attendance → Mark completed</p>
      </div>

      {applications.length === 0 ? (
        <Card className="shadow-sm border-0 rounded-4">
          <Card.Body className="text-center py-5 text-muted">No applications received for this job yet.</Card.Body>
        </Card>
      ) : (
        applications.map((app) => {
          const normalizedStatus = (app.status || '').toLowerCase();
          const canTakeDecision = ['applied', 'shortlisted', 'cancelled'].includes(normalizedStatus);
          const isBusy = busyId === app._id;
          return (
            <Card key={app._id} className="shadow-sm border-0 rounded-4 mb-3">
              <Card.Body>
                <Row>
                  <Col md={8}>
                    <h5 className="fw-semibold mb-1">👷 {app.workerId?.userId?.name || 'Worker'}</h5>
                    <p className="text-muted mb-2">Experience: {app.workerId?.experience || 0} years</p>

                    <Badge
                      bg={
                        normalizedStatus === 'accepted'
                          ? 'success'
                          : normalizedStatus === 'rejected'
                          ? 'danger'
                          : normalizedStatus === 'completed'
                          ? 'info'
                          : 'primary'
                      }
                      className="mb-2"
                    >
                      {normalizedStatus || 'applied'}
                    </Badge>

                    <div className="small mb-2">
                      <div><strong>Applied Message:</strong> {app.appliedMessage || 'N/A'}</div>
                      <div><strong>Attendance:</strong> {app.attendanceCount || 0} day(s)</div>
                      <div>
                        <strong>Work Started:</strong>{' '}
                        {app.workStarted ? new Date(app.workStartedDate || app.startDate).toLocaleDateString('en-IN') : 'No'}
                      </div>
                    </div>

                    <Form.Control
                      type="text"
                      placeholder="Optional note for worker"
                      value={notesById[app._id] || ''}
                      onChange={(e) => setNotesById({ ...notesById, [app._id]: e.target.value })}
                    />
                  </Col>

                  <Col md={4} className="mt-3 mt-md-0">
                    <div className="d-grid gap-2">
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => updateStatus(app._id, 'accepted')}
                        disabled={isBusy || !canTakeDecision}
                      >
                        ✅ Accept
                      </Button>

                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => updateStatus(app._id, 'rejected')}
                        disabled={isBusy || !canTakeDecision}
                      >
                        ❌ Reject
                      </Button>

                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() => startWork(app._id)}
                        disabled={isBusy || normalizedStatus !== 'accepted' || app.workStarted}
                      >
                        🚀 Start Work
                      </Button>

                      <Button
                        size="sm"
                        variant="outline-info"
                        onClick={() => markAttendance(app._id)}
                        disabled={isBusy || normalizedStatus !== 'accepted' || !app.workStarted}
                      >
                        📍 Mark Daily Attendance
                      </Button>

                      <Button
                        size="sm"
                        variant="outline-success"
                        onClick={() => markComplete(app._id)}
                        disabled={isBusy || normalizedStatus !== 'accepted' || !app.workStarted}
                      >
                        ✔️ Mark Completed
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          );
        })
      )}
    </Container>
  );
};

export default EmployerApplications;
