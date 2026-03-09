import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { jobAPI } from '../services/api';
import { useLanguage } from '../hooks/useLanguage';
import { getLocalizedJobData, getLocalizedSalaryPeriod } from '../utils/localization';

const JobList = () => {
  const { t, language } = useLanguage();
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

  return (
    <div className="job-list-page">
      <Container className="my-4 my-md-5">
        <div className="rounded-4 p-3 p-md-4 mb-4" style={{ background: 'linear-gradient(135deg, #eef4ff 0%, #f7faff 100%)', border: '1px solid #d8e4fb' }}>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h2 className="mb-1 fw-bold">📋 {t('jobList.title')}</h2>
              <p className="text-muted mb-0">Find verified jobs with clear details and fair pay.</p>
            </div>
            <div className="badge bg-primary-subtle text-primary border px-3 py-2">
              {jobs.length} Jobs
            </div>
          </div>
        </div>

        <Card className="mb-4 border rounded-4 job-list-filter-card" style={{ borderColor: '#dbe3f1' }}>
          <Card.Body className="p-3 p-md-4">
            <Row className="g-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Work Type</Form.Label>
                  <Form.Select name="workType" value={filters.workType} onChange={handleFilterChange}>
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
                  />
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {jobs.length === 0 ? (
          <Card className="border rounded-4" style={{ borderColor: '#e5e7eb' }}>
            <Card.Body className="text-center py-5">
              <div style={{ fontSize: '2rem' }} className="mb-2">📭</div>
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
                  <Card className="job-card h-100 border rounded-4 job-list-item" style={{ borderColor: '#dbe3f1' }}>
                    <Card.Body className="p-3 p-md-4 d-flex flex-column">
                      <Card.Title className="fw-bold mb-2">
                        {localizedJob.displayTitle}
                      </Card.Title>

                      <p className="text-muted small mb-3">
                        🏢 {job.employer?.companyName || 'Company'}
                      </p>

                      <div className="mb-3 d-flex flex-wrap gap-2">
                        <Badge bg="primary" className="px-3 py-2">
                          💰 ₹{job.salary?.amount || job.salary}/{getLocalizedSalaryPeriod(job.salaryPeriod || job.salary?.period, language)}
                        </Badge>
                        <Badge bg="info" className="px-3 py-2">
                          📍 {job.location?.district || job.location}
                        </Badge>
                      </div>

                      <p className="small text-muted mb-3 flex-grow-1">
                        {localizedJob.displayDescription?.substring(0, 90)}...
                      </p>

                      <div className="d-grid">
                        <Button
                          as={Link}
                          to={`/jobs/${job._id}`}
                          variant="primary"
                          className="fw-bold"
                        >
                          🔍 View Details
                        </Button>
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
};

export default JobList;
