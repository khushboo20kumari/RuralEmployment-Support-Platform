import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Form, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { jobAPI, applicationAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { useLanguage } from '../hooks/useLanguage';
import { getLocalizedJobData, getLocalizedWorkType, getLocalizedSalaryPeriod } from '../utils/localization';

const JobDetails = () => {
  const { language } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState('');
  const [applying, setApplying] = useState(false);

  const fetchJob = useCallback(async () => {
    try {
      const response = await jobAPI.getById(id);
      setJob(response.data.job);
    } catch (error) {
      toast.error('काम की जानकारी लाने में दिक्कत हुई');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  const handleApply = async () => {
    if (!user) {
      toast.info('अर्ज़ी भेजने के लिए लॉगिन करें');
      navigate('/login');
      return;
    }

    if (user.userType !== 'worker') {
      toast.error('सिर्फ मज़दूर ही अर्ज़ी भेज सकते हैं');
      return;
    }

    setApplying(true);
    try {
      await applicationAPI.apply(id, { appliedMessage: applicationMessage });
      toast.success('अर्ज़ी सफलतापूर्वक भेज दी गई!');
      setShowApplyModal(false);
      setApplicationMessage('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'अर्ज़ी भेजने में दिक्कत हुई');
    } finally {
      setApplying(false);
    }
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

  if (!job) {
    return (
      <Container className="my-5">
        <Card>
          <Card.Body className="text-center py-5">
            <h4>{language === 'hi' ? 'काम नहीं मिला' : 'Job not found'}</h4>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  const localizedJob = getLocalizedJobData(job, language);

  return (
    <Container className="my-5">
      <Row>
        <Col md={8}>
          <Card>
            <Card.Body>
              <div className="mb-3">
                <h2>{localizedJob.displayTitle}</h2>
                <Badge bg="primary" className="me-2">{getLocalizedWorkType(job.workType, language)}</Badge>
                <Badge bg={job.jobStatus === 'open' ? 'success' : 'secondary'}>
                  {language === 'hi' 
                    ? (job.jobStatus === 'open' ? 'खुला' : 'बंद')
                    : (job.jobStatus === 'open' ? 'Open' : 'Closed')
                  }
                </Badge>
              </div>

              <Card.Text>
                <h5>{language === 'hi' ? 'काम का विवरण' : 'Job Description'}</h5>
                <p>{localizedJob.displayDescription || (language === 'hi' ? 'कोई विवरण नहीं दिया गया' : 'No description provided')}</p>
              </Card.Text>

              <hr />

              <Row>
                <Col md={6}>
                  <h6>{language === 'hi' ? 'जगह' : 'Location'}</h6>
                  <p>{job.location?.village}, {job.location?.district}, {job.location?.state}</p>
                </Col>
                <Col md={6}>
                  <h6>{language === 'hi' ? 'मजदूरी' : 'Salary'}</h6>
                  <p>₹{job.salary?.amount} {getLocalizedSalaryPeriod(job.salary?.period, language)}</p>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <h6>{language === 'hi' ? 'कुल जगह' : 'Positions'}</h6>
                  <p>{job.numberOfPositions}</p>
                </Col>
                <Col md={6}>
                  <h6>{language === 'hi' ? 'अनुभव चाहिए' : 'Experience Required'}</h6>
                  <p>{job.experienceRequired || 0} {language === 'hi' ? 'साल' : 'years'}</p>
                </Col>
              </Row>

              {(job.startDate || job.endDate) && (
                <Row>
                  <Col md={12}>
                    <h6>{language === 'hi' ? 'काम की अवधि (कब से कब तक)' : 'Work Duration'}</h6>
                    <p>
                      {job.startDate ? new Date(job.startDate).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN') : '-'}
                      {' '}→{' '}
                      {job.endDate ? new Date(job.endDate).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN') : '-'}
                    </p>
                  </Col>
                </Row>
              )}

              {job.workingHours && (
                <Row>
                  <Col md={12}>
                    <h6>{language === 'hi' ? 'काम का समय' : 'Working Hours'}</h6>
                    <p>{job.workingHours.startTime} - {job.workingHours.endTime}</p>
                  </Col>
                </Row>
              )}

              {job.benefits && job.benefits.length > 0 && (
                <>
                  <h6>{language === 'hi' ? 'सुविधाएँ' : 'Benefits'}</h6>
                  <ul>
                    {job.benefits.map((benefit, index) => (
                      <li key={index}>{benefit}</li>
                    ))}
                  </ul>
                </>
              )}

              {job.accommodation && <p>✓ रहने की सुविधा मिलेगी</p>}
              {job.mealProvided && <p>✓ खाने की सुविधा मिलेगी</p>}
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card>
            <Card.Body>
              <h5>मालिक की जानकारी</h5>
              <p><strong>कंपनी:</strong> {job.employerId?.companyName || 'जानकारी नहीं'}</p>
              <p><strong>संपर्क व्यक्ति:</strong> {job.employerId?.contactPerson || 'जानकारी नहीं'}</p>
              
              <div className="d-grid gap-2">
                {!user ? (
                  // Not logged in
                  <>
                    <Button 
                      variant="primary" 
                      onClick={() => {
                        toast.info('अर्ज़ी भेजने के लिए लॉगिन करें');
                        navigate('/login');
                      }}
                    >
                      लॉगिन करके अर्ज़ी भेजें
                    </Button>
                    <Button 
                      variant="outline-primary"
                      onClick={() => {
                        toast.info('नए उपयोगकर्ता के रूप में रजिस्टर करें');
                        navigate('/register');
                      }}
                    >
                      अब रजिस्टर करें
                    </Button>
                  </>
                ) : user.userType === 'worker' ? (
                  // Worker logged in
                  <>
                    {job.jobStatus === 'open' && (
                      <Button 
                        variant="primary" 
                        onClick={() => setShowApplyModal(true)}
                      >
                        अभी अर्ज़ी भेजें
                      </Button>
                    )}
                    <Button 
                      variant="outline-success"
                      onClick={() => navigate(`/messages/${job.employerId._id}`)}
                    >
                      💬 मालिक से पूछें
                    </Button>
                  </>
                ) : (
                  // Employer logged in
                  <div className="alert alert-info">
                    यह आपकी पोस्ट की गई नौकरी है
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Apply Modal */}
      <Modal show={showApplyModal} onHide={() => setShowApplyModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>काम के लिए अर्ज़ी</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>आप यह काम क्यों करना चाहते हैं?</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={applicationMessage}
                onChange={(e) => setApplicationMessage(e.target.value)}
                placeholder="मालिक को छोटा सा संदेश लिखें..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowApplyModal(false)}>
            बंद करें
          </Button>
          <Button variant="primary" onClick={handleApply} disabled={applying}>
            {applying ? 'भेजा जा रहा है...' : 'अर्ज़ी भेजें'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default JobDetails;
