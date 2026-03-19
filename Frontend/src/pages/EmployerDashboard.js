import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { jobAPI, employerAPI, messageAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import SimpleBarChart from '../components/SimpleBarChart';

const EmployerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ jobs: 0, workersHired: 0, activeJobs: 0, closedJobs: 0 });
  const [myJobs, setMyJobs] = useState([]);
  const [profile, setProfile] = useState(null);
  const [assignmentGroups, setAssignmentGroups] = useState([]);
  const [filter, setFilter] = useState('all'); // all, open, closed
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [jobsRes, profileRes, assignmentRes] = await Promise.all([
        jobAPI.getMyJobs(),
        employerAPI.getProfile(),
        employerAPI.getAssignmentGroups(),
      ]);

      const jobs = jobsRes.data.jobs;
      const employerProfile = profileRes.data.employer;
      const groups = assignmentRes.data.groups || [];
      setMyJobs(jobs);
      setProfile(employerProfile);
      setAssignmentGroups(groups);
      setStats({
        jobs: jobs.length,
        workersHired: employerProfile.workersHired || 0,
        activeJobs: jobs.filter(j => j.jobStatus === 'open').length,
        closedJobs: jobs.filter(j => j.jobStatus === 'closed').length,
      });

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

  const getFilteredJobs = () => {
    switch (filter) {
      case 'open':
        return myJobs.filter(j => j.jobStatus === 'open');
      case 'closed':
        return myJobs.filter(j => j.jobStatus === 'closed');
      default:
        return myJobs;
    }
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
      <Container className="my-5 text-center">
        <div className="spinner-border text-primary" role="status" />
      </Container>
    );
  }

  return (
    <Container className="my-4 my-md-5">
      <DashboardLayout
        title="🏢 Employer Dashboard"
        subtitle="Simple options to manage jobs"
        menuItems={[
          { to: '/employer/dashboard', label: 'Dashboard', icon: '🏠' },
          { to: '/employer/post-job', label: 'Post New Job', icon: '➕' },
          { to: '/employer/payments', label: 'Payments', icon: '💳' },
          { to: '/jobs', label: 'See Public Jobs', icon: '📋' },
          { to: '/profile', label: 'Company Profile', icon: '👤' },
        ]}
        accountInfo={{
          name: user?.name,
          email: user?.email,
          type: 'Employer',
        }}
      >
      {/* Hero Card with Gradient */}
      <Card className="border-0 rounded-4 mb-4 overflow-hidden" style={{
        background: 'linear-gradient(135deg, #5B8DEE 0%, #3D5BBA 100%)',
        animation: 'fadeInUp 0.5s ease-out'
      }}>
        <Card.Body className="p-4">
          <Row className="align-items-center">
            <Col md={8}>
              <div className="d-flex align-items-center">
                <div className="fs-1 me-3">🏢</div>
                <div>
                  <h2 className="mb-1 text-white fw-bold">Employer Dashboard</h2>
                  <p className="mb-0 text-white-50">Manage jobs, post publicly, and track workforce progress.</p>
                </div>
              </div>
            </Col>
            <Col md={4} className="text-md-end">
              <Button 
                as={Link} 
                to="/employer/post-job" 
                variant="light" 
                className="fw-bold"
                size="lg"
              >
                ➕ Post New Job
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Stats Cards with Interactive Hover */}
      <Row className="g-4 mb-4">
        <Col md={3} sm={6}>
          <Card className="border-0 rounded-4 h-100 hover-lift" style={{
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)'
          }}>
            <Card.Body className="text-center p-4">
              <div className="fs-2 mb-3">📊</div>
              <h3 className="text-primary fw-bold mb-2">{stats.jobs}</h3>
              <p className="text-dark fw-semibold small mb-0">Total Jobs Posted</p>
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
              <div className="fs-2 mb-3">📢</div>
              <h3 className="text-success fw-bold mb-2">{stats.activeJobs}</h3>
              <p className="text-dark fw-semibold small mb-0">Public Open Jobs</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card className="border-0 rounded-4 h-100 hover-lift" style={{
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)'
          }}>
            <Card.Body className="text-center p-4">
              <div className="fs-2 mb-3">🔒</div>
              <h3 className="text-warning fw-bold mb-2">{stats.closedJobs}</h3>
              <p className="text-dark fw-semibold small mb-0">Closed Jobs</p>
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
              <div className="fs-2 mb-3">👷</div>
              <h3 className="text-info fw-bold mb-2">{stats.workersHired}</h3>
              <p className="text-dark fw-semibold small mb-0">Workers Hired</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Chart Section */}
      <Card className="border-0 rounded-4 mb-4">
        <Card.Body className="p-4">
          <SimpleBarChart
            title="📈 Job Status Chart"
            data={[
              { label: 'Total Jobs', value: stats.jobs, color: '#5B8DEE' },
              { label: 'Public Open Jobs', value: stats.activeJobs, color: '#10b981' },
              { label: 'Closed Jobs', value: stats.closedJobs, color: '#f59e0b' },
              { label: 'Workers Hired', value: stats.workersHired, color: '#0ea5e9' },
            ]}
          />
        </Card.Body>
      </Card>

      <Card className="border-0 rounded-4 mb-4">
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <h5 className="mb-1 fw-bold">👤 Company Profile</h5>
              <p className="text-muted mb-0">
                {profile?.companyName || user?.name || 'Employer'} • {profile?.companyType || 'Business'}
              </p>
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

      <Card className="border-0 rounded-4 mb-4">
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0 fw-bold">👥 Assigned Worker Groups</h5>
            <Button as={Link} to="/employer/payments" variant="outline-success" size="sm">
              💳 Open Payments
            </Button>
          </div>

          {assignmentGroups.length === 0 ? (
            <div className="text-muted">No admin assignment group created yet for your jobs.</div>
          ) : (
            assignmentGroups.map((group) => (
              <Card key={group._id} className="border rounded-3 mb-3">
                <Card.Body>
                  <Row className="g-3">
                    <Col md={4}>
                      <div className="fw-semibold">{group.jobId?.title || 'Job'}</div>
                      <div className="small text-muted text-capitalize">
                        {(group.jobId?.workType || '').replace('_', ' ')}
                      </div>
                      <div className="small mt-2">
                        <Badge bg="info" className="me-2">Assigned {group.progress?.assignedWorkers || 0}/{group.requiredWorkers}</Badge>
                        <Badge bg={(group.progress?.pendingPayments || 0) > 0 ? 'warning' : 'success'}>
                          {(group.progress?.pendingPayments || 0) > 0 ? 'Payment Pending' : 'Payments Updated'}
                        </Badge>
                      </div>
                    </Col>

                    <Col md={4}>
                      <div className="small text-muted mb-1">Assigned Workers</div>
                      <div className="small">
                        {(group.assignedWorkerIds || []).length > 0
                          ? group.assignedWorkerIds.map((w) => w.userId?.name).filter(Boolean).join(', ')
                          : 'No worker names available'}
                      </div>
                    </Col>

                    <Col md={4}>
                      <div className="small">Accepted: <strong>{group.progress?.acceptedApplications || 0}</strong></div>
                      <div className="small">Completed Work: <strong>{group.progress?.completedApplications || 0}</strong></div>
                      <div className="small">
                        Duration: <strong>
                          {group.jobId?.startDate ? new Date(group.jobId.startDate).toLocaleDateString('en-IN') : '-'}
                          {' '}to{' '}
                          {group.jobId?.endDate ? new Date(group.jobId.endDate).toLocaleDateString('en-IN') : '-'}
                        </strong>
                      </div>
                      <div className="small">Pending Platform Payments: <strong>{group.progress?.pendingPayments || 0}</strong></div>
                      <div className="small">Completed Worker Payouts: <strong>{group.progress?.completedPayments || 0}</strong></div>
                      <div className="small">Work Status: <strong>{group.autoWorkStatus || 'pending'}</strong></div>
                      <div className="small">Payment Status: <strong>{group.autoPaymentStatus || 'not_due'}</strong></div>
                      <div className="small">Per Worker Payment: <strong>₹{group.paymentPerWorker || 0}</strong></div>
                      <div className="small">Total Platform Payment: <strong>₹{group.platformTotalPayment || 0}</strong></div>

                      <div className="mt-2">
                        <Button size="sm" variant="outline-primary" onClick={() => openGroupChat(group.jobId?._id)}>
                          Group Chat (Admin + Workers)
                        </Button>
                      </div>

                      <div className="p-2 rounded-3 bg-light border mt-2">
                        <div className="fw-semibold small mb-2">📦 Timeline</div>
                        {!(group.recentUpdates || []).length ? (
                          <div className="small text-muted">No status updates yet.</div>
                        ) : (
                          (group.recentUpdates || []).slice(0, 3).map((update, idx) => (
                            <div key={`${group._id}-timeline-${idx}`} className="d-flex align-items-start mb-2">
                              <div className="me-2 mt-1" style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#0d6efd' }} />
                              <div className="small">
                                <div className="fw-semibold">{update.progressPercent || 0}% • {update.note || 'Progress updated'}</div>
                                <div className="text-muted">{(update.updatedBy || 'system').toUpperCase()} • {new Date(update.updatedAt).toLocaleString('en-IN')}</div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            ))
          )}
        </Card.Body>
      </Card>

      <Row>
        <Col md={12}>
          <Card className="mb-4 border-0 rounded-4">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="mb-0 fw-bold">📋 My Posted Jobs</h5>
                <Button 
                  as={Link} 
                  to="/employer/post-job" 
                  style={{
                    background: 'linear-gradient(135deg, #5B8DEE 0%, #3D5BBA 100%)',
                    border: 'none'
                  }}
                >
                  ➕ Post New Job
                </Button>
              </div>

              {/* Filter Tabs with Modern Design */}
              <div className="mb-4 d-flex gap-2 flex-wrap">
                <Button 
                  variant={filter === 'all' ? 'primary' : 'outline-primary'} 
                  size="sm"
                  onClick={() => setFilter('all')}
                  className="rounded-pill px-3"
                >
                  All ({myJobs.length})
                </Button>
                <Button 
                  variant={filter === 'open' ? 'success' : 'outline-success'} 
                  size="sm"
                  onClick={() => setFilter('open')}
                  className="rounded-pill px-3"
                >
                  📢 Open ({myJobs.filter(j => j.jobStatus === 'open').length})
                </Button>
                <Button 
                  variant={filter === 'closed' ? 'danger' : 'outline-danger'} 
                  size="sm"
                  onClick={() => setFilter('closed')}
                  className="rounded-pill px-3"
                >
                  🔒 Closed ({myJobs.filter(j => j.jobStatus === 'closed').length})
                </Button>
              </div>

              {getFilteredJobs().length === 0 ? (
                <div className="text-center py-5">
                  <div className="fs-1 mb-3">📭</div>
                  <p className="text-muted">
                    {filter === 'open' && 'No open public jobs'}
                    {filter === 'closed' && 'No closed jobs'}
                    {filter === 'all' && 'No jobs posted yet'}
                  </p>
                </div>
              ) : (
                getFilteredJobs().map((job) => (
                  <Card key={job._id} className="border rounded-3 mb-3 hover-lift" style={{
                    transition: 'all 0.3s ease',
                    borderLeft: '4px solid ' + (job.jobStatus === 'open' ? '#10b981' : '#f59e0b')
                  }}>
                    <Card.Body className="p-4">
                      <Row className="align-items-start">
                        <Col md={8}>
                          <div className="d-flex align-items-start mb-3">
                            <div className="fs-4 me-3">💼</div>
                            <div>
                              <h5 className="mb-2 fw-bold text-dark">{job.title}</h5>
                              <div className="mb-2">
                                <Badge bg="success" className="me-2 px-3 py-2">🌐 Public Job</Badge>
                                <Badge bg={job.jobStatus === 'open' ? 'info' : 'secondary'} className="px-3 py-2">
                                  {job.jobStatus === 'open' ? '🟢 Open' : '🔴 Closed'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <Row className="g-2 small">
                            <Col sm={6}>
                              <div className="mb-2">
                                <span className="text-muted">📍 Location:</span>
                                <span className="ms-2 fw-semibold">{job.location?.district}, {job.location?.state}</span>
                              </div>
                            </Col>
                            <Col sm={6}>
                              <div className="mb-2">
                                <span className="text-muted">💰 Salary:</span>
                                <span className="ms-2 fw-semibold">₹{job.salary?.amount} / {job.salary?.period}</span>
                              </div>
                            </Col>
                            <Col sm={6}>
                              <div className="mb-2">
                                <span className="text-muted">🏗️ Type:</span>
                                <span className="ms-2 fw-semibold">{job.workType?.replace('_', ' ')}</span>
                              </div>
                            </Col>
                            <Col sm={6}>
                              <div className="mb-2">
                                <span className="text-muted">👥 Positions:</span>
                                <span className="ms-2 fw-semibold">{job.numberOfPositions}</span>
                              </div>
                            </Col>
                          </Row>
                        </Col>
                        <Col md={4} className="text-md-end">
                          <div className="d-flex flex-column gap-2">
                            <Button 
                              as={Link} 
                              to={`/jobs/${job._id}`} 
                              variant="outline-primary" 
                              size="sm"
                              className="w-100"
                            >
                              👁️ View Details
                            </Button>
                            <Button 
                              as={Link} 
                              to={`/employer/applications/${job._id}`} 
                              variant="outline-info" 
                              size="sm"
                              className="w-100"
                            >
                              📋 Applications
                            </Button>
                          </div>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                ))
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      </DashboardLayout>
    </Container>
  );
};

export default EmployerDashboard;
