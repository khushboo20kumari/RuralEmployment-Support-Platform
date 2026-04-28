import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Tabs, Tab, Form } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useLanguage } from '../hooks/useLanguage';
import JobTestimonial from '../components/JobTestimonial';

const API_URL = process.env.REACT_APP_API_URL;

const AdminDashboard = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [employers, setEmployers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [payments, setPayments] = useState([]);
  const [assignmentJobs, setAssignmentJobs] = useState([]);
  const [assignmentGroups, setAssignmentGroups] = useState([]);
  const [activeTab, setActiveTab] = useState('assignment');
  const [suggestionsByJob, setSuggestionsByJob] = useState({});
  const [selectedWorkersByJob, setSelectedWorkersByJob] = useState({});
  const [loadingSuggestionsByJob, setLoadingSuggestionsByJob] = useState({});
  const [assigningJobId, setAssigningJobId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [releasingPaymentId, setReleasingPaymentId] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [adminChats, setAdminChats] = useState([]);
  const [messageRoleFilter, setMessageRoleFilter] = useState('all');
  const [jobsPage, setJobsPage] = useState(1);

  const JOBS_PER_PAGE = 10;
  const totalJobsPages = Math.ceil(jobs.length / JOBS_PER_PAGE);
  const paginatedJobs = jobs.slice((jobsPage - 1) * JOBS_PER_PAGE, jobsPage * JOBS_PER_PAGE);

  const getAuthHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  });

  const fetchDashboardData = useCallback(async () => {
    try {
      const [
        statsRes,
        usersRes,
        workersRes,
        employersRes,
        jobsRes,
        appsRes,
        paymentsRes,
        assignmentJobsRes,
        assignmentGroupsRes,
        unreadRes,
        chatsRes,
      ] = await Promise.all([
        axios.get(`${API_URL}/admin/stats`, { headers: getAuthHeader() }),
        axios.get(`${API_URL}/admin/users`, { headers: getAuthHeader() }),
        axios.get(`${API_URL}/admin/workers`, { headers: getAuthHeader() }),
        axios.get(`${API_URL}/admin/employers`, { headers: getAuthHeader() }),
        axios.get(`${API_URL}/admin/jobs`, { headers: getAuthHeader() }),
        axios.get(`${API_URL}/admin/applications`, { headers: getAuthHeader() }),
        axios.get(`${API_URL}/admin/payments`, { headers: getAuthHeader() }),
        axios.get(`${API_URL}/admin/assignment/jobs`, { headers: getAuthHeader() }),
        axios.get(`${API_URL}/admin/assignment/groups`, { headers: getAuthHeader() }),
        axios.get(`${API_URL}/messages/unread/count`, { headers: getAuthHeader() }),
        axios.get(`${API_URL}/messages`, { headers: getAuthHeader() }),
      ]);

      setStats(statsRes.data.stats);
      setUsers(usersRes.data.users);
      setWorkers(workersRes.data.workers);
      setEmployers(employersRes.data.employers);
      setJobs(jobsRes.data.jobs);
      setApplications(appsRes.data.applications);
      setPayments(paymentsRes.data.payments);
      setAssignmentJobs(assignmentJobsRes.data.jobs || []);
      setAssignmentGroups(assignmentGroupsRes.data.groups || []);
      setUnreadMessages(Number(unreadRes.data?.unreadCount || 0));
      setAdminChats(chatsRes.data?.chats || []);
    } catch (error) {
      toast.error(t('common.errorOccurred'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleVerifyUser = async (userId, isVerified) => {
    try {
      await axios.put(
        `${API_URL}/admin/users/${userId}/verify`,
        { isVerified },
        { headers: getAuthHeader() }
      );
      toast.success(t(isVerified ? 'admin.userVerifiedSuccess' : 'admin.userUnverifiedSuccess'));
      fetchDashboardData();
    } catch (error) {
      toast.error(t('admin.userVerificationError'));
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm(t('admin.confirmDelete'))) {
      try {
        await axios.delete(`${API_URL}/admin/users/${userId}`, { headers: getAuthHeader() });
        toast.success(t('admin.userDeletedSuccess'));
        fetchDashboardData();
      } catch (error) {
        toast.error(t('admin.deleteUserError'));
      }
    }
  };

  const handleReleasePaymentToWorker = async (paymentId) => {
    try {
      setReleasingPaymentId(paymentId);
      await axios.put(`${API_URL}/payments/admin/${paymentId}/release-to-worker`, {}, { headers: getAuthHeader() });
      toast.success('Payment released to worker successfully');
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Payment release failed');
    } finally {
      setReleasingPaymentId(null);
    }
  };

  const handleLoadSuggestions = async (jobId) => {
    try {
      setLoadingSuggestionsByJob((prev) => ({ ...prev, [jobId]: true }));
      const response = await axios.get(`${API_URL}/admin/assignment/jobs/${jobId}/suggestions`, {
        headers: getAuthHeader(),
      });

      setSuggestionsByJob((prev) => ({
        ...prev,
        [jobId]: response.data.workers || [],
      }));
    } catch (error) {
      toast.error('Suggested workers load karne me problem hui');
    } finally {
      setLoadingSuggestionsByJob((prev) => ({ ...prev, [jobId]: false }));
    }
  };

  const toggleWorkerSelection = (jobId, workerId) => {
    setSelectedWorkersByJob((prev) => {
      const existing = prev[jobId] || [];
      const next = existing.includes(workerId)
        ? existing.filter((id) => id !== workerId)
        : [...existing, workerId];

      return {
        ...prev,
        [jobId]: next,
      };
    });
  };

  const handleAssignWorkers = async (job) => {
    const selectedWorkers = selectedWorkersByJob[job._id] || [];

    if (selectedWorkers.length === 0) {
      toast.info('Pehle worker select karein');
      return;
    }

    const remainingSlots = Math.max(0, (Number(job.numberOfPositions) || 0) - (Number(job.assignedWorkers) || 0));
    if (selectedWorkers.length > remainingSlots) {
      toast.error(`Is job me abhi sirf ${remainingSlots} worker assign ho sakte hain`);
      return;
    }

    try {
      setAssigningJobId(job._id);
      await axios.post(
        `${API_URL}/admin/assignment/jobs/${job._id}/assign`,
        {
          workerIds: selectedWorkers,
          adminNotes: 'Admin matched workers after requirement check and coordination.',
          employerContactStatus: 'contacted',
        },
        { headers: getAuthHeader() }
      );

      toast.success('Workers successfully assign ho gaye');

      setSelectedWorkersByJob((prev) => ({
        ...prev,
        [job._id]: [],
      }));

      await fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Worker assignment failed');
    } finally {
      setAssigningJobId(null);
    }
  };

  const handleAutoMatchAndAssign = async (job) => {
    try {
      setAssigningJobId(job._id);

      const suggestionsRes = await axios.get(`${API_URL}/admin/assignment/jobs/${job._id}/suggestions`, {
        headers: getAuthHeader(),
      });

      const suggestions = suggestionsRes.data.workers || [];
      const countToAssign = Math.max(0, Number(job.neededWorkers) || 0);
      const autoSelected = suggestions.slice(0, countToAssign).map((w) => w._id);

      if (!autoSelected.length) {
        toast.info('Is job ke liye suitable worker abhi available nahi hai');
        return;
      }

      await axios.post(
        `${API_URL}/admin/assignment/jobs/${job._id}/assign`,
        {
          workerIds: autoSelected,
          adminNotes: 'Auto matched by admin and assigned to employer requirement.',
          employerContactStatus: 'contacted',
        },
        { headers: getAuthHeader() }
      );

      toast.success(`${autoSelected.length} worker auto-match karke assign kar diye gaye`);
      await fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Auto match assignment failed');
    } finally {
      setAssigningJobId(null);
    }
  };

  const openGroupChat = async (jobId) => {
    try {
      const response = await axios.get(`${API_URL}/messages/group/job/${jobId}`, { headers: getAuthHeader() });
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

  const getLatestProgressUpdate = (application) => {
    const updates = application?.progressUpdates || [];
    if (!updates.length) return null;
    return updates[updates.length - 1];
  };

  const formatUpdatedBy = (updatedBy) => {
    if (!updatedBy) return 'System';
    if (updatedBy === 'worker') return 'Worker';
    if (updatedBy === 'employer') return 'Employer';
    if (updatedBy === 'admin') return 'Admin';
    return updatedBy;
  };

  const formatPaymentStatus = (paymentStatus) => {
    if (!paymentStatus) return 'Not started';
    if (paymentStatus === 'advance_paid') return 'Advance paid';
    if (paymentStatus === 'pending') return 'On platform (pending release)';
    if (paymentStatus === 'completed') return 'Released to worker';
    if (paymentStatus === 'failed') return 'Failed';
    return paymentStatus;
  };


  // Robustly get the other user for a chat (for admin)
  const getChatOtherUser = (chat) => {
    if (!chat) return null;
    if (chat.chatType === 'group') return null;
    const participants = chat.participants || [];
    // Prefer non-admin
    let other = participants.find((p) => p && p.userType && p.userType !== 'admin');
    if (!other && chat.workerId?.userType && chat.workerId.userType !== 'admin') other = chat.workerId;
    if (!other && chat.employerId?.userType && chat.employerId.userType !== 'admin') other = chat.employerId;
    if (!other && participants.length > 0) other = participants[0];
    return other;
  };

  // Always show all chats in 'all', never filter out group or direct
  const filteredAdminChats = (adminChats || []).filter((chat) => {
    if (messageRoleFilter === 'group') return chat.chatType === 'group';
    if (messageRoleFilter === 'worker') {
      if (chat.chatType === 'group') return false;
      const other = getChatOtherUser(chat);
      return (other && other.userType === 'worker') || chat.workerId?.userType === 'worker';
    }
    if (messageRoleFilter === 'employer') {
      if (chat.chatType === 'group') return false;
      const other = getChatOtherUser(chat);
      return (other && other.userType === 'employer') || chat.employerId?.userType === 'employer';
    }
    // 'all': show everything
    return true;
  });

  if (loading) {
    return (
      <Container className="my-5 text-center">
        <div className="spinner-border text-primary" role="status" />
      </Container>
    );
  }

  // Role header card
  const roleHeader = (
    <Card className="border-0 shadow-sm rounded-4 mb-4 overflow-hidden mx-auto" style={{background:'linear-gradient(135deg, #1f2937 0%, #6366f1 100%)', maxWidth: 700}}>
      <Card.Body className="d-flex align-items-center gap-3 p-4">
        <img src={`https://ui-avatars.com/api/?name=Admin&background=6366f1&color=fff&rounded=true&size=64`} alt="avatar" style={{width:64,height:64,borderRadius:'50%',boxShadow:'0 2px 8px rgba(99,102,241,0.15)'}} />
        <div>
          <h3 className="fw-bold mb-1 text-white" style={{letterSpacing:0.5}}>Admin <span style={{fontSize:22,marginLeft:8}}>🛡️ Admin</span></h3>
          <div className="text-white-50" style={{fontSize:'1.08rem'}}>Welcome to your Admin Dashboard</div>
        </div>
      </Card.Body>
    </Card>
  );

  return (
    <Container className="py-5" style={{ minHeight: '100vh', background: '#f6f7f9' }}>
      {roleHeader}
      {/* Stats Cards with Gradient Backgrounds */}
      <Row className="g-4 mb-4 justify-content-center">
        <Col md={3} sm={6} xs={12} className="mb-3">
          <Card className="border-0 shadow-sm rounded-4 h-100 hover-lift text-center" style={{
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)'
          }}>
            <Card.Body className="p-4">
              <div className="fs-2">👥</div>
              <h3 className="fw-bold text-primary mb-1">{stats.totalUsers}</h3>
              <div className="text-muted small">{t('admin.totalUsers')}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} xs={12} className="mb-3">
          <Card className="border-0 shadow-sm rounded-4 h-100 hover-lift text-center" style={{
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)'
          }}>
            <Card.Body className="p-4">
              <div className="fs-2">💼</div>
              <h3 className="fw-bold text-success mb-1">{stats.totalJobs}</h3>
              <div className="text-muted small">{t('admin.totalJobs')}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} xs={12} className="mb-3">
          <Card className="border-0 shadow-sm rounded-4 h-100 hover-lift text-center" style={{
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)'
          }}>
            <Card.Body className="p-4">
              <div className="fs-2">⏳</div>
              <h3 className="fw-bold text-warning mb-1">{stats.openJobs || 0}</h3>
              <div className="text-muted small">Open Jobs</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} xs={12} className="mb-3">
          <Card className="border-0 shadow-sm rounded-4 h-100 hover-lift text-center" style={{
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            background: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)'
          }}>
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div className="fs-2">💰</div>
                <Badge bg="danger" className="rounded-pill">Revenue</Badge>
              </div>
              <h3 className="fw-bold text-danger mb-1">₹{stats.platformRevenue || 0}</h3>
              <div className="text-muted small">{t('admin.platformRevenue')}</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tabs for different sections */}
      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'users')} className="mb-3">
        {/* All Users Tab */}
        <Tab eventKey="users" title={`${t('admin.allUsers')} (${users.length})`}>
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body>
              <Table responsive hover className="align-middle">
                <thead>
                  <tr>
                    <th>{t('common.name')}</th>
                    <th>{t('common.email')}</th>
                    <th>{t('common.phone')}</th>
                    <th>{t('common.type')}</th>
                    <th>{t('admin.verified')}</th>
                    <th>{t('admin.registered')}</th>
                    <th>{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.phone}</td>
                      <td>
                        <Badge bg={user.userType === 'worker' ? 'info' : 'warning'}>
                          {user.userType}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg={user.isVerified ? 'success' : 'danger'}>
                          {user.isVerified ? t('admin.verified') : t('admin.notVerified')}
                        </Badge>
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        {user.userType !== 'admin' && (
                          <Button
                            size="sm"
                            variant="outline-info"
                            as={Link}
                            to={`/messages/${user._id}`}
                            className="me-2"
                          >
                            Chat
                          </Button>
                        )}
                        {!user.isVerified ? (
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleVerifyUser(user._id, true)}
                            className="me-2"
                          >
                            {t('admin.verify')}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="warning"
                            onClick={() => handleVerifyUser(user._id, false)}
                            className="me-2"
                          >
                            {t('admin.unverify')}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDeleteUser(user._id)}
                        >
                          {t('common.delete')}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>

        {/* Workers Tab */}
        <Tab eventKey="workers" title={`${t('admin.workers')} (${workers.length})`}>
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body>
              <Table responsive hover className="align-middle">
                <thead>
                  <tr>
                    <th>{t('common.name')}</th>
                    <th>{t('common.email')}</th>
                    <th>{t('admin.skills')}</th>
                    <th>{t('admin.experience')}</th>
                    <th>{t('admin.jobsCompleted')}</th>
                    <th>{t('admin.rating')}</th>
                    <th>{t('common.status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {workers.map((worker) => (
                    <tr key={worker._id}>
                      <td>{worker.userId?.name}</td>
                      <td>{worker.userId?.email}</td>
                      <td>
                        {worker.skills?.map((skill, i) => (
                          <Badge key={i} bg="primary" className="me-1">
                            {skill.replace('_', ' ')}
                          </Badge>
                        ))}
                      </td>
                      <td>{worker.experience} years</td>
                      <td>{worker.totalJobsCompleted}</td>
                      <td>{worker.averageRating?.toFixed(1) || 'N/A'} ⭐</td>
                      <td>
                        <Badge bg={worker.isActive ? 'success' : 'danger'}>
                          {worker.isActive ? t('common.active') : t('common.inactive')}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>

        {/* Employers Tab */}
        <Tab eventKey="employers" title={`${t('admin.employers')} (${employers.length})`}>
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body>
              <Table responsive hover className="align-middle">
                <thead>
                  <tr>
                    <th>{t('common.name')}</th>
                    <th>{t('admin.company')}</th>
                    <th>{t('common.email')}</th>
                    <th>{t('common.type')}</th>
                    <th>{t('admin.workersHired')}</th>
                    <th>{t('admin.verified')}</th>
                  </tr>
                </thead>
                <tbody>
                  {employers.map((employer) => (
                    <tr key={employer._id}>
                      <td>{employer.userId?.name}</td>
                      <td>{employer.companyName || 'N/A'}</td>
                      <td>{employer.userId?.email}</td>
                      <td>{employer.companyType || 'N/A'}</td>
                      <td>{employer.workersHired}</td>
                      <td>
                        <Badge bg={employer.isVerified ? 'success' : 'danger'}>
                          {employer.isVerified ? t('admin.verified') : t('admin.notVerified')}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>

        {/* Jobs Tab */}
        <Tab eventKey="jobs" title={`${t('common.jobs')} (${jobs.length})`}>
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body>
              <Table responsive hover className="align-middle">
                <thead>
                  <tr>
                    <th>{t('common.title')}</th>
                    <th>{t('admin.employer')}</th>
                    <th>{t('common.type')}</th>
                    <th>{t('common.location')}</th>
                    <th>{t('common.salary')}</th>
                    <th>{t('common.status')}</th>
                    <th>{t('admin.posted')}</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedJobs.map((job) => (
                    <React.Fragment key={job._id}>
                      <tr>
                        <td>{job.title}</td>
                        <td>{job.employerId?.userId?.name || 'N/A'}</td>
                        <td>{job.workType?.replace('_', ' ')}</td>
                        <td>{job.location?.district}</td>
                        <td>₹{job.salary?.amount}/{job.salary?.period}</td>
                        <td>
                          <Badge bg={job.jobStatus === 'open' ? 'success' : 'secondary'}>
                            {t(`common.${job.jobStatus}`)}
                          </Badge>
                          <div className="mt-2">
                            <Card className="mb-2 border-info">
                              <Card.Body className="p-2">
                                <span className="fw-semibold">{job.autoPaymentStatus === 'completed' ? '✅ Payment Completed' : job.autoPaymentStatus === 'pending' ? '⏳ Payment Pending' : job.autoPaymentStatus || 'N/A'}</span>
                              </Card.Body>
                            </Card>
                            {job.autoPaymentStatus === 'completed' && (
                              <JobTestimonial jobId={job._id} />
                            )}
                          </div>
                        </td>
                        <td>{new Date(job.createdAt).toLocaleDateString()}</td>
                      </tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </Table>
              {/* Pagination Controls */}
              {totalJobsPages > 1 && (
                <div className="d-flex justify-content-center align-items-center mt-3">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="me-2"
                    disabled={jobsPage === 1}
                    onClick={() => setJobsPage(jobsPage - 1)}
                  >
                    Previous
                  </Button>
                  <span className="mx-2">Page {jobsPage} of {totalJobsPages}</span>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="ms-2"
                    disabled={jobsPage === totalJobsPages}
                    onClick={() => setJobsPage(jobsPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Tab>

        {/* Applications Tab */}
        <Tab eventKey="applications" title={`${t('common.applications')} (${applications.length})`}>
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body>
              <Table responsive hover className="align-middle">
                <thead>
                  <tr>
                    <th>{t('admin.worker')}</th>
                    <th>{t('common.job')}</th>
                    <th>{t('admin.employer')}</th>
                    <th>Work Duration</th>
                    <th>{t('common.status')}</th>
                    <th>Progress</th>
                    <th>Payment Status</th>
                    <th>Latest Update</th>
                    <th>{t('admin.appliedOn')}</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app._id}>
                      <td>{app.workerId?.userId?.name || 'N/A'}</td>
                      <td>{app.jobId?.title || 'N/A'}</td>
                      <td>{app.employerId?.userId?.name || 'N/A'}</td>
                      <td>
                        <div className="small">
                          {(app.jobId?.startDate && app.jobId?.endDate)
                            ? `${new Date(app.jobId.startDate).toLocaleDateString('en-IN')} - ${new Date(app.jobId.endDate).toLocaleDateString('en-IN')}`
                            : 'Not set'}
                        </div>
                      </td>
                      <td>
                        <Badge
                          bg={
                            app.status === 'accepted' ? 'success' :
                            app.status === 'rejected' ? 'danger' :
                            app.status === 'completed' ? 'info' : 'primary'
                          }
                        >
                          {app.status}
                        </Badge>
                      </td>
                      <td>
                        {(() => {
                          const updates = app.progressUpdates || [];
                          if (!updates.length) return '0%';
                          const latest = updates[updates.length - 1];
                          return `${latest.progressPercent || 0}%`;
                        })()}
                      </td>
                      <td style={{ minWidth: 180 }}>
                        <div className="small fw-semibold">{formatPaymentStatus(app.latestPayment?.status)}</div>
                        {app.latestPayment?.updatedAt && (
                          <div className="small text-muted">{new Date(app.latestPayment.updatedAt).toLocaleString('en-IN')}</div>
                        )}
                      </td>
                      <td style={{ minWidth: 220 }}>
                        {(() => {
                          const latest = getLatestProgressUpdate(app);
                          if (!latest) return <span className="text-muted small">No update yet</span>;

                          return (
                            <div className="small">
                              <div className="fw-semibold">{latest.note || 'Progress updated'}</div>
                              <div className="text-muted">
                                {formatUpdatedBy(latest.updatedBy)} • {new Date(latest.updatedAt).toLocaleString('en-IN')}
                              </div>
                            </div>
                          );
                        })()}
                      </td>
                      <td>{new Date(app.applicationDate).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>

        {/* Payments Tab */}
        <Tab eventKey="payments" title={`${t('common.payments')} (${payments.length})`}>
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body>
              <Table responsive hover className="align-middle">
                <thead>
                  <tr>
                    <th>{t('admin.worker')}</th>
                    <th>{t('admin.employer')}</th>
                    <th>Gross Amount</th>
                    <th>{t('admin.platformFee')}</th>
                    <th>Net to Worker</th>
                    <th>{t('common.status')}</th>
                    <th>{t('common.date')}</th>
                    <th>{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment._id}>
                      <td>{payment.workerId?.userId?.name || 'N/A'}</td>
                      <td>{payment.employerId?.userId?.name || 'N/A'}</td>
                      <td>₹{payment.amount}</td>
                      <td>₹{payment.platformFee || 0}</td>
                      <td>₹{payment.netAmount || 0}</td>
                      <td>
                        <Badge bg={payment.status === 'completed' ? 'success' : payment.status === 'pending' ? 'warning' : 'info'}>
                          {payment.status}
                        </Badge>
                      </td>
                      <td>{new Date(payment.createdAt).toLocaleDateString()}</td>
                      <td>
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => handleReleasePaymentToWorker(payment._id)}
                          disabled={payment.status !== 'pending' || releasingPaymentId === payment._id}
                        >
                          {releasingPaymentId === payment._id ? 'Releasing...' : payment.status === 'pending' ? 'Release to Worker' : 'Done'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>

        {/* Assignment Tab */}
        <Tab eventKey="assignment" title={`Worker Assignment (${assignmentJobs.length})`}>
          <Card className="border-0 shadow-sm rounded-4 mb-4">
            <Card.Body>
              <div className="alert alert-primary small">
                <strong>Admin Assignment Steps:</strong> 1) Get Matches करें 2) Select workers करें 3) Assign Selected दबाएँ.
                अगर जल्दी assign करना है तो <strong>Auto Assign</strong> use करें.
              </div>
              <h5 className="mb-3">Job wise worker requirement & assignment</h5>
              <Table responsive hover className="align-middle">
                <thead>
                  <tr>
                    <th>Job</th>
                    <th>Employer</th>
                    <th>Location / Address</th>
                    <th>Contact</th>
                    <th>Required</th>
                    <th>Assigned</th>
                    <th>Need More</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assignmentJobs.map((job) => (
                    <tr key={job._id}>
                      <td>
                        <div className="fw-semibold">{job.title}</div>
                        <small className="text-muted">{job.workType?.replace('_', ' ')}</small>
                      </td>
                      <td>
                        {job.employerId?.companyName || job.employerId?.userId?.name || 'N/A'}
                        <div className="small text-muted">{job.employerId?.userId?.phone || ''}</div>
                      </td>
                      <td>
                        <div className="small">{job.location?.district || '-'}, {job.location?.state || '-'}</div>
                        <div className="small text-muted">{job.location?.address || job.jobProviderContact?.address || '-'}</div>
                      </td>
                      <td>{job.jobProviderContact?.phone || job.employerId?.userId?.phone || '-'}</td>
                      <td>{job.requiredWorkers}</td>
                      <td>{job.assignedWorkers}</td>
                      <td>
                        <Badge bg={((Number(job.numberOfPositions) || 0) - (Number(job.assignedWorkers) || 0)) > 0 ? 'warning' : 'success'}>
                          {Math.max(0, (Number(job.numberOfPositions) || 0) - (Number(job.assignedWorkers) || 0))}
                        </Badge>
                      </td>
                      <td>
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() => handleLoadSuggestions(job._id)}
                          disabled={loadingSuggestionsByJob[job._id] || ((Number(job.numberOfPositions) || 0) - (Number(job.assignedWorkers) || 0)) === 0}
                          className="me-2"
                        >
                          {loadingSuggestionsByJob[job._id] ? 'Loading...' : '1) Get Matches'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-success"
                          onClick={() => handleAutoMatchAndAssign(job)}
                          disabled={assigningJobId === job._id || ((Number(job.numberOfPositions) || 0) - (Number(job.assignedWorkers) || 0)) === 0}
                          className="me-2"
                        >
                          {assigningJobId === job._id ? 'Auto Assigning...' : `Auto Assign ${Math.max(0, (Number(job.numberOfPositions) || 0) - (Number(job.assignedWorkers) || 0))} Workers`}
                        </Button>
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => handleAssignWorkers(job)}
                          disabled={assigningJobId === job._id || ((Number(job.numberOfPositions) || 0) - (Number(job.assignedWorkers) || 0)) === 0}
                        >
                          {assigningJobId === job._id ? 'Assigning...' : `3) Assign Selected (max ${Math.max(0, (Number(job.numberOfPositions) || 0) - (Number(job.assignedWorkers) || 0))})`}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {assignmentJobs.map((job) => {
                const suggestions = suggestionsByJob[job._id] || [];
                if (!suggestions.length) return null;

                const selected = selectedWorkersByJob[job._id] || [];
                const maxAllowed = Number(job.numberOfPositions) || 0;

                return (
                  <Card key={`${job._id}-suggestions`} className="mb-3 border bg-light-subtle">
                    <Card.Body>
                      <h6 className="mb-2">Suggested workers for: {job.title}</h6>
                      <div className="small text-muted mb-2">
                        2) Select up to <b>{maxAllowed}</b> worker(s). Selected: <b>{selected.length}</b>
                      </div>
                      <Row className="g-3">
                        {suggestions.map((worker) => {
                          const isSelected = selected.includes(worker._id);
                          const isDisabled = !isSelected && selected.length >= maxAllowed;
                          const user = worker.userId || {};
                          return (
                            <Col xs={12} md={6} lg={4} key={worker._id}>
                              <Card className={`h-100 shadow-sm border-2 ${isSelected ? 'border-success' : ''}`}
                                style={{ position: 'relative', background: isSelected ? '#e6ffed' : '#fff' }}>
                                <Card.Body>
                                  <div className="d-flex align-items-center mb-2">
                                    <div className="me-3">
                                      <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#e0e7ef', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                                        {user.name ? user.name.charAt(0).toUpperCase() : 'W'}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="fw-bold fs-5 mb-0">{user.name || 'Worker'}</div>
                                      <div className="small text-muted">{user.phone ? `📞 ${user.phone}` : ''}</div>
                                    </div>
                                  </div>
                                  <div className="mb-2">
                                    <span className="badge bg-primary me-1">Rating: {worker.averageRating?.toFixed?.(1) || '0'} ⭐</span>
                                    <span className="badge bg-info me-1">Exp: {worker.experience || 0}y</span>
                                    {worker.skills?.length > 0 && (
                                      <span className="badge bg-secondary">{worker.skills.map((s) => s.replace('_', ' ')).join(', ')}</span>
                                    )}
                                  </div>
                                  <div className="mb-2">
                                    <div className="small text-muted">
                                      {(() => {
                                        const addr = user.address || worker.address;
                                        if (!addr) return '-';
                                        if (typeof addr === 'string') return addr;
                                        if (typeof addr === 'object') {
                                          // Format address object
                                          const { village, district, state, pincode } = addr;
                                          return [village, district, state, pincode].filter(Boolean).join(', ');
                                        }
                                        return '-';
                                      })()}
                                    </div>
                                  </div>
                                  <div className="d-flex gap-2 mb-2">
                                    <Button
                                      as={Link}
                                      to={`/messages/${user._id}`}
                                      size="sm"
                                      variant="outline-success"
                                      className="d-flex align-items-center"
                                    >
                                      <span className="me-1">💬</span> Chat
                                    </Button>
                                    {user.phone && (
                                      <Button
                                        size="sm"
                                        variant="outline-primary"
                                        href={`tel:${user.phone}`}
                                        className="d-flex align-items-center"
                                      >
                                        <span className="me-1">📞</span> Call
                                      </Button>
                                    )}
                                  </div>
                                  <Form.Check
                                    type="checkbox"
                                    id={`${job._id}-${worker._id}`}
                                    label={<span className="fw-semibold">Select for assignment</span>}
                                    checked={isSelected}
                                    disabled={isDisabled}
                                    onChange={() => toggleWorkerSelection(job._id, worker._id)}
                                  />
                                  {isSelected && (
                                    <span className="badge bg-success position-absolute top-0 end-0 m-2">Selected</span>
                                  )}
                                </Card.Body>
                              </Card>
                            </Col>
                          );
                        })}
                      </Row>
                    </Card.Body>
                  </Card>
                );
              })}
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body>
              <h5 className="mb-3">Coordination groups & payment status</h5>
              <Table responsive hover className="align-middle">
                <thead>
                  <tr>
                    <th>Job</th>
                    <th>Employer</th>
                    <th>Workers</th>
                    <th>Work (Auto)</th>
                    <th>Payment (Auto)</th>
                    <th>Payment Split</th>
                    <th>Progress Timeline</th>
                  </tr>
                </thead>
                <tbody>
                  {assignmentGroups.map((group) => (
                    <tr key={group._id}>
                      <td>
                        {group.jobId?.title || 'N/A'}
                        <div className="small text-muted">
                          {group.jobId?.startDate && group.jobId?.endDate
                            ? `${new Date(group.jobId.startDate).toLocaleDateString('en-IN')} - ${new Date(group.jobId.endDate).toLocaleDateString('en-IN')}`
                            : 'Duration not set'}
                        </div>
                      </td>
                      <td>{group.employerId?.userId?.name || group.employerId?.companyName || 'N/A'}</td>
                      <td>
                        {(group.assignedWorkerIds || []).length}/{group.requiredWorkers}
                        <div className="small text-muted">
                          {(group.assignedWorkerIds || []).map((w) => w.userId?.name).filter(Boolean).join(', ')}
                        </div>
                      </td>
                      <td>
                        <Badge bg={group.autoWorkStatus === 'completed' ? 'success' : group.autoWorkStatus === 'ongoing' ? 'info' : 'secondary'}>
                          {group.autoWorkStatus || 'pending'}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg={group.autoPaymentStatus === 'distributed_to_workers' ? 'success' : group.autoPaymentStatus === 'received_on_platform' ? 'primary' : group.autoPaymentStatus === 'awaiting_employer_payment' ? 'warning' : 'secondary'}>
                          {group.autoPaymentStatus || 'not_due'}
                        </Badge>
                      </td>
                      <td style={{ minWidth: 170 }}>
                        <div className="small">Platform Fee (Auto): <strong>₹20</strong></div>
                        <div className="small">Gross/Worker: <strong>₹{group.paymentPerWorker || 0}</strong></div>
                        <div className="small">Net/Worker: <strong>₹{Math.max(0, Number(group.paymentPerWorker || 0) - 20)}</strong></div>
                      </td>
                      <td style={{ minWidth: 260 }}>
                        <div className="mb-2 d-flex flex-wrap gap-2">
                          <Button size="sm" variant="outline-primary" onClick={() => openGroupChat(group.jobId?._id)}>
                            Group Chat
                          </Button>
                          {group.employerId?.userId?._id && (
                            <Button as={Link} size="sm" variant="outline-info" to={`/messages/${group.employerId.userId._id}`}>
                              Private Msg Employer
                            </Button>
                          )}
                          {group.employerId?.userId?.phone && (
                            <Button size="sm" variant="outline-success" href={`tel:${group.employerId.userId.phone}`}>
                              Call Employer
                            </Button>
                          )}
                        </div>
                        {!(group.recentUpdates || []).length ? (
                          <div className="small text-muted">No timeline updates yet</div>
                        ) : (
                          (group.recentUpdates || []).slice(0, 3).map((update, idx) => (
                            <div key={`${group._id}-timeline-${idx}`} className="d-flex align-items-start mb-2">
                              <div className="me-2 mt-1" style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#0d6efd' }} />
                              <div className="small">
                                <div className="fw-semibold">{update.progressPercent || 0}% • {update.note || 'Progress updated'}</div>
                                <div className="text-muted">{(update.updatedBy || 'system').toUpperCase()} • {new Date(update.updatedAt).toLocaleString('en-IN')}</div>
                              </div>
                            </div>
                          ))
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="messages" title={`Messages (${adminChats.length})${unreadMessages > 0 ? ` • ${unreadMessages} new` : ''}`}>
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body>
              <div className="d-flex flex-wrap gap-2 mb-3">
                <Button
                  size="sm"
                  variant={messageRoleFilter === 'all' ? 'primary' : 'outline-primary'}
                  onClick={() => setMessageRoleFilter('all')}
                >
                  All
                </Button>
                <Button
                  size="sm"
                  variant={messageRoleFilter === 'worker' ? 'info' : 'outline-info'}
                  onClick={() => setMessageRoleFilter('worker')}
                >
                  Workers
                </Button>
                <Button
                  size="sm"
                  variant={messageRoleFilter === 'employer' ? 'warning' : 'outline-warning'}
                  onClick={() => setMessageRoleFilter('employer')}
                >
                  Employers
                </Button>
                <Button
                  size="sm"
                  variant={messageRoleFilter === 'group' ? 'success' : 'outline-success'}
                  onClick={() => setMessageRoleFilter('group')}
                >
                  Groups
                </Button>
              </div>

              <Table responsive hover className="align-middle">
                <thead>
                  <tr>
                    <th>Name / Group</th>
                    <th>Role</th>
                    <th>Last Message</th>
                    <th>Last Time</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {!filteredAdminChats.length ? (
                    <tr>
                      <td colSpan={5} className="text-center text-muted py-4">
                        No messages in this tab.
                      </td>
                    </tr>
                  ) : (
                    filteredAdminChats.map((chat) => {
                      const other = getChatOtherUser(chat);
                      let role = 'user';
                      if (chat.chatType === 'group') role = 'group';
                      else if (other?.userType) role = other.userType;
                      else if (chat.workerId?.userType) role = chat.workerId.userType;
                      else if (chat.employerId?.userType) role = chat.employerId.userType;
                      let displayName = 'User';
                      if (chat.chatType === 'group') displayName = chat.groupName || chat.jobId?.title || 'Support Group';
                      else if (other?.name) displayName = other.name;
                      else if (chat.workerId?.name) displayName = chat.workerId.name;
                      else if (chat.employerId?.name) displayName = chat.employerId.name;

                      return (
                        <tr key={chat._id}>
                          <td>
                            <div className="fw-semibold">{displayName}</div>
                            {chat.chatType === 'group' && chat.jobId?.title && (
                              <div className="small text-muted">Job: {chat.jobId.title}</div>
                            )}
                            {chat.chatType !== 'group' && (!other?.name && (chat.workerId?.name || chat.employerId?.name)) && (
                              <div className="small text-muted">{chat.workerId?.name || chat.employerId?.name}</div>
                            )}
                          </td>
                          <td>
                            <Badge bg={role === 'worker' ? 'info' : role === 'employer' ? 'warning' : role === 'group' ? 'success' : 'secondary'}>
                              {role.charAt(0).toUpperCase() + role.slice(1)}
                            </Badge>
                          </td>
                          <td>{chat.lastMessage || 'No message yet'}</td>
                          <td>{chat.lastMessageTime ? new Date(chat.lastMessageTime).toLocaleString('en-IN') : '-'}</td>
                          <td>
                            {chat.chatType === 'group' ? (
                              <Button as={Link} size="sm" variant="outline-success" to={`/messages/group/${chat._id}`}>
                                Open Group
                              </Button>
                            ) : (
                              <Button
                                as={Link}
                                size="sm"
                                variant="outline-primary"
                                to={`/messages/${other?._id || chat.workerId?._id || chat.employerId?._id || ''}`}
                                disabled={!(other?._id || chat.workerId?._id || chat.employerId?._id)}
                              >
                                Open Chat
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default AdminDashboard;
