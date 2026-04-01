import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { jobAPI, employerAPI, messageAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';
// import DashboardLayout from '../components/DashboardLayout';
import SimpleBarChart from '../components/SimpleBarChart';
import JobTestimonial from '../components/JobTestimonial';
import DashboardLayout from '../components/DashboardLayout';

const EmployerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ jobs: 0, workersHired: 0, activeJobs: 0, closedJobs: 0 });
  const [myJobs, setMyJobs] = useState([]);
  const [profile, setProfile] = useState(null);
  const [assignmentGroups, setAssignmentGroups] = useState([]);
  const [filter, setFilter] = useState('all'); // all, open, closed
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [jobsRes, profileRes, assignmentRes] = await Promise.all([
        jobAPI.getMyJobs(),
        employerAPI.getProfile(),
        employerAPI.getAssignmentGroups(),
      ]);

      const jobs = jobsRes.data.jobs;
      const employerProfile = profileRes.data.employer;
      const groups = assignmentRes.data.groups || [];
      setMyJobs(jobs);
      setProfile(employerProfile);
      setAssignmentGroups(groups);
      setStats({
        jobs: jobs.length,
        workersHired: employerProfile.workersHired || 0,
        activeJobs: jobs.filter(j => j.jobStatus === 'open').length,
        closedJobs: jobs.filter(j => j.jobStatus === 'closed').length,
      });

      try {
        const unreadRes = await messageAPI.getUnreadCount();
        setUnreadCount(Number(unreadRes.data?.unreadCount || 0));
      } catch (e) {
        setUnreadCount(0);
      }
    } catch (error) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredJobs = () => {
    switch (filter) {
      case 'open':
        return myJobs.filter(j => j.jobStatus === 'open');
      case 'closed':
        return myJobs.filter(j => j.jobStatus === 'closed');
      default:
        return myJobs;
    }
  };

  const openGroupChat = async (jobId) => {
    try {
      const response = await messageAPI.getOrCreateJobGroup(jobId);
      const groupChatId = response.data?.chat?._id;
      if (!groupChatId) {
        toast.error('Group chat not available');
        return;
      }
      navigate(`/messages/group/${groupChatId}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to open group chat');
    }
  };

  if (loading) {
    return (
      <Container className="my-5 text-center">
        <div className="spinner-border text-primary" role="status" />
      </Container>
    );
  }

  // Role header card
  const roleHeader = (
    <Card className="border-0 shadow-sm rounded-4 mb-4 overflow-hidden" style={{background:'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)'}}>
      <Card.Body className="d-flex align-items-center gap-3 p-4">
        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name||'U')}&background=6366f1&color=fff&rounded=true&size=64`} alt="avatar" style={{width:64,height:64,borderRadius:'50%',boxShadow:'0 2px 8px rgba(99,102,241,0.15)'}} />
        <div>
          <h3 className="fw-bold mb-1" style={{color:'#6366f1',letterSpacing:0.5}}>{user?.name || 'Employer'} <span style={{fontSize:22,marginLeft:8}}>🏢 Employer</span></h3>
          <div className="text-muted" style={{fontSize:'1.08rem'}}>Welcome to your Employer Dashboard</div>
        </div>
      </Card.Body>
    </Card>
  );

  // Sidebar menu for employer (same as RolePageLayout in App.js)
  const employerMenu = [
    { to: '/employer/dashboard', label: 'Dashboard' },
    { to: '/employer/post-job', label: 'Post New Job' },
    { to: '/employer/payments', label: 'Payments' },
    { to: '/messages', label: 'Messages' },
    { to: '/profile', label: 'Account' },
  ];

  return (
    <DashboardLayout
      title={"🏢 Employer Panel"}
      subtitle={"Manage jobs and workers"}
      menuItems={employerMenu}
      accountInfo={{
        name: user?.name,
        email: user?.email,
        type: 'employer',
      }}
    >
      <Container className="my-4 my-md-5">
        {roleHeader}
        <Row className="mb-4">
          <Col md={3} sm={6} xs={12} className="mb-3">
            <Card className="shadow-sm border-0 text-center">
              <Card.Body>
                <div className="fs-2 mb-2">📋</div>
                <div className="fw-bold">Total Jobs</div>
                <div className="fs-4">{stats.jobs}</div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} sm={6} xs={12} className="mb-3">
            <Card className="shadow-sm border-0 text-center">
              <Card.Body>
                <div className="fs-2 mb-2">👷‍♂️</div>
                <div className="fw-bold">Workers Hired</div>
                <div className="fs-4">{stats.workersHired}</div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} sm={6} xs={12} className="mb-3">
            <Card className="shadow-sm border-0 text-center">
              <Card.Body>
                <div className="fs-2 mb-2">🟢</div>
                <div className="fw-bold">Active Jobs</div>
                <div className="fs-4">{stats.activeJobs}</div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} sm={6} xs={12} className="mb-3">
            <Card className="shadow-sm border-0 text-center">
              <Card.Body>
                <div className="fs-2 mb-2">🔴</div>
                <div className="fw-bold">Closed Jobs</div>
                <div className="fs-4">{stats.closedJobs}</div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Card className="border-0 rounded-4 mb-4">
          <Card.Body className="p-4">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div>
                <h5 className="mb-1 fw-bold">👤 Company Profile</h5>
                <p className="text-muted mb-0">
                  {profile?.companyName || user?.name || 'Employer'} • {profile?.companyType || 'Business'}
                </p>
              </div>
              <div className="d-flex gap-2 flex-wrap">
                <Button as={Link} to="/profile" variant="outline-primary">Update Profile</Button>
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* You can add more dashboard sections here, e.g. job list, worker groups, etc. */}
      </Container>
    </DashboardLayout>
  );
};

export default EmployerDashboard;
