import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Badge, Button, Tabs, Tab, ProgressBar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { applicationAPI, workerAPI, paymentAPI, messageAPI } from '../services/api';
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
      {/* Hero Card with Gradient */}
      <Card className="border-0 rounded-4 mb-4 overflow-hidden" style={{
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        animation: 'fadeInUp 0.5s ease-out'
      }}>
        <Card.Body className="p-4">
          <Row className="align-items-center">
            <Col md={8}>
              <div className="d-flex align-items-center mb-2">
                <div className="fs-1 me-3">👷</div>
                <div>
                  <h2 className="mb-1 text-white fw-bold">Welcome, {user?.name}!</h2>
                  <p className="mb-0 text-white-50">Track applications, mark work complete, and monitor earnings.</p>
                </div>
              </div>
            </Col>
            <Col md={4} className="text-md-end">
              <div className="text-white">
                <h4 className="mb-0">₹{stats.totalEarnings.toLocaleString()}</h4>
                <small className="text-white-50">Total Earnings</small>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="border-0 rounded-4 mb-4">
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <h5 className="mb-1 fw-bold">👤 Profile Snapshot</h5>
              <p className="text-muted mb-0">
                Skills: {profile?.skills?.length ? profile.skills.join(', ') : 'Not added'}
              </p>
              <small className="text-muted">Experience: {profile?.experience || 0} years • Availability: {profile?.availability || 'flexible'}</small>
            </div>
            <div className="d-flex gap-2 flex-wrap">
              <Button as={Link} to="/messages" variant="outline-info">
                💬 Messages {unreadCount > 0 ? `(${unreadCount})` : ''}
              </Button>
              <Button as={Link} to="/profile" variant="outline-primary">Update Profile</Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Profile Completion Alert */}
      {profileCompletion < 100 && (
        <Card className="mb-4 border-0 rounded-4 bg-gradient" style={{
          background: 'linear-gradient(135deg, #fff5f5 0%, #ffe5e5 100%)',
          border: '2px solid #fecaca',
          animation: 'pulse 2s infinite'
        }}>
          <Card.Body className="p-4">
            <Row className="align-items-center">
              <Col md={8}>
                <div className="d-flex align-items-start">
                  <span className="fs-3 me-3">⚠️</span>
                  <div className="flex-grow-1">
                    <h6 className="mb-2 fw-bold text-danger">📝 अपनी प्रोफाइल पूरी करें</h6>
                    <p className="mb-2 small text-muted">
                      पूरी प्रोफाइल होने पर काम मिलने के मौके बढ़ते हैं। आपकी प्रोफाइल {profileCompletion}% पूरी है।
                    </p>
                    <ProgressBar 
                      now={profileCompletion} 
                      className="mb-0" 
                      style={{height: '8px'}}
                      variant="success"
                    />
                  </div>
                </div>
              </Col>
              <Col md={4} className="text-md-end">
                <Button as={Link} to="/profile" variant="danger">
                  <span className="fw-bold">प्रोफाइल पूरी करें</span>
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* Stats Cards with Hover Effects */}
      <Row className="g-4 mb-4">
        <Col md={3} sm={6}>
          <Card className="border-0 rounded-4 h-100 hover-lift" style={{
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)'
          }}>
            <Card.Body className="text-center p-4">
              <div className="fs-2 mb-3">⏳</div>
              <h3 className="text-warning fw-bold mb-2">{stats.activeApplications}</h3>
              <p className="text-dark fw-semibold small mb-1">लंबित अर्ज़ियाँ</p>
              <small className="text-muted">जवाब का इंतज़ार</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card className="border-0 rounded-4 h-100 hover-lift" style={{
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)'
          }}>
            <Card.Body className="text-center p-4">
              <div className="fs-2 mb-3">✅</div>
              <h3 className="text-info fw-bold mb-2">{stats.acceptedApplications}</h3>
              <p className="text-dark fw-semibold small mb-1">स्वीकृत</p>
              <small className="text-muted">काम के लिए तैयार</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card className="border-0 rounded-4 h-100 hover-lift" style={{
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)'
          }}>
            <Card.Body className="text-center p-4">
              <div className="fs-2 mb-3">🎯</div>
              <h3 className="text-success fw-bold mb-2">{stats.completedJobs}</h3>
              <p className="text-dark fw-semibold small mb-1">पूरा हुआ काम</p>
              <small className="text-muted">भरोसा बढ़ाएं</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card className="border-0 rounded-4 h-100 hover-lift" style={{
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)'
          }}>
            <Card.Body className="text-center p-4">
              <div className="fs-2 mb-3">💰</div>
              <h3 className="text-primary fw-bold mb-2">₹{stats.totalEarnings.toLocaleString()}</h3>
              <p className="text-dark fw-semibold small mb-1">कुल कमाई</p>
              <small className="text-muted">पूरा भुगतान</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Chart Section */}
      <Card className="border-0 rounded-4 mb-4">
        <Card.Body className="p-4">
          <SimpleBarChart
            title="📊 Your Work Summary"
            data={[
              { label: 'Pending', value: stats.activeApplications, color: '#f59e0b' },
              { label: 'Accepted', value: stats.acceptedApplications, color: '#0ea5e9' },
              { label: 'Completed', value: stats.completedJobs, color: '#10b981' },
              { label: 'Earnings (₹1000)', value: Math.round(stats.totalEarnings / 1000), color: '#6366f1' },
            ]}
          />
        </Card.Body>
      </Card>

      {/* Quick Actions with Beautiful Buttons */}
      <Card className="border-0 rounded-4 mb-4">
        <Card.Body className="p-4">
          <h5 className="mb-3 fw-bold text-dark">🚀 Quick Actions</h5>
          <Row className="g-3">
            <Col md={3} sm={6}>
              <Button 
                as={Link} 
                to="/jobs" 
                className="w-100 py-3" 
                style={{
                  background: 'linear-gradient(135deg, #5B8DEE 0%, #3D5BBA 100%)',
                  border: 'none',
                  transition: 'all 0.3s ease'
                }}
              >
                <div className="fs-4 mb-1">🔍</div>
                <div className="fw-semibold">काम देखें</div>
              </Button>
            </Col>
            <Col md={3} sm={6}>
              <Button 
                as={Link} 
                to="/worker/applications" 
                className="w-100 py-3" 
                style={{
                  background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                  border: 'none',
                  transition: 'all 0.3s ease'
                }}
              >
                <div className="fs-4 mb-1">📋</div>
                <div className="fw-semibold">अर्ज़ियाँ देखें</div>
              </Button>
            </Col>
            <Col md={3} sm={6}>
              <Button 
                as={Link} 
                to="/worker/payments" 
                className="w-100 py-3" 
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  border: 'none',
                  transition: 'all 0.3s ease'
                }}
              >
                <div className="fs-4 mb-1">💳</div>
                <div className="fw-semibold">भुगतान देखें</div>
              </Button>
            </Col>
            <Col md={3} sm={6}>
              <Button 
                as={Link} 
                to="/profile" 
                className="w-100 py-3" 
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  border: 'none',
                  transition: 'all 0.3s ease'
                }}
              >
                <div className="fs-4 mb-1">👤</div>
                <div className="fw-semibold">प्रोफाइल बदलें</div>
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Applications Tabs */}
      <Card className="border-0 rounded-4">
        <Card.Header style={{
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          borderBottom: '2px solid #e2e8f0'
        }} className="p-4">
          <h5 className="mb-0 fw-bold text-dark">📊 आपकी अर्ज़ियाँ</h5>
        </Card.Header>
        <Card.Body className="p-4">
          <Tabs defaultActiveKey="applied" className="mb-4 nav-pills">
            <Tab eventKey="applied" title={`⏳ Applied (${stats.activeApplications})`}>
              {applications.filter((a) => ['applied', 'shortlisted'].includes(a.status)).length === 0 ? (
                <div className="text-center py-5">
                  <div className="fs-1 mb-3">📭</div>
                  <p className="text-muted">कोई लंबित अर्ज़ी नहीं</p>
                </div>
              ) : (
                applications
                  .filter((a) => ['applied', 'shortlisted'].includes(a.status))
                  .map((app) => (
                    <Card key={app._id} className="border rounded-3 mb-3 hover-lift" style={{
                      transition: 'all 0.3s ease',
                      borderLeft: '4px solid #f59e0b'
                    }}>
                      <Card.Body className="p-4">
                        <Row>
                          <Col md={8}>
                            <div className="d-flex align-items-start mb-2">
                              <div className="fs-4 me-3">💼</div>
                              <div>
                                <h6 className="fw-bold mb-2">{app.jobId?.title}</h6>
                                <div className="mb-2">
                                  <Badge bg={app.status === 'shortlisted' ? 'info' : 'warning'} className="px-3 py-2">
                                    {app.status === 'shortlisted' ? '⭐ Shortlisted' : '⏳ Applied'}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="small">
                              <p className="mb-1">
                                <span className="text-muted">🏢 कंपनी:</span>
                                <span className="ms-2 fw-semibold">{app.employerId?.companyName}</span>
                              </p>
                              <p className="mb-1">
                                <span className="text-muted">📍 जगह:</span>
                                <span className="ms-2 fw-semibold">{app.jobId?.location?.district}</span>
                              </p>
                              <p className="mb-0">
                                <span className="text-muted">📅 अर्जी दी:</span>
                                <span className="ms-2 fw-semibold">{new Date(app.createdAt).toLocaleDateString('hi-IN')}</span>
                              </p>
                            </div>
                          </Col>
                          <Col md={4} className="text-md-end">
                            <Button 
                              as={Link} 
                              to={`/jobs/${app.jobId?._id}`} 
                              variant="outline-primary" 
                              size="sm"
                              className="w-100"
                            >
                              👁️ विवरण देखें
                            </Button>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  ))
              )}
            </Tab>

            <Tab eventKey="accepted" title={`✅ स्वीकृत (${stats.acceptedApplications})`}>
              {applications.filter((a) => a.status === 'accepted').length === 0 ? (
                <div className="text-center py-5">
                  <div className="fs-1 mb-3">📭</div>
                  <p className="text-muted">कोई स्वीकृत अर्ज़ी नहीं</p>
                </div>
              ) : (
                applications
                  .filter((a) => a.status === 'accepted')
                  .map((app) => (
                    <Card key={app._id} className="border rounded-3 mb-3 hover-lift" style={{
                      transition: 'all 0.3s ease',
                      borderLeft: '4px solid #0ea5e9'
                    }}>
                      <Card.Body className="p-4">
                      <Row>
                        <Col md={8}>
                          <div className="d-flex align-items-start mb-2">
                            <div className="fs-4 me-3">🎯</div>
                            <div>
                              <h6 className="fw-bold mb-2">{app.jobId?.title}</h6>
                              <div className="mb-2">
                                <Badge bg="success" className="px-3 py-2">
                                  ✅ स्वीकृत
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="small">
                            <p className="mb-1">
                              <span className="text-muted">🏢 कंपनी:</span>
                              <span className="ms-2 fw-semibold">{app.employerId?.companyName}</span>
                            </p>
                            <p className="mb-1">
                              <span className="text-muted">💰 मजदूरी:</span>
                              <span className="ms-2 fw-semibold">₹{app.jobId?.salary?.amount} प्रति {app.jobId?.salary?.period}</span>
                            </p>
                            <p className="mb-1">
                              <span className="text-muted">📊 Attendance Days:</span>
                              <span className="ms-2 fw-semibold">{app.attendanceCount || 0}</span>
                            </p>
                            <p className="mb-0">
                              <span className="text-muted">📅 स्वीकृत:</span>
                              <span className="ms-2 fw-semibold">{new Date(app.acceptedDate || app.createdAt).toLocaleDateString('hi-IN')}</span>
                            </p>
                            {!!(app.progressUpdates || []).length && (
                              <p className="mt-2 mb-0">
                                <span className="text-muted">🗂 Latest Update:</span>
                                <span className="ms-2 fw-semibold">
                                  {(app.progressUpdates?.[app.progressUpdates.length - 1]?.progressPercent || 0)}% • {app.progressUpdates?.[app.progressUpdates.length - 1]?.note || 'Progress updated'}
                                </span>
                                <br />
                                <span className="text-muted">
                                  {formatUpdatedBy(app.progressUpdates?.[app.progressUpdates.length - 1]?.updatedBy)} • {new Date(app.progressUpdates?.[app.progressUpdates.length - 1]?.updatedAt).toLocaleString('hi-IN')}
                                </span>
                              </p>
                            )}
                          </div>
                        </Col>
                        <Col md={4} className="text-md-end">
                          <div className="d-flex flex-column gap-2">
                            <Button 
                              as={Link} 
                              to={`/jobs/${app.jobId?._id}`} 
                              variant="outline-primary" 
                              size="sm"
                              className="w-100"
                            >
                              👁️ विवरण देखें
                            </Button>
                            <Button 
                              variant="success" 
                              size="sm"
                              onClick={() => handleMarkCompleted(app._id)}
                              disabled={completingId === app._id}
                              className="w-100"
                              style={{
                                background: completingId === app._id ? '#6c757d' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                border: 'none'
                              }}
                            >
                              {completingId === app._id ? '⏳ Processing...' : '✅ Mark Complete'}
                            </Button>
                          </div>
                        </Col>
                      </Row>
                      </Card.Body>
                    </Card>
                  ))
              )}
            </Tab>

            <Tab eventKey="completed" title={`🎯 पूरा (${stats.completedJobs})`}>
              {applications.filter((a) => a.status === 'completed').length === 0 ? (
                <div className="text-center py-5">
                  <div className="fs-1 mb-3">📭</div>
                  <p className="text-muted">अभी कोई काम पूरा नहीं हुआ</p>
                </div>
              ) : (
                applications
                  .filter((a) => a.status === 'completed')
                  .map((app) => (
                    <Card key={app._id} className="border rounded-3 mb-3 hover-lift" style={{
                      transition: 'all 0.3s ease',
                      borderLeft: '4px solid #10b981'
                    }}>
                      <Card.Body className="p-4">
                        <Row>
                          <Col md={8}>
                            <div className="d-flex align-items-start mb-2">
                              <div className="fs-4 me-3">🏆</div>
                              <div>
                                <h6 className="fw-bold mb-2">{app.jobId?.title}</h6>
                                <div className="mb-2">
                                  <Badge bg="info" className="px-3 py-2">
                                    🎯 पूरा हुआ
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="small">
                              <p className="mb-1">
                                <span className="text-muted">🏢 कंपनी:</span>
                                <span className="ms-2 fw-semibold">{app.employerId?.companyName}</span>
                              </p>
                              <p className="mb-1">
                                <span className="text-muted">💰 मजदूरी:</span>
                                <span className="ms-2 fw-semibold">₹{app.jobId?.salary?.amount} प्रति {app.jobId?.salary?.period}</span>
                              </p>
                              <p className="mb-0">
                                <span className="text-muted">📅 पूरा होने की तारीख:</span>
                                <span className="ms-2 fw-semibold">{new Date(app.completionDate || app.createdAt).toLocaleDateString('hi-IN')}</span>
                              </p>
                              {!!(app.progressUpdates || []).length && (
                                <p className="mt-2 mb-0">
                                  <span className="text-muted">🗂 Latest Update:</span>
                                  <span className="ms-2 fw-semibold">
                                    {(app.progressUpdates?.[app.progressUpdates.length - 1]?.progressPercent || 0)}% • {app.progressUpdates?.[app.progressUpdates.length - 1]?.note || 'Progress updated'}
                                  </span>
                                  <br />
                                  <span className="text-muted">
                                    {formatUpdatedBy(app.progressUpdates?.[app.progressUpdates.length - 1]?.updatedBy)} • {new Date(app.progressUpdates?.[app.progressUpdates.length - 1]?.updatedAt).toLocaleString('hi-IN')}
                                  </span>
                                </p>
                              )}
                            </div>
                          </Col>
                          <Col md={4} className="text-md-end">
                            <Button 
                              as={Link} 
                              to={`/jobs/${app.jobId?._id}`} 
                              variant="outline-primary" 
                              size="sm"
                              className="w-100"
                            >
                              👁️ विवरण देखें
                            </Button>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  ))
              )}
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>

      {/* Profile Info Card */}
      {profile && (
        <Card className="border-0 rounded-4 mt-4">
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
