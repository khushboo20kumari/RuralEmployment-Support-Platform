import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { jobAPI, employerAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import SimpleBarChart from '../components/SimpleBarChart';

const EmployerDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ jobs: 0, workersHired: 0, activeJobs: 0, pendingApproval: 0 });
  const [myJobs, setMyJobs] = useState([]);
  const [filter, setFilter] = useState('all'); // all, approved, pending, closed
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [jobsRes, profileRes] = await Promise.all([
        jobAPI.getMyJobs(),
        employerAPI.getProfile(),
      ]);

      const jobs = jobsRes.data.jobs;
      setMyJobs(jobs);
      setStats({
        jobs: jobs.length,
        workersHired: profileRes.data.employer.workersHired || 0,
        activeJobs: jobs.filter(j => j.jobStatus === 'open' && j.isApproved).length,
        pendingApproval: jobs.filter(j => !j.isApproved).length,
      });
    } catch (error) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredJobs = () => {
    switch (filter) {
      case 'approved':
        return myJobs.filter(j => j.isApproved);
      case 'pending':
        return myJobs.filter(j => !j.isApproved);
      case 'closed':
        return myJobs.filter(j => j.jobStatus === 'closed');
      default:
        return myJobs;
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
                  <p className="mb-0 text-white-50">Manage jobs, monitor approvals, and track workforce progress.</p>
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
              <div className="fs-2 mb-3">✅</div>
              <h3 className="text-success fw-bold mb-2">{stats.activeJobs}</h3>
              <p className="text-dark fw-semibold small mb-0">Active & Approved</p>
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
              <div className="fs-2 mb-3">⏳</div>
              <h3 className="text-warning fw-bold mb-2">{stats.pendingApproval}</h3>
              <p className="text-dark fw-semibold small mb-0">Pending Approval</p>
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
              { label: 'Active Jobs', value: stats.activeJobs, color: '#10b981' },
              { label: 'Pending Approval', value: stats.pendingApproval, color: '#f59e0b' },
              { label: 'Workers Hired', value: stats.workersHired, color: '#0ea5e9' },
            ]}
          />
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
                  variant={filter === 'approved' ? 'success' : 'outline-success'} 
                  size="sm"
                  onClick={() => setFilter('approved')}
                  className="rounded-pill px-3"
                >
                  ✓ Approved ({myJobs.filter(j => j.isApproved).length})
                </Button>
                <Button 
                  variant={filter === 'pending' ? 'warning' : 'outline-warning'} 
                  size="sm"
                  onClick={() => setFilter('pending')}
                  className="rounded-pill px-3"
                >
                  ⏳ Pending ({myJobs.filter(j => !j.isApproved).length})
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
                    {filter === 'pending' && 'No jobs pending approval'}
                    {filter === 'approved' && 'No approved jobs'}
                    {filter === 'closed' && 'No closed jobs'}
                    {filter === 'all' && 'No jobs posted yet'}
                  </p>
                </div>
              ) : (
                getFilteredJobs().map((job) => (
                  <Card key={job._id} className="border rounded-3 mb-3 hover-lift" style={{
                    transition: 'all 0.3s ease',
                    borderLeft: '4px solid ' + (job.isApproved ? '#10b981' : '#f59e0b')
                  }}>
                    <Card.Body className="p-4">
                      <Row className="align-items-start">
                        <Col md={8}>
                          <div className="d-flex align-items-start mb-3">
                            <div className="fs-4 me-3">💼</div>
                            <div>
                              <h5 className="mb-2 fw-bold text-dark">{job.title}</h5>
                              <div className="mb-2">
                                {!job.isApproved ? (
                                  <Badge bg="warning" text="dark" className="me-2 px-3 py-2">
                                    ⏳ Pending Admin Approval
                                  </Badge>
                                ) : (
                                  <Badge bg="success" className="me-2 px-3 py-2">
                                    ✓ Approved
                                  </Badge>
                                )}
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
