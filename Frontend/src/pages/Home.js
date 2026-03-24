import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useLanguage } from '../hooks/useLanguage';
import { jobAPI } from '../services/api';

const Home = () => {
  const { t } = useLanguage();
  const [latestJobs, setLatestJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);

  // Create falling rain drops effect
  const rainDrops = Array.from({ length: 25 }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 6 + Math.random() * 4,
  }));

  useEffect(() => {
    const fetchLatestJobs = async () => {
      try {
        const response = await jobAPI.getAll({ page: 1, limit: 6 });
        setLatestJobs(response.data.jobs || []);
      } catch (error) {
        setLatestJobs([]);
      } finally {
        setJobsLoading(false);
      }
    };

    fetchLatestJobs();
  }, []);

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

      {/* ===== HERO SECTION (no shadow) ===== */}
      <div className="hero-section" style={{ background: '#f0fdfa', borderBottom: '1px solid #bae6fd' }}>
        <div className="container py-5">
          <div className="row align-items-center">
            <div className="col-md-7 text-center text-md-start">
              <h1 className="hero-title mb-3" style={{ color: '#0ea5e9', fontWeight: 800, fontSize: '2.7rem', letterSpacing: 1 }}>
                Empowering Rural Workers. <br className="d-none d-md-block" />
                <span style={{color:'#38bdf8'}}>Simplifying Hiring.</span>
              </h1>
              <p className="hero-subtitle mb-4" style={{ fontSize: '1.3rem', color: '#0ea5e9', fontWeight: 600 }}>
                Finding jobs is difficult for rural and less-educated people.<br />
                At the same time, industries struggle to find reliable workers.<br />
                <span style={{ color: '#111' }}>Our platform bridges this gap.</span>
              </p>
              <p style={{ fontSize: '1.15rem', color: '#0ea5e9', fontWeight: 700, marginTop: 24 }}>
                Built for real people, real jobs, real earnings
              </p>
            </div>
            <div className="col-md-5 text-center">
              <img src="https://cdn-icons-png.flaticon.com/512/3135/3135768.png" alt="Rural Worker" style={{maxWidth:'90%', height:'220px', borderRadius:'18px'}} />
            </div>
          </div>
        </div>
      </div>

      {/* ===== HOW THE WEBSITE WORKS / PROPOSAL SECTION ===== */}
      <div className="container py
      -5">
        <h2 className="text-center mb-4" style={{color:'#0ea5e9', fontWeight:700}}>How the Platform Works</h2>
        <div className="row justify-content-center">
          <div className="col-md-10">
            <div className="card p-4 shadow-sm border-0">
              <h5 className="fw-bold mb-3">Thought & Proposal</h5>
              <p style={{fontSize:'1.1rem'}}>
                <b>Problem:</b> Rural and less-educated people struggle to find jobs, while industries and households face difficulty finding reliable workers. Middlemen often exploit both sides, taking a large cut and causing confusion.
              </p>
              <p style={{fontSize:'1.1rem'}}>
                <b>Solution:</b> Our platform directly connects rural workers and employers, removing the need for agents. The admin coordinates and verifies jobs, ensuring only genuine opportunities are posted. Employers can post jobs or request workers, and workers can apply or be assigned jobs based on their skills and location.
              </p>
              <ul style={{fontSize:'1.1rem'}}>
                <li><b>For Workers:</b> Register, fill in skills, browse/apply for jobs, or get assigned by admin. Work, mark completion, and receive secure payment directly to your account.</li>
                <li><b>For Employers:</b> Register, post job details, review applications, select workers, pay securely, and rate workers after job completion.</li>
              </ul>
              <p style={{fontSize:'1.1rem'}}>
                <b>Payment:</b> Employers pay on the platform. The platform holds the payment until work is completed, then releases it to the worker after deducting a small fee. This ensures trust and transparency for both sides.
              </p>
              <p style={{fontSize:'1.1rem'}}>
                <b>Vision:</b> To create a fair, transparent, and easy-to-use system that empowers rural communities and helps industries grow with reliable manpower.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== ADMIN SUPPORT & PAYMENT FLOW SECTION ===== */}
      <div className="container py-5">
        <h2 className="text-center mb-4" style={{color:'#0ea5e9', fontWeight:700}}>Admin Support & Payment Flow</h2>
        <div className="row justify-content-center">
          <div className="col-md-10">
            <div className="card p-4 shadow-sm border-0">
              <p style={{fontSize:'1.1rem'}}>
                <b>Admin Support for Rural Users:</b> Many people in rural areas are not comfortable using online platforms. To help them, our admin team actively assigns jobs to workers based on their skills and location. This ensures that even those who cannot use the website can still get fair job opportunities.
              </p>
              <p style={{fontSize:'1.1rem'}}>
                <b>How Payment Works:</b> Employers (job providers) pay the full amount to the platform in advance. The platform (admin) holds the payment securely. After the worker completes the job, the admin releases the payment to the worker. For this service, the platform charges a small fee of ₹20 per worker per day from the employer. This makes the process safe, transparent, and fair for everyone.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== MESSAGING & PRIVATE CHAT SECTION ===== */}
      <div className="container py-5">
        <h2 className="text-center mb-4" style={{color:'#0ea5e9', fontWeight:700}}>Messaging & Private Chat</h2>
        <div className="row justify-content-center">
          <div className="col-md-10">
            <div className="card p-4 shadow-sm border-0">
              <p style={{fontSize:'1.1rem'}}>
                <b>Communication Made Easy:</b> Our platform allows admin, workers, and employers to send messages to each other. This helps everyone stay connected, clear doubts, and solve problems quickly.
              </p>
              <p style={{fontSize:'1.1rem'}}>
                <b>Private Chat Groups:</b> For every job, a private chat group is created where the assigned worker, the employer, and the admin can communicate securely. This ensures all important information and updates are shared in one place, making the process smooth and transparent.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== SIMPLE & SECURE PROCESS SECTION (neutral bg) ===== */}
      <div className="container py-5" style={{background: '#f8fafc', borderRadius: '18px', marginBottom: 32}}>
        <h2 className="text-center mb-4" style={{color:'#0ea5e9', fontWeight:700}}>Simple & Secure Process</h2>
        <div className="row justify-content-center">
          <div className="col-md-8">
            <ol style={{fontSize:'1.15rem', color:'#222', background: 'none', padding: '0 0 0 1.2em'}}>
              <li style={{marginBottom: 10}}>Employers post jobs or receive assigned work</li>
              <li style={{marginBottom: 10}}>Admin connects workers with employers</li>
              <li style={{marginBottom: 10}}>Workers complete the job</li>
              <li style={{marginBottom: 10}}>Employer makes payment on platform</li>
              <li>Platform safely pays workers</li>
            </ol>
          </div>
        </div>
      </div>

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
