import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Badge, Button, Tabs, Tab, ProgressBar } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { applicationAPI, workerAPI, paymentAPI, messageAPI } from '../services/api';
import { useLanguage } from '../hooks/useLanguage';
import { AuthContext } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
// import SimpleBarChart from '../components/SimpleBarChart';

const WorkerDashboard = () => {
  const { t } = useLanguage();
  const { user } = useContext(AuthContext);
  const location = useLocation();
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

  const formatUpdatedBy = (updatedBy) => {
    if (updatedBy === 'worker') return 'Worker';
    if (updatedBy === 'employer') return 'Employer';
    if (updatedBy === 'admin') return 'Admin';
    return 'System';
  };

  if (loading) {
    return (
      <Container className="my-5 text-center">
        <div className="spinner-border text-primary" role="status" />
      </Container>
    );
  }

  // If on /messages or /messages/:id, show MessageInbox inside DashboardLayout (so sidebar is always visible)
  if (location.pathname.startsWith('/messages')) {
    // Lazy import to avoid circular dependency
    const MessageInbox = React.lazy(() => import('./MessageInbox'));
    return (
      <Container className="py-4">
        <DashboardLayout
          title={<span style={{display:'flex',alignItems:'center',gap:10}}>
            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name||'U')}&background=10b981&color=fff&rounded=true&size=48`} alt="avatar" style={{width:48,height:48,borderRadius:'50%',boxShadow:'0 2px 8px rgba(16,185,129,0.15)'}} />
            <span>Welcome, {user?.name?.split(' ')[0]||'User'}!</span>
          </span>}
          subtitle={<span style={{display:'flex',alignItems:'center',gap:12}}>
            <span>Direct coordination with Admin/Employer. No job apply needed.</span>
          </span>}
          menuItems={[
            { to: '/worker/dashboard', label: 'Dashboard', icon: '🏠' },
            { to: '/messages', label: 'Messages', icon: '💬' },
            { to: '/worker/payments', label: 'Payments', icon: '💳' },
            { to: '/profile', label: 'Profile', icon: '👤' },
          ]}
          accountInfo={{
            name: user?.name,
            email: user?.email,
            type: 'Worker',
          }}
        >
          <React.Suspense fallback={<div className="text-center my-5"><div className="spinner-border text-primary" /></div>}>
            <MessageInbox />
          </React.Suspense>
        </DashboardLayout>
      </Container>
    );
  }

  // Default dashboard content
  return (
    <Container className="py-4">
      <DashboardLayout
        title={<span style={{display:'flex',alignItems:'center',gap:10}}>
          <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name||'U')}&background=10b981&color=fff&rounded=true&size=48`} alt="avatar" style={{width:48,height:48,borderRadius:'50%',boxShadow:'0 2px 8px rgba(16,185,129,0.15)'}} />
          <span>Welcome, {user?.name?.split(' ')[0]||'User'}!</span>
        </span>}
        subtitle={<span style={{display:'flex',alignItems:'center',gap:12}}>
          <span>Direct coordination with Admin/Employer. No job apply needed.</span>
        </span>}
        menuItems={[
          { to: '/worker/dashboard', label: 'Dashboard', icon: '🏠' },
          { to: '/messages', label: 'Messages', icon: '💬' },
          { to: '/worker/payments', label: 'Payments', icon: '💳' },
          { to: '/profile', label: 'Profile', icon: '👤' },
        ]}
        accountInfo={{
          name: user?.name,
          email: user?.email,
          type: 'Worker',
        }}
      >
      {/* Only show Messages, Payments, and Profile update */}
      {/* Beautiful info section for workers */}
      <Row className="g-4">
        <Col md={12}>
          <div style={{
            background: 'linear-gradient(135deg, #f0fdfa 0%, #e0f2fe 100%)',
            border: '2px solid #bae6fd',
            borderRadius: 18,
            padding: '2.5rem 1.5rem',
            marginBottom: 32,
            display: 'flex',
            alignItems: 'center',
            gap: 32,
            boxShadow: '0 4px 24px rgba(59,130,246,0.08)'
          }}>
            <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="Worker" style={{width: 120, height: 120, borderRadius: '50%', boxShadow: '0 2px 8px #bae6fd'}} />
            <div>
              <h2 style={{fontWeight: 700, color: '#0ea5e9', marginBottom: 12}}>Welcome to Your Worker Panel!</h2>
              <ul style={{fontSize: 18, color: '#0369a1', marginBottom: 0, paddingLeft: 20}}>
                <li>Apply for jobs directly from the platform</li>
                <li>Chat with admin or employer for any help</li>
                <li>Mark your work as complete after finishing</li>
                <li>Track your payments and update your profile</li>
              </ul>
              <div style={{marginTop: 18, color: '#059669', fontWeight: 600, fontSize: 20}}>
                Your success is our priority! 🚀
              </div>
            </div>
          </div>
        </Col>
                {/* Mark as Complete for accepted jobs */}
                {applications.filter(a => a.status === 'accepted').length > 0 && (
                  <Col md={12}>
                    <Card className="border-0 rounded-4 shadow-lg mb-4">
                      <Card.Body className="p-4 text-center">
                        <div className="fs-1 mb-2">✅</div>
                        <h4 className="fw-bold mb-2">Mark Work as Completed</h4>
                        <p className="text-muted mb-3">Click below after you finish your assigned work. Employer/Admin will verify and release payment.</p>
                        {applications.filter(a => a.status === 'accepted').map(a => (
                          <Button
                            key={a._id}
                            variant="success"
                            size="md"
                            className="m-1"
                            disabled={completingId === a._id}
                            onClick={() => handleMarkCompleted(a._id)}
                          >
                            {completingId === a._id ? 'Marking...' : `Mark Complete (Job: ${a.jobId?.title || 'N/A'})`}
                          </Button>
                        ))}
                      </Card.Body>
                    </Card>
                  </Col>
                )}
        {/* Show Message Employer button if assigned to a job */}
        {applications.filter(a => ['accepted','completed'].includes(a.status) && a.employerId?.userId?._id).length > 0 && (
          <Col md={12}>
            <Card className="border-0 rounded-4 shadow-lg mb-4">
              <Card.Body className="p-4 text-center">
                <div className="fs-1 mb-2">💬</div>
                <h4 className="fw-bold mb-2">Message Employer</h4>
                <p className="text-muted mb-3">You can directly chat with your employer for assigned jobs.</p>
                {applications.filter(a => ['accepted','completed'].includes(a.status) && a.employerId?.userId?._id).map(a => (
                  <Button
                    key={a._id}
                    as={Link}
                    to={`/messages/${a.employerId.userId._id}`}
                    variant="primary"
                    size="md"
                    className="m-1"
                  >
                    Message {a.employerId.userId.name || 'Employer'} (Job: {a.jobId?.title || 'N/A'})
                  </Button>
                ))}
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>
      </DashboardLayout>
    </Container>
  );
};

export default WorkerDashboard;
