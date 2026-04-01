import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { applicationAPI, workerAPI, paymentAPI, messageAPI } from '../services/api';
import { useLanguage } from '../hooks/useLanguage';
import { AuthContext } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';

const WorkerDashboard = () => {
  const { t } = useLanguage();
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    activeApplications: 0,
    acceptedApplications: 0,
    completedJobs: 0,
    totalEarnings: 0,
  });
  const [applications, setApplications] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [completingId, setCompletingId] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleMarkCompleted = async (applicationId) => {
    if (!window.confirm(t('workerDashboard.markCompletedConfirm'))) {
      return;
    }
    setCompletingId(applicationId);
    try {
      await applicationAPI.markAsCompleted(applicationId);
      toast.success(t('workerDashboard.completedSuccess'));
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || t('workerDashboard.completedError'));
    } finally {
      setCompletingId(null);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const [applicationsRes, paymentsRes, profileRes] = await Promise.all([
        applicationAPI.getWorkerApplications(),
        paymentAPI.getWorkerPayments(),
        workerAPI.getProfile(),
      ]);
      const apps = applicationsRes.data.applications || [];
      const payments = paymentsRes.data.payments || [];
      const profile = profileRes.data.worker;
      setApplications(apps);
      setProfile(profile);
      // Calculate stats
      const active = apps.filter((a) => ['applied', 'shortlisted'].includes(a.status)).length;
      const accepted = apps.filter((a) => a.status === 'accepted').length;
      const completed = apps.filter((a) => a.status === 'completed').length;
      const earnings = payments
        .filter((p) => p.status === 'completed')
        .reduce((sum, p) => sum + (p.netAmount || 0), 0);
      setStats({
        activeApplications: active,
        acceptedApplications: accepted,
        completedJobs: completed,
        totalEarnings: earnings,
      });
      // Calculate profile completion
      const fields = [
        profile?.skills?.length > 0,
        profile?.experience,
        profile?.dailyRate,
        profile?.monthlyRate,
        profile?.availability,
      ];
      const completion = (fields.filter(Boolean).length / fields.length) * 100;
      setProfileCompletion(Math.round(completion));
      try {
        const unreadRes = await messageAPI.getUnreadCount();
        setUnreadCount(Number(unreadRes.data?.unreadCount || 0));
      } catch (e) {
        setUnreadCount(0);
      }
    } catch (error) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
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
    <div className="worker-dashboard-layout" style={{ display: 'flex', minHeight: '100vh', background: '#f6f7f9', marginTop: 0, paddingTop: 0 }}>
      {/* Sidebar (40%) */}
      <div className="worker-dashboard-sidebar" style={{ width: '40%', minWidth: 240, maxWidth: 420, background: '#e0f2fe', borderRight: '1.5px solid #bae6fd', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 18px', boxSizing: 'border-box', marginTop: 0 }}>
        <div style={{ maxWidth: 320, width: '100%' }}>
          <Card className="mb-4" style={{ border: 'none', borderRadius: 18, boxShadow: '0 2px 12px #bae6fd33', background: '#fff' }}>
            <Card.Body className="d-flex flex-column align-items-center gap-3 p-4">
              <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name||'U')}&background=0ea5e9&color=fff&rounded=true&size=80`} alt="avatar" style={{ width: 80, height: 80, borderRadius: '50%', boxShadow: '0 2px 8px #bae6fd33', border: '3px solid #e0f2fe' }} />
              <div className="fw-bold" style={{ color: '#0ea5e9', fontSize: 22 }}>{user?.name?.split(' ')[0] || 'Worker'}</div>
              <div className="text-muted" style={{ fontSize: 15 }}>{user?.email}</div>
              <div style={{ fontSize: 15, color: '#059669', fontWeight: 600 }}>Worker</div>
              <div className="mt-3 w-100">
                <div className="fw-semibold mb-2" style={{ color: '#0369a1' }}>Quick Links</div>
                <div className="d-flex flex-wrap gap-2">
                  <Button as={Link} to="/jobs" variant="outline-primary" size="sm">Find Jobs</Button>
                  <Button as={Link} to="/worker/applications" variant="outline-success" size="sm">My Applications</Button>
                  <Button as={Link} to="/worker/payments" variant="outline-info" size="sm">Payments</Button>
                  <Button as={Link} to="/profile" variant="outline-dark" size="sm">Edit Profile</Button>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
      {/* Main Content (60%) */}
      <div className="worker-dashboard-main no-navbar-gap" style={{ width: '60%', minWidth: 0, padding: '0', marginTop: 0, marginBlockStart: 0, paddingTop: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>
        <div style={{ width: '100%', maxWidth: 700 }}>
          {/* Stats Row */}
          <Row className="dashboard-stats-row mb-4">
            <Col md={3} sm={6} xs={12} className="mb-3">
              <Card className="dashboard-stats-card">
                <div className="stat-label">Active Applications</div>
                <div className="stat-value">{stats.activeApplications}</div>
              </Card>
            </Col>
            <Col md={3} sm={6} xs={12} className="mb-3">
              <Card className="dashboard-stats-card">
                <div className="stat-label">Accepted Jobs</div>
                <div className="stat-value">{stats.acceptedApplications}</div>
              </Card>
            </Col>
            <Col md={3} sm={6} xs={12} className="mb-3">
              <Card className="dashboard-stats-card">
                <div className="stat-label">Completed Jobs</div>
                <div className="stat-value">{stats.completedJobs}</div>
              </Card>
            </Col>
            <Col md={3} sm={6} xs={12} className="mb-3">
              <Card className="dashboard-stats-card">
                <div className="stat-label">Total Earnings</div>
                <div className="stat-value">₹{stats.totalEarnings}</div>
              </Card>
            </Col>
          </Row>
          {/* Recent Applications */}
          <Card className="mb-4">
            <Card.Header className="fw-bold" style={{ background: '#e0f2fe' }}>Recent Applications</Card.Header>
            <Card.Body style={{ padding: '1.2rem' }}>
              {applications && applications.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Job Title</th>
                        <th>Status</th>
                        <th>Applied On</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.slice(0, 5).map(app => (
                        <tr key={app._id}>
                          <td>{app.job?.title || 'N/A'}</td>
                          <td><span className="badge bg-primary">{app.status}</span></td>
                          <td>{app.createdAt ? new Date(app.createdAt).toLocaleDateString() : '-'}</td>
                          <td>
                            {app.status === 'accepted' && (
                              <Button size="sm" variant="success" disabled={completingId === app._id} onClick={() => handleMarkCompleted(app._id)}>
                                {completingId === app._id ? 'Marking...' : 'Mark Completed'}
                              </Button>
                            )}
                            {app.status === 'completed' && (
                              <span className="text-success fw-bold">Completed</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-muted">No recent applications found.</div>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WorkerDashboard;
