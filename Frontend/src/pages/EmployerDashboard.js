import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
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
      toast.error('डैशबोर्ड लोड करने में दिक्कत हुई');
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
    <Container className="my-5">
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
      <h2 className="mb-4">🏢 मालिक डैशबोर्ड</h2>

      <SimpleBarChart
        title="Job Status Chart"
        data={[
          { label: 'Total Jobs', value: stats.jobs, color: '#5B8DEE' },
          { label: 'Active Jobs', value: stats.activeJobs, color: '#10b981' },
          { label: 'Pending Approval', value: stats.pendingApproval, color: '#f59e0b' },
          { label: 'Workers Hired', value: stats.workersHired, color: '#0ea5e9' },
        ]}
      />

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="stat-card mb-3 bg-light">
            <Card.Body className="text-center">
              <h3 className="text-primary">{stats.jobs}</h3>
              <p className="mb-0 small">कुल काम डाले</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card mb-3 bg-light">
            <Card.Body className="text-center">
              <h3 className="text-success">{stats.activeJobs}</h3>
              <p className="mb-0 small">सक्रिय और मंजूर</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card mb-3 bg-light">
            <Card.Body className="text-center">
              <h3 className="text-warning">{stats.pendingApproval}</h3>
              <p className="mb-0 small">मंजूरी के लिए लंबित</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card mb-3 bg-light">
            <Card.Body className="text-center">
              <h3 className="text-info">{stats.workersHired}</h3>
              <p className="mb-0 small">नियुक्त किए गए मजदूर</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={12}>
          <Card className="mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5>📋 मेरे डाले हुए काम</h5>
                <Button as={Link} to="/employer/post-job" variant="primary">
                  ➕ नया काम डालें
                </Button>
              </div>

              {/* Filter Tabs */}
              <div className="mb-3 d-flex gap-2">
                <Button 
                  variant={filter === 'all' ? 'primary' : 'outline-primary'} 
                  size="sm"
                  onClick={() => setFilter('all')}
                >
                  सभी ({myJobs.length})
                </Button>
                <Button 
                  variant={filter === 'approved' ? 'success' : 'outline-success'} 
                  size="sm"
                  onClick={() => setFilter('approved')}
                >
                  ✓ मंजूर ({myJobs.filter(j => j.isApproved).length})
                </Button>
                <Button 
                  variant={filter === 'pending' ? 'warning' : 'outline-warning'} 
                  size="sm"
                  onClick={() => setFilter('pending')}
                >
                  ⏳ लंबित ({myJobs.filter(j => !j.isApproved).length})
                </Button>
                <Button 
                  variant={filter === 'closed' ? 'danger' : 'outline-danger'} 
                  size="sm"
                  onClick={() => setFilter('closed')}
                >
                  बंद ({myJobs.filter(j => j.jobStatus === 'closed').length})
                </Button>
              </div>

              {getFilteredJobs().length === 0 ? (
                <p className="text-muted text-center py-5">
                  {filter === 'pending' && 'मंजूरी के लिए कोई काम नहीं'}
                  {filter === 'approved' && 'कोई मंजूर काम नहीं'}
                  {filter === 'closed' && 'कोई बंद काम नहीं'}
                  {filter === 'all' && 'अभी कोई काम नहीं डाला'}
                </p>
              ) : (
                getFilteredJobs().map((job) => (
                  <div key={job._id} className="job-card border-bottom pb-3 mb-3">
                    <Row className="align-items-start">
                      <Col md={7}>
                        <h6 className="mb-2">{job.title}</h6>
                        <p className="mb-1 small">
                          <strong>काम का प्रकार:</strong> {job.workType?.replace('_', ' ')}
                        </p>
                        <p className="mb-1 small">
                          <strong>जगह:</strong> {job.location?.district}, {job.location?.state}
                        </p>
                        <p className="mb-1 small">
                          <strong>मजदूरी:</strong> ₹{job.salary?.amount} / {job.salary?.period}
                        </p>
                        <p className="mb-1 small">
                          <strong>कुल जगह:</strong> {job.numberOfPositions}
                        </p>
                      </Col>
                      <Col md={5} className="text-end">
                        <div className="mb-2">
                          {!job.isApproved ? (
                            <span className="badge bg-warning text-dark me-2">
                              ⏳ एडमिन मंजूरी के लिए
                            </span>
                          ) : (
                            <span className="badge bg-success me-2">
                              ✓ मंजूर
                            </span>
                          )}
                          <span className={`badge bg-${job.jobStatus === 'open' ? 'info' : 'secondary'}`}>
                            {job.jobStatus === 'open' ? '🟢 खुला' : '🔴 बंद'}
                          </span>
                        </div>
                        <div className="mt-3">
                          <Button 
                            as={Link} 
                            to={`/jobs/${job._id}`} 
                            variant="outline-primary" 
                            size="sm" 
                            className="me-2"
                          >
                            View Details
                          </Button>
                          <Button 
                            as={Link} 
                            to={`/applications/${job._id}`} 
                            variant="outline-info" 
                            size="sm"
                          >
                            Applications
                          </Button>
                        </div>
                      </Col>
                    </Row>
                  </div>
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
