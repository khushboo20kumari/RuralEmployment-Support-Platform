import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { jobAPI } from '../services/api';
import { useLanguage } from '../hooks/useLanguage';
import { getLocalizedJobData, getLocalizedSalaryPeriod } from '../utils/localization';
import DashboardLayout from '../components/DashboardLayout';
import { AuthContext } from '../context/AuthContext';

const JobList = () => {
  const { t, language } = useLanguage();
  const { user } = useContext(AuthContext);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    workType: '',
    location: '',
    minSalary: '',
  });

  const fetchJobs = useCallback(async () => {
    try {
      const response = await jobAPI.getAll(filters);
      setJobs(response.data.jobs);
    } catch (error) {
      toast.error(t('common.errorOccurred'));
    } finally {
      setLoading(false);
    }
  }, [filters, t]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  if (loading) {
    return (
      <Container className="my-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }

  // Sidebar menu for employer
  const employerMenu = [
    { to: '/employer/dashboard', label: 'Dashboard', icon: '🏠' },
    { to: '/employer/post-job', label: 'Post New Job', icon: '➕' },
    { to: '/employer/payments', label: 'Payments', icon: '💳' },
    { to: '/jobs', label: 'Public Jobs', icon: '📋' },
    { to: '/profile', label: 'Company Profile', icon: '👤' },
    { to: '/messages', label: 'Messages', icon: '💬' },
  ];

  // If employer, wrap in DashboardLayout for sidebar
  const mainContent = (
    <div className="job-list-page">
      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(90deg, #0ea5e9 0%, #38bdf8 100%)',
        color: '#fff',
        borderRadius: 24,
        margin: '32px 0 24px 0',
        padding: '36px 24px',
        boxShadow: '0 4px 32px 0 #0ea5e91a',
        display: 'flex',
        alignItems: 'center',
        gap: 32,
        flexWrap: 'wrap',
        justifyContent: 'space-between',
      }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: 36, marginBottom: 8, letterSpacing: 1 }}>Find Your Next Job</h1>
          <div style={{ fontSize: 20, opacity: 0.95 }}>Verified jobs, fair pay, direct contact.</div>
        </div>
        <img src="https://cdn-icons-png.flaticon.com/512/3135/3135768.png" alt="Jobs" style={{ width: 120, height: 120, borderRadius: 18, boxShadow: '0 2px 8px #bae6fd' }} />
      </div>

      <Container className="my-4 my-md-5">
        {/* Filter Bar */}
        <Card className="mb-4 border-0 shadow-sm rounded-4 job-list-filter-card" style={{ background: 'linear-gradient(90deg, #f0fdfa 0%, #e0f2fe 100%)', border: '1px solid #bae6fd' }}>
          <Card.Body className="p-3 p-md-4">
            <Row className="g-3 align-items-end">
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Work Type</Form.Label>
                  <Form.Select name="workType" value={filters.workType} onChange={handleFilterChange} style={{ borderRadius: 12, border: '1px solid #38bdf8' }}>
                    <option value="">All Types</option>
                    <option value="construction_labour">Construction Labour</option>
                    <option value="factory_helper">Factory Helper</option>
                    <option value="farm_worker">Farm Worker</option>
                    <option value="domestic_help">Domestic Help</option>
                    <option value="other">Other</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Location</Form.Label>
                  <Form.Control
                    type="text"
                    name="location"
                    value={filters.location}
                    onChange={handleFilterChange}
                    placeholder="Enter district"
                    style={{ borderRadius: 12, border: '1px solid #38bdf8' }}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Minimum Salary</Form.Label>
                  <Form.Control
                    type="number"
                    name="minSalary"
                    value={filters.minSalary}
                    onChange={handleFilterChange}
                    placeholder="Minimum wage"
                    style={{ borderRadius: 12, border: '1px solid #38bdf8' }}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Job Cards */}
        {jobs.length === 0 ? (
          <Card className="border-0 rounded-4 shadow-sm" style={{ background: '#fff', borderColor: '#e5e7eb' }}>
            <Card.Body className="text-center py-5">
              <div style={{ fontSize: '2.5rem' }} className="mb-2">📭</div>
              <h5 className="mb-1">No jobs found</h5>
              <p className="text-muted mb-0">Try adjusting filters</p>
            </Card.Body>
          </Card>
        ) : (
          <Row className="g-4">
            {jobs.map((job) => {
              const localizedJob = getLocalizedJobData(job, language);
              return (
                <Col md={6} lg={4} key={job._id}>
                  <Card className="job-card h-100 border-0 rounded-4 shadow job-list-item position-relative" style={{ border: '1.5px solid #bae6fd', transition: 'transform 0.18s, box-shadow 0.18s', cursor: 'pointer', overflow: 'visible', background: '#f8fafc' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px) scale(1.03)'; e.currentTarget.style.boxShadow = '0 8px 32px 0 #38bdf833'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 16px 0 #bae6fd33'; }}
                  >
                    {/* Decorative Icon */}
                    <div style={{
                      position: 'absolute',
                      top: -32,
                      right: 24,
                      zIndex: 2,
                      background: 'linear-gradient(135deg,#bae6fd 60%,#38bdf8 100%)',
                      borderRadius: '50%',
                      width: 56,
                      height: 56,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 12px #bae6fd88',
                      border: '2.5px solid #fff',
                    }}>
                      <img src="https://cdn-icons-png.flaticon.com/512/3135/3135768.png" alt="Job" style={{ width: 36, height: 36 }} />
                    </div>
                    <Card.Body className="p-3 p-md-4 d-flex flex-column">
                      <Card.Title className="fw-bold mb-2" style={{ fontSize: 22, color: '#0ea5e9', letterSpacing: 0.5, minHeight: 56 }}>
                        {localizedJob.displayTitle}
                      </Card.Title>

                      <div className="d-flex align-items-center mb-2" style={{ gap: 8 }}>
                        <span style={{ fontSize: 18, color: '#38bdf8' }}>🏢</span>
                        <span className="text-muted small fw-semibold">{job.employerId?.companyName || 'Company'}</span>
                      </div>

                      <div className="mb-3 d-flex flex-wrap gap-2">
                        <Badge bg="primary" className="px-3 py-2" style={{ fontSize: 15, background: 'linear-gradient(90deg,#0ea5e9,#38bdf8)', color: '#fff', border: 'none' }}>
                          💰 ₹{job.salary?.amount || job.salary}/{getLocalizedSalaryPeriod(job.salaryPeriod || job.salary?.period, language)}
                        </Badge>
                        <Badge bg="info" className="px-3 py-2" style={{ fontSize: 15, background: 'linear-gradient(90deg,#38bdf8,#0ea5e9)', color: '#fff', border: 'none' }}>
                          📍 {job.location?.district || job.location}
                        </Badge>
                        {job.startDate && job.endDate && (
                          <Badge bg="secondary" className="px-3 py-2" style={{ fontSize: 15, background: 'linear-gradient(90deg,#fbbf24,#f59e42)', color: '#fff', border: 'none' }}>
                            📅 {new Date(job.startDate).toLocaleDateString('en-IN')} - {new Date(job.endDate).toLocaleDateString('en-IN')}
                          </Badge>
                        )}
                      </div>

                      <p className="small text-muted mb-3 flex-grow-1" style={{ fontSize: 16, minHeight: 48 }}>
                        <span style={{ color: '#0ea5e9', fontWeight: 600 }}>Job Details: </span>
                        {localizedJob.displayDescription?.substring(0, 90)}...
                      </p>

                      <div className="d-flex align-items-center justify-content-between mt-auto" style={{ gap: 8 }}>
                        <Button
                          as={Link}
                          to={`/jobs/${job._id}`}
                          variant="primary"
                          className="fw-bold px-4 py-2"
                          style={{ borderRadius: 12, fontSize: 17, background: 'linear-gradient(90deg,#0ea5e9,#38bdf8)', border: 'none', boxShadow: '0 2px 8px #38bdf833' }}
                        >
                          🔍 View Details
                        </Button>
                        <span className="text-muted small" style={{ fontSize: 14 }}>
                          Posted: {new Date(job.createdAt).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </Container>
    </div>
  );

  if (user && user.userType === 'employer') {
    return (
      <DashboardLayout
        title="🏢 Employer Panel"
        subtitle="Manage jobs and workers"
        menuItems={employerMenu}
        accountInfo={{
          name: user?.name,
          email: user?.email,
          type: user?.userType,
        }}
      >
        {mainContent}
      </DashboardLayout>
    );
  }
  return mainContent;
};

export default JobList;
