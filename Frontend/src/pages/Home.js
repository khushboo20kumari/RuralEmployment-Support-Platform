import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useLanguage } from '../hooks/useLanguage';

const Home = () => {
  const { t } = useLanguage();
  
  // Create falling rain drops effect
  const rainDrops = Array.from({ length: 25 }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 6 + Math.random() * 4,
  }));

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

      {/* Hero Section */}
      <div className="hero-section">
        <Container>
          <Row className="align-items-center py-5">
            <Col lg={6} className="mb-4 mb-lg-0">
              <h1 className="hero-title">{t('home.title')}</h1>
              <p className="hero-subtitle">{t('home.subtitle')}</p>
              <p className="hero-description">
                🏭 Construction | 🚜 Farming | 🏠 Domestic | 📦 And More
              </p>
              <div className="d-flex gap-3 flex-wrap mt-4">
                <Button as={Link} to="/jobs" variant="light" size="lg" className="hero-btn fw-bold">
                  {t('home.browseJobs')}
                </Button>
                <Button as={Link} to="/register" variant="outline-light" size="lg" className="hero-btn fw-bold">
                  {t('home.registerNow')}
                </Button>
              </div>
            </Col>
            <Col lg={6}>
              <div className="hero-image text-center">
                <div style={{ fontSize: '6rem', marginTop: '20px' }}>👷‍♀️ 💼 🤝</div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Problems Solved Section */}
      <Container className="py-5">
        <h2 className="section-title text-center mb-5">💡 {t('home.problems')}</h2>
        <Row>
          <Col md={6} lg={4} className="mb-4">
            <div className="problem-card">
              <div className="problem-icon">💸</div>
              <h5>{t('home.problem1')}</h5>
              <p>{t('home.problem1Desc')}</p>
              <small className="text-muted"><strong>₹5000 → ₹4750 खरा</strong></small>
            </div>
          </Col>
          <Col md={6} lg={4} className="mb-4">
            <div className="problem-card">
              <div className="problem-icon">✅</div>
              <h5>{t('home.problem2')}</h5>
              <p>{t('home.problem2Desc')}</p>
              <small className="text-muted"><strong>100% सुरक्षित</strong></small>
            </div>
          </Col>
          <Col md={6} lg={4} className="mb-4">
            <div className="problem-card">
              <div className="problem-icon">👁️</div>
              <h5>{t('home.problem3')}</h5>
              <p>{t('home.problem3Desc')}</p>
              <small className="text-muted"><strong>कोई राज़ नहीं</strong></small>
            </div>
          </Col>
        </Row>
      </Container>

      {/* How It Works */}
      <div className="how-it-works-bg py-5">
        <Container>
          <h2 className="section-title text-center mb-5 text-white">🚀 {t('home.howItWorks')}</h2>
          <Row>
            <Col md={4} className="mb-4">
              <Card className="how-it-works-card h-100">
                <Card.Body>
                  <div className="step-number">1</div>
                  <div className="mb-3" style={{ fontSize: '3rem' }}>👷</div>
                  <Card.Title className="fw-bold">{t('home.forWorkers')}</Card.Title>
                  <ol className="text-sm">
                    <li>{t('home.workerStep1')}</li>
                    <li>{t('home.workerStep2')}</li>
                    <li>{t('home.workerStep3')}</li>
                    <li>{t('home.workerStep4')}</li>
                    <li>{t('home.workerStep5')}</li>
                  </ol>
                  <Button as={Link} to="/register?type=worker" variant="primary" className="w-100 mt-3">
                    {t('home.registerAsWorker')}
                  </Button>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4} className="mb-4">
              <Card className="how-it-works-card h-100">
                <Card.Body>
                  <div className="step-number">2</div>
                  <div className="mb-3" style={{ fontSize: '3rem' }}>🏢</div>
                  <Card.Title className="fw-bold">{t('home.forEmployers')}</Card.Title>
                  <ol className="text-sm">
                    <li>{t('home.employerStep1')}</li>
                    <li>{t('home.employerStep2')}</li>
                    <li>{t('home.employerStep3')}</li>
                    <li>{t('home.employerStep4')}</li>
                    <li>{t('home.employerStep5')}</li>
                  </ol>
                  <Button as={Link} to="/register?type=employer" variant="primary" className="w-100 mt-3">
                    {t('home.registerAsEmployer')}
                  </Button>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4} className="mb-4">
              <Card className="how-it-works-card h-100">
                <Card.Body>
                  <div className="step-number">3</div>
                  <div className="mb-3" style={{ fontSize: '3rem' }}>👨‍⚖️</div>
                  <Card.Title className="fw-bold">{t('home.forAdmin')}</Card.Title>
                  <ol className="text-sm">
                    <li>{t('home.adminStep1')}</li>
                    <li>{t('home.adminStep2')}</li>
                    <li>{t('home.adminStep3')}</li>
                    <li>{t('home.adminStep4')}</li>
                    <li>{t('home.adminStep5')}</li>
                  </ol>
                  <Button as={Link} to="/login" variant="primary" className="w-100 mt-3">
                    {t('home.adminLogin')}
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Features Section */}
      <Container className="py-5">
        <h2 className="section-title text-center mb-5">💎 {t('home.features')}</h2>
        <Row>
          <Col md={6} className="mb-4">
            <Card className="feature-card h-100">
              <Card.Body>
                <div className="mb-3" style={{ fontSize: '2.5rem' }}>💼</div>
                <Card.Title className="fw-bold">{t('home.feature1Title')}</Card.Title>
                <Card.Text>
                  {t('home.feature1Desc')}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} className="mb-4">
            <Card className="feature-card h-100">
              <Card.Body>
                <div className="mb-3" style={{ fontSize: '2.5rem' }}>🔍</div>
                <Card.Title className="fw-bold">{t('home.feature2Title')}</Card.Title>
                <Card.Text>
                  {t('home.feature2Desc')}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} className="mb-4">
            <Card className="feature-card h-100">
              <Card.Body>
                <div className="mb-3" style={{ fontSize: '2.5rem' }}>💳</div>
                <Card.Title className="fw-bold">{t('home.feature3Title')}</Card.Title>
                <Card.Text>
                  {t('home.feature3Desc')}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} className="mb-4">
            <Card className="feature-card h-100">
              <Card.Body>
                <div className="mb-3" style={{ fontSize: '2.5rem' }}>⭐</div>
                <Card.Title className="fw-bold">{t('home.feature4Title')}</Card.Title>
                <Card.Text>
                  {t('home.feature4Desc')}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Stats Section */}
      <div className="stats-section py-5">
        <Container>
          <Row className="text-center text-white">
            <Col md={3} className="mb-4">
              <div className="stat-card-home">
                <div className="stat-number">1000+</div>
                <div className="stat-label">{t('home.activeWorkers')}</div>
              </div>
            </Col>
            <Col md={3} className="mb-4">
              <div className="stat-card-home">
                <div className="stat-number">500+</div>
                <div className="stat-label">{t('home.jobsPosted')}</div>
              </div>
            </Col>
            <Col md={3} className="mb-4">
              <div className="stat-card-home">
                <div className="stat-number">₹50L+</div>
                <div className="stat-label">{t('home.paidOut')}</div>
              </div>
            </Col>
            <Col md={3} className="mb-4">
              <div className="stat-card-home">
                <div className="stat-number">98%</div>
                <div className="stat-label">{t('home.satisfactionRate')}</div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* CTA Section */}
      <div className="cta-section py-5">
        <Container>
          <div className="text-center">
            <h2 className="mb-4">{t('home.readyToStart')}</h2>
            <p className="mb-4" style={{ fontSize: '1.2rem' }}>{t('home.ctaDesc')}</p>
            <div className="d-flex gap-3 justify-content-center flex-wrap">
              <Button as={Link} to="/jobs" variant="light" size="lg" className="fw-bold">
                {t('home.viewJobs')}
              </Button>
              <Button as={Link} to="/register" variant="outline-light" size="lg" className="fw-bold">
                {t('home.registerNow2')}
              </Button>
            </div>
          </div>
        </Container>
      </div>

      {/* Footer */}
      <footer className="footer py-4">
        <Container>
          <Row>
            <Col md={6}>
              <h5>{t('home.footerTitle')}</h5>
              <p>{t('home.footerDesc')}</p>
            </Col>
            <Col md={6} className="text-md-end">
              <p>{t('home.footerCopyright')}</p>
            </Col>
          </Row>
        </Container>
      </footer>
    </div>
  );
};

export default Home;
