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
    { to: '/employer/dashboard', label: 'Dashboard' },
    { to: '/employer/post-job', label: 'Post New Job' },
    { to: '/employer/payments', label: 'Payments' },
    { to: '/profile', label: 'Company Profile' },
    { to: '/messages', label: 'Messages' },
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
                <Col md={12} key={job._id}>
                  <Card className="job-card job-list-item d-flex flex-row align-items-stretch border-0 rounded-4 shadow-sm mb-4" style={{ border: '1.5px solid #e5e7eb', background: '#fff', minHeight: 160, transition: 'box-shadow 0.18s, transform 0.18s', cursor: 'pointer', overflow: 'hidden' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 8px 32px 0 #b6c6d833'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 12px 0 #e5e7eb55'; }}
                  >
                    {/* Image/Logo left */}
                    <div className="d-flex align-items-center justify-content-center" style={{ minWidth: 120, background: '#f3f6f8', height: '100%' }}>
                      <img src="https://cdn-icons-png.flaticon.com/512/3135/3135768.png" alt="Job" style={{ width: 64, height: 64, borderRadius: 12, objectFit: 'cover', boxShadow: '0 2px 8px #e5e7eb55' }} />
                    </div>
                    {/* Content right */}
                    <div className="flex-grow-1 d-flex flex-column justify-content-between p-3 p-md-4">
                      <div>
                        <div className="d-flex align-items-center justify-content-between mb-1">
                          <h5 className="fw-bold mb-0" style={{ color: '#222', fontSize: 20, letterSpacing: 0.2 }}>{localizedJob.displayTitle}</h5>
                          <span className="text-muted small fw-semibold" style={{ fontSize: 15 }}>{job.employerId?.companyName || 'Company'}</span>
                        </div>
                        <div className="d-flex flex-wrap gap-2 mb-2">
                          <span className="badge" style={{ background: '#e5e7eb', color: '#222', fontWeight: 500, fontSize: 15, borderRadius: 7, padding: '6px 14px' }}>
                            ₹{job.salary?.amount || job.salary}/{getLocalizedSalaryPeriod(job.salaryPeriod || job.salary?.period, language)}
                          </span>
                          <span className="badge" style={{ background: '#f3f6f8', color: '#555', fontWeight: 500, fontSize: 15, borderRadius: 7, padding: '6px 14px' }}>
                            {job.location?.district || job.location}
                          </span>
                          {job.startDate && job.endDate && (
                            <span className="badge" style={{ background: '#f3f6f8', color: '#555', fontWeight: 500, fontSize: 15, borderRadius: 7, padding: '6px 14px' }}>
                              {new Date(job.startDate).toLocaleDateString('en-IN')} - {new Date(job.endDate).toLocaleDateString('en-IN')}
                            </span>
                          )}
                        </div>
                        <div className="text-muted mb-2" style={{ fontSize: 15, minHeight: 36 }}>
                          {localizedJob.displayDescription?.substring(0, 90)}...
                        </div>
                      </div>
                      <div className="d-flex align-items-center justify-content-between mt-2">
                        <Button
                          as={Link}
                          to={`/jobs/${job._id}`}
                          variant="outline-primary"
                          className="fw-bold px-4 py-2"
                          style={{ borderRadius: 8, fontSize: 16, border: '1.5px solid #0073b1', background: '#fff', color: '#0073b1', boxShadow: 'none', fontWeight: 600 }}
                        >
                          View Details
                        </Button>
                        <span className="text-muted small" style={{ fontSize: 14 }}>
                          Posted: {new Date(job.createdAt).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </Container>
    </div>
  );

  // Always render only mainContent. No sidebar on public jobs page.
  return mainContent;
};

export default JobList;
