import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Tabs, Tab, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useLanguage } from '../hooks/useLanguage';

const API_URL = process.env.REACT_APP_API_URL;

const AdminDashboard = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [employers, setEmployers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [releasingPaymentId, setReleasingPaymentId] = useState(null);

  const getAuthHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, usersRes, workersRes, employersRes, jobsRes, appsRes, paymentsRes] = await Promise.all([
        axios.get(`${API_URL}/admin/stats`, { headers: getAuthHeader() }),
        axios.get(`${API_URL}/admin/users`, { headers: getAuthHeader() }),
        axios.get(`${API_URL}/admin/workers`, { headers: getAuthHeader() }),
        axios.get(`${API_URL}/admin/employers`, { headers: getAuthHeader() }),
        axios.get(`${API_URL}/admin/jobs`, { headers: getAuthHeader() }),
        axios.get(`${API_URL}/admin/applications`, { headers: getAuthHeader() }),
        axios.get(`${API_URL}/admin/payments`, { headers: getAuthHeader() }),
      ]);

      setStats(statsRes.data.stats);
      setUsers(usersRes.data.users);
      setWorkers(workersRes.data.workers);
      setEmployers(employersRes.data.employers);
      setJobs(jobsRes.data.jobs);
      setApplications(appsRes.data.applications);
      setPayments(paymentsRes.data.payments);
    } catch (error) {
      toast.error(t('common.errorOccurred'));
    } finally {
      setLoading(false);
    }
  };

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

  const handleApproveJob = async (jobId, isApproved) => {
    try {
      await axios.put(
        `${API_URL}/admin/jobs/${jobId}/approve`,
        { isApproved },
        { headers: getAuthHeader() }
      );
      toast.success(t(isApproved ? 'admin.jobApprovedSuccess' : 'admin.jobUnapprovedSuccess'));
      fetchDashboardData();
    } catch (error) {
      toast.error(t('admin.jobApprovalError'));
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

  if (loading) {
    return (
      <Container className="my-5 text-center">
        <div className="spinner-border text-primary" role="status" />
      </Container>
    );
  }

  return (
    <Container className="my-4 my-md-5">
      <Card className="border-0 shadow-sm rounded-4 mb-4 bg-dark text-white">
        <Card.Body className="p-4">
          <h2 className="mb-1">🔐 {t('admin.title')}</h2>
          <p className="mb-0 text-white-50">Monitor users, jobs, applications, and payments from one place.</p>
        </Card.Body>
      </Card>

      {/* Stats Cards */}
      <Row className="g-3 mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body>
              <div className="text-muted small">{t('admin.totalUsers')}</div>
              <h3 className="mb-0">{stats.totalUsers}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body>
              <div className="text-muted small">{t('admin.totalJobs')}</div>
              <h3 className="mb-0">{stats.totalJobs}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body>
              <div className="text-muted small">{t('admin.pendingJobs')}</div>
              <h3 className="mb-0">{stats.pendingJobs || 0}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body>
              <div className="text-muted small">{t('admin.platformRevenue')}</div>
              <h3 className="mb-0">₹{stats.platformRevenue || 0}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tabs for different sections */}
      <Tabs defaultActiveKey="users" className="mb-3">
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
                    <th>{t('admin.approval')}</th>
                    <th>{t('admin.posted')}</th>
                    <th>{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job._id}>
                      <td>{job.title}</td>
                      <td>{job.employerId?.userId?.name || 'N/A'}</td>
                      <td>{job.workType?.replace('_', ' ')}</td>
                      <td>{job.location?.district}</td>
                      <td>₹{job.salary?.amount}/{job.salary?.period}</td>
                      <td>
                        <Badge bg={job.jobStatus === 'open' ? 'success' : 'secondary'}>
                          {t(`common.${job.jobStatus}`)}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg={job.isApproved ? 'success' : 'warning'}>
                          {job.isApproved ? t('admin.approved') : t('admin.pending')}
                        </Badge>
                      </td>
                      <td>{new Date(job.createdAt).toLocaleDateString()}</td>
                      <td>
                        {!job.isApproved ? (
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleApproveJob(job._id, true)}
                          >
                            {t('admin.approve')}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline-warning"
                            onClick={() => handleApproveJob(job._id, false)}
                          >
                            {t('admin.unapprove')}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
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
                    <th>{t('common.status')}</th>
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
                    <th>{t('admin.amount')}</th>
                    <th>{t('admin.platformFee')}</th>
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
      </Tabs>
    </Container>
  );
};

export default AdminDashboard;
