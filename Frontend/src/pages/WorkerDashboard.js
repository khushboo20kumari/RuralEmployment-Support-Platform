import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Badge, Button, Tabs, Tab, ProgressBar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { applicationAPI, workerAPI, paymentAPI } from '../services/api';
import { useLanguage } from '../hooks/useLanguage';
import { AuthContext } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import SimpleBarChart from '../components/SimpleBarChart';

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
    <Container className="py-4">
      <DashboardLayout
        title="👷 Worker Dashboard"
        subtitle="Simple menu for easy use"
        menuItems={[
          { to: '/worker/dashboard', label: 'Dashboard', icon: '🏠' },
          { to: '/jobs', label: 'Find Jobs', icon: '🔍' },
          { to: '/worker/applications', label: 'My Applications', icon: '📋' },
          { to: '/worker/payments', label: 'My Earnings', icon: '💳' },
          { to: '/profile', label: 'My Profile', icon: '👤' },
        ]}
        accountInfo={{
          name: user?.name,
          email: user?.email,
          type: 'Worker',
        }}
      >
      <Card className="border-0 shadow-sm rounded-4 mb-4 bg-success text-white">
        <Card.Body className="p-4">
          <h2 className="mb-1">👷 Worker Dashboard</h2>
          <p className="mb-0 text-white-50">Track applications, mark work complete, and monitor earnings.</p>
        </Card.Body>
      </Card>

      <SimpleBarChart
        title="Your Work Summary"
        data={[
          { label: 'Pending', value: stats.activeApplications, color: '#f59e0b' },
          { label: 'Accepted', value: stats.acceptedApplications, color: '#0ea5e9' },
          { label: 'Completed', value: stats.completedJobs, color: '#10b981' },
          { label: 'Earnings (₹1000)', value: Math.round(stats.totalEarnings / 1000), color: '#6366f1' },
        ]}
      />

      {/* Profile Completion Alert */}
      {profileCompletion < 100 && (
        <Card className="mb-4 border-0 shadow-sm rounded-4 bg-light border-info">
          <Card.Body>
            <Row className="align-items-center">
              <Col md={8}>
                <h6 className="mb-2">📝 अपनी प्रोफाइल पूरी करें</h6>
                <p className="mb-2 small text-muted">
                  पूरी प्रोफाइल होने पर काम मिलने के मौके बढ़ते हैं। आपकी प्रोफाइल {profileCompletion}% पूरी है।
                </p>
                <ProgressBar now={profileCompletion} className="mb-2" />
              </Col>
              <Col md={4} className="text-md-end">
                <Button as={Link} to="/profile" variant="primary" size="sm">
                  प्रोफाइल पूरी करें
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* Stats Cards */}
      <Row className="g-3 mb-4">
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="text-center">
              <h4 className="text-warning">{stats.activeApplications}</h4>
              <p className="text-muted small mb-0">लंबित अर्ज़ियाँ</p>
              <small className="text-muted">जवाब का इंतज़ार</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="text-center">
              <h4 className="text-info">{stats.acceptedApplications}</h4>
              <p className="text-muted small mb-0">स्वीकृत</p>
              <small className="text-muted">काम के लिए तैयार</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="text-center">
              <h4 className="text-success">{stats.completedJobs}</h4>
              <p className="text-muted small mb-0">पूरा हुआ काम</p>
              <small className="text-muted">भरोसा बढ़ाएं</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="text-center">
              <h4 className="text-primary">₹{stats.totalEarnings.toLocaleString()}</h4>
              <p className="text-muted small mb-0">कुल कमाई</p>
              <small className="text-muted">पूरा भुगतान</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row className="mb-4">
        <Col md={12}>
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body>
              <Row>
                <Col md={3} className="mb-2">
                  <Button as={Link} to="/jobs" variant="primary" className="w-100">
                    🔍 काम देखें
                  </Button>
                </Col>
                <Col md={3} className="mb-2">
                  <Button as={Link} to="/worker/applications" variant="info" className="w-100">
                    📋 अर्ज़ियाँ देखें
                  </Button>
                </Col>
                <Col md={3} className="mb-2">
                  <Button as={Link} to="/worker/payments" variant="success" className="w-100">
                    💳 भुगतान देखें
                  </Button>
                </Col>
                <Col md={3} className="mb-2">
                  <Button as={Link} to="/profile" variant="secondary" className="w-100">
                    👤 प्रोफाइल बदलें
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Applications Tabs */}
      <Card className="border-0 shadow-sm rounded-4">
        <Card.Header className="bg-light">
          <h5 className="mb-0">📊 आपकी अर्ज़ियाँ</h5>
        </Card.Header>
        <Card.Body>
          <Tabs defaultActiveKey="applied" className="mb-3">
            <Tab eventKey="applied" title={`⏳ Applied (${stats.activeApplications})`}>
              {applications.filter((a) => ['applied', 'shortlisted'].includes(a.status)).length === 0 ? (
                <p className="text-muted text-center py-4">कोई लंबित अर्ज़ी नहीं</p>
              ) : (
                applications
                  .filter((a) => ['applied', 'shortlisted'].includes(a.status))
                  .map((app) => (
                    <div key={app._id} className="border-bottom pb-3 mb-3">
                      <Row>
                        <Col md={8}>
                          <h6>{app.jobId?.title}</h6>
                          <p className="mb-1 small">
                            <strong>कंपनी:</strong> {app.employerId?.companyName}
                          </p>
                          <p className="mb-1 small">
                            <strong>जगह:</strong> {app.jobId?.location?.district}
                          </p>
                          <p className="small text-muted">
                            अर्ज़ी की तारीख: {new Date(app.createdAt).toLocaleDateString()}
                          </p>
                        </Col>
                        <Col md={4} className="text-end">
                          <Badge bg="warning" className="mb-2">
                            ⏳ जवाब का इंतज़ार
                          </Badge>
                          <br />
                          <Button as={Link} to={`/jobs/${app.jobId?._id}`} variant="outline-primary" size="sm">
                            काम देखें
                          </Button>
                        </Col>
                      </Row>
                    </div>
                  ))
              )}
            </Tab>

            <Tab eventKey="accepted" title={`✓ स्वीकृत (${stats.acceptedApplications})`}>
              {applications.filter((a) => a.status === 'accepted').length === 0 ? (
                <p className="text-muted text-center py-4">कोई स्वीकृत अर्ज़ी नहीं</p>
              ) : (
                applications
                  .filter((a) => a.status === 'accepted')
                  .map((app) => (
                    <div key={app._id} className="border-bottom pb-3 mb-3">
                      <Row>
                        <Col md={8}>
                          <h6>{app.jobId?.title}</h6>
                          <p className="mb-1 small">
                            <strong>कंपनी:</strong> {app.employerId?.companyName}
                          </p>
                          <p className="mb-1 small">
                            <strong>मजदूरी:</strong> ₹{app.jobId?.salary?.amount} प्रति {app.jobId?.salary?.period}
                          </p>
                          <p className="mb-1 small">
                            <strong>Attendance Days:</strong> {app.attendanceCount || 0}
                          </p>
                          <p className="small text-muted">
                            स्वीकृत तारीख: {new Date(app.acceptedDate || app.createdAt).toLocaleDateString()}
                          </p>
                        </Col>
                        <Col md={4} className="text-end">
                          <Badge bg="success" className="mb-2">
                            ✓ स्वीकृत
                          </Badge>
                          <br />
                          <Button 
                            as={Link} 
                            to={`/jobs/${app.jobId?._id}`} 
                            variant="outline-primary" 
                            size="sm"
                            className="me-2"
                          >
                            काम देखें
                          </Button>
                          <Button 
                            variant="outline-success" 
                            size="sm"
                            onClick={() => handleMarkCompleted(app._id)}
                            disabled={completingId === app._id}
                          >
                            {completingId === app._id ? '⏳ Processing...' : '✅ Mark Complete'}
                          </Button>
                        </Col>
                      </Row>
                    </div>
                  ))
              )}
            </Tab>

            <Tab eventKey="completed" title={`✅ पूरा (${stats.completedJobs})`}>
              {applications.filter((a) => a.status === 'completed').length === 0 ? (
                <p className="text-muted text-center py-4">अभी कोई काम पूरा नहीं हुआ</p>
              ) : (
                applications
                  .filter((a) => a.status === 'completed')
                  .map((app) => (
                    <div key={app._id} className="border-bottom pb-3 mb-3">
                      <Row>
                        <Col md={8}>
                          <h6>{app.jobId?.title}</h6>
                          <p className="mb-1 small">
                            <strong>कंपनी:</strong> {app.employerId?.companyName}
                          </p>
                          <p className="mb-1 small">
                            <strong>मजदूरी:</strong> ₹{app.jobId?.salary?.amount} प्रति {app.jobId?.salary?.period}
                          </p>
                          <p className="small text-muted">
                            पूरा होने की तारीख: {new Date(app.completionDate || app.createdAt).toLocaleDateString()}
                          </p>
                        </Col>
                        <Col md={4} className="text-end">
                          <Badge bg="info" className="mb-2">
                            ✅ पूरा हुआ
                          </Badge>
                          <br />
                          <Button as={Link} to={`/jobs/${app.jobId?._id}`} variant="outline-primary" size="sm">
                            काम देखें
                          </Button>
                        </Col>
                      </Row>
                    </div>
                  ))
              )}
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>

      {/* Profile Info Card */}
      {profile && (
        <Card className="border-0 shadow-sm rounded-4 mt-4">
          <Card.Header className="bg-light">
            <h5 className="mb-0">👤 आपकी प्रोफाइल</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <p className="mb-1">
                  <strong>दैनिक मजदूरी:</strong> ₹{profile.dailyRate}
                </p>
                <p className="mb-1">
                  <strong>मासिक मजदूरी:</strong> ₹{profile.monthlyRate}
                </p>
                <p className="mb-1">
                  <strong>अनुभव:</strong> {profile.experience} साल
                </p>
              </Col>
              <Col md={6}>
                <p className="mb-1">
                  <strong>कौशल:</strong>{' '}
                  {profile.skills?.map((skill) => (
                    <Badge key={skill} bg="info" className="me-1">
                      {skill?.replace('_', ' ')}
                    </Badge>
                  ))}
                </p>
                <p className="mb-1">
                  <strong>उपलब्धता:</strong> {profile.availability?.replace('_', ' ')}
                </p>
              </Col>
            </Row>
            <Button as={Link} to="/profile" variant="outline-primary" size="sm">
              प्रोफाइल बदलें
            </Button>
          </Card.Body>
        </Card>
      )}
      </DashboardLayout>
    </Container>
  );
};

export default WorkerDashboard;
