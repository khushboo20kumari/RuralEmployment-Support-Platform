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
          <span className="visually-hidden">लोड हो रहा है...</span>
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
                <Form.Label>काम का प्रकार</Form.Label>
                <Form.Select name="workType" value={filters.workType} onChange={handleFilterChange}>
                  <option value="">सभी प्रकार</option>
                  <option value="construction_labour">निर्माण मज़दूर</option>
                  <option value="factory_helper">फैक्ट्री हेल्पर</option>
                  <option value="farm_worker">खेती मज़दूर</option>
                  <option value="domestic_help">घरेलू सहायक</option>
                  <option value="other">अन्य</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>जगह</Form.Label>
                <Form.Control
                  type="text"
                  name="location"
                  value={filters.location}
                  onChange={handleFilterChange}
                  placeholder="ज़िला लिखें"
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>कम से कम मजदूरी</Form.Label>
                <Form.Control
                  type="number"
                  name="minSalary"
                  value={filters.minSalary}
                  onChange={handleFilterChange}
                  placeholder="न्यूनतम मजदूरी"
                />
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Jobs List */}
      {jobs.length === 0 ? (
        <div className="text-center py-5">
          <h4>😔 {language === 'hi' ? 'कोई काम नहीं मिला' : 'No jobs found'}</h4>
          <p>{language === 'hi' ? 'फिल्टर बदलकर फिर देखें' : 'Try adjusting filters'}</p>
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
                        🔍 {language === 'hi' ? 'विवरण देखें' : 'View Details'}
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
