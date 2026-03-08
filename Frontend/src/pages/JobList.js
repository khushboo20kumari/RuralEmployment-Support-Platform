import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { jobAPI } from '../services/api';
import { useLanguage } from '../hooks/useLanguage';
import { getLocalizedJobData, getLocalizedWorkType, getLocalizedSalaryPeriod } from '../utils/localization';

const JobList = () => {
  const { t, language } = useLanguage();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    workType: '',
    location: '',
    minSalary: '',
  });

  // Create falling rain drops effect
  const rainDrops = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 6 + Math.random() * 4,
  }));

  useEffect(() => {
    fetchJobs();
  }, [filters]);

  const fetchJobs = async () => {
    try {
      const response = await jobAPI.getAll(filters);
      setJobs(response.data.jobs);
    } catch (error) {
      toast.error(t('common.errorOccurred'));
    } finally {
      setLoading(false);
    }
  };

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
    <div className="home-page">
      {/* Falling Rain Effect */}
      <div className="rain-container">
        {rainDrops.map(drop => (
          <div
            key={drop.id}
            className="rain-drop"
            style={{
              left: `${drop.left}%`,
              animationDelay: `${drop.delay}s`,
              animationDuration: `${drop.duration}s`,
            }}
          />
        ))}
      </div>

      <Container className="my-5">
        <h2 className="section-title mb-4">📋 {t('jobList.title')}</h2>

        {/* Filters */}
        <Card className="mb-4 shadow">
          <Card.Body>
          <Row>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Work Type</Form.Label>
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
                <Form.Label>Location</Form.Label>
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
                <Form.Label>Minimum Salary</Form.Label>
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

      {/* Jobs List */}
      {jobs.length === 0 ? (
        <div className="text-center py-5">
          <h4>😔 No jobs found</h4>
          <p>Try adjusting filters</p>
        </div>
      ) : (
        <Row>
          {jobs.map((job) => {
            const localizedJob = getLocalizedJobData(job, language);
            return (
              <Col md={6} lg={4} key={job._id} className="mb-4">
                <Card className="job-card h-100 shadow-sm">
                  <Card.Body>
                    <Card.Title className="fw-bold mb-2">
                      {localizedJob.displayTitle}
                    </Card.Title>
                    <p className="text-muted small mb-3">
                      🏢 {job.employer?.companyName || 'Company'}
                    </p>
                    
                    <div className="mb-3">
                      <Badge bg="primary" className="me-2 mb-2">
                        💰 ₹{job.salary?.amount || job.salary}/{getLocalizedSalaryPeriod(job.salaryPeriod || job.salary?.period, language)}
                      </Badge>
                      <Badge bg="info">
                        📍 {job.location?.district || job.location}
                      </Badge>
                    </div>
                    
                    <p className="small text-muted mb-3">
                      {localizedJob.displayDescription?.substring(0, 80)}...
                    </p>
                    
                    <div className="d-grid">
                      <Button 
                        as={Link} 
                        to={`/jobs/${job._id}`} 
                        variant="primary" 
                        size="sm"
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
