import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Tabs, Tab } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { paymentAPI, workerAPI, employerAPI } from '../services/api';

const PaymentTracking = () => {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({
    totalEarned: 0,
    totalAdvanceReceived: 0,
    totalFinalReceived: 0,
    pendingPayments: 0,
    completedPayments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchPaymentData();
  }, []);

  const fetchPaymentData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      setUserType(user.userType);

      let paymentsRes;
      if (user.userType === 'worker') {
        paymentsRes = await paymentAPI.getWorkerPayments();
      } else if (user.userType === 'employer') {
        paymentsRes = await paymentAPI.getEmployerPayments();
      }

      const paymentsData = paymentsRes?.data?.payments || [];
      setPayments(paymentsData);

      // Calculate stats
      const totalEarned = paymentsData
        .filter((p) => p.status === 'completed')
        .reduce((sum, p) => sum + (p.netAmount || 0), 0);

      const totalAdvance = paymentsData
        .filter((p) => p.paymentType === 'advance')
        .reduce((sum, p) => sum + (p.netAmount || 0), 0);

      const totalFinal = paymentsData
        .filter((p) => p.paymentType === 'final')
        .reduce((sum, p) => sum + (p.netAmount || 0), 0);

      const pending = paymentsData.filter((p) => p.status !== 'completed').length;
      const completed = paymentsData.filter((p) => p.status === 'completed').length;

      setStats({
        totalEarned,
        totalAdvanceReceived: totalAdvance,
        totalFinalReceived: totalFinal,
        pendingPayments: pending,
        completedPayments: completed,
      });
    } catch (error) {
      toast.error('Error loading payments');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredPayments = () => {
    switch (activeTab) {
      case 'advance':
        return payments.filter((p) => p.paymentType === 'advance');
      case 'final':
        return payments.filter((p) => p.paymentType === 'final');
      case 'completed':
        return payments.filter((p) => p.status === 'completed');
      case 'pending':
        return payments.filter((p) => p.status !== 'completed');
      default:
        return payments;
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: 'warning',
      advance_paid: 'info',
      completed: 'success',
    };
    return (
      <Badge bg={statusMap[status] || 'secondary'}>
        {status?.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Container className="my-5 text-center">
        <div className="spinner-border text-primary" role="status" />
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4">💳 Payment Tracking</h2>

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="shadow-sm">
            <Card.Body className="text-center">
              <h4 className="text-success">₹{stats.totalEarned.toLocaleString()}</h4>
              <p className="text-muted small mb-0">Total Completed</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="shadow-sm">
            <Card.Body className="text-center">
              <h4 className="text-info">₹{stats.totalAdvanceReceived.toLocaleString()}</h4>
              <p className="text-muted small mb-0">Advance Payments</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="shadow-sm">
            <Card.Body className="text-center">
              <h4 className="text-primary">₹{stats.totalFinalReceived.toLocaleString()}</h4>
              <p className="text-muted small mb-0">Final Payments</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="shadow-sm">
            <Card.Body className="text-center">
              <h4 className="text-warning">{stats.pendingPayments}</h4>
              <p className="text-muted small mb-0">Pending</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Payment History */}
      <Card className="shadow-sm">
        <Card.Header className="bg-light">
          <h5 className="mb-0">💰 Payment History</h5>
        </Card.Header>
        <Card.Body>
          {/* Tabs */}
          <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4">
            <Tab eventKey="all" title={`All (${payments.length})`} />
            <Tab eventKey="advance" title={`Advance (${payments.filter((p) => p.paymentType === 'advance').length})`} />
            <Tab eventKey="final" title={`Final (${payments.filter((p) => p.paymentType === 'final').length})`} />
            <Tab eventKey="completed" title={`Completed (${stats.completedPayments})`} />
            <Tab eventKey="pending" title={`Pending (${stats.pendingPayments})`} />
          </Tabs>

          {getFilteredPayments().length === 0 ? (
            <p className="text-muted text-center py-5">No payments found</p>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Platform Fee</th>
                  <th>Net Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredPayments().map((payment) => (
                  <tr key={payment._id}>
                    <td>{new Date(payment.createdAt).toLocaleDateString()}</td>
                    <td>
                      <Badge bg={payment.paymentType === 'advance' ? 'info' : 'primary'}>
                        {payment.paymentType?.toUpperCase()}
                      </Badge>
                    </td>
                    <td>
                      <strong>₹{payment.amount?.toLocaleString()}</strong>
                    </td>
                    <td>
                      <span className="text-danger">-₹{(payment.platformFee || 0).toLocaleString()}</span>
                    </td>
                    <td>
                      <strong className="text-success">₹{(payment.netAmount || 0).toLocaleString()}</strong>
                    </td>
                    <td>
                      <small>{payment.paymentMethod?.toUpperCase()}</small>
                    </td>
                    <td>{getStatusBadge(payment.status)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Fee Breakdown */}
      <Card className="shadow-sm mt-4">
        <Card.Header className="bg-light">
          <h5 className="mb-0">📊 Fee Breakdown</h5>
        </Card.Header>
        <Card.Body>
          <div className="row">
            <div className="col-md-6">
              <p className="mb-2">
                <strong>Total Payments:</strong> ₹
                {payments
                  .filter((p) => p.status === 'completed')
                  .reduce((sum, p) => sum + (p.amount || 0), 0)
                  .toLocaleString()}
              </p>
              <p className="mb-2">
                <strong>Total Platform Fee (5%):</strong>
                <span className="text-danger ms-2">
                  -₹
                  {payments
                    .filter((p) => p.status === 'completed')
                    .reduce((sum, p) => sum + (p.platformFee || 0), 0)
                    .toLocaleString()}
                </span>
              </p>
            </div>
            <div className="col-md-6">
              <p className="mb-2 text-success">
                <strong>Total Received: ₹{stats.totalEarned.toLocaleString()}</strong>
              </p>
              <p className="small text-muted">
                Platform fee helps maintain secure payment infrastructure & 24/7 support
              </p>
            </div>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PaymentTracking;
