import React, { useEffect, useState } from 'react';
import { Container, Card, Table, Badge, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { paymentAPI } from '../services/api';
import { applicationAPI } from '../services/api';

const WorkerPayments = () => {
  const [payments, setPayments] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [loading, setLoading] = useState(true);

  const totalPlatformFee = payments
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + (p.platformFee || 0), 0);

  const totalGrossAmount = payments
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await paymentAPI.getWorkerPayments();
      setPayments(res.data.payments || []);
      setTotalEarnings(res.data.totalEarnings || 0);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to load earnings information');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async (applicationId) => {
    if (!window.confirm('Have you completed this job?')) return;

    try {
      await applicationAPI.markAsCompleted(applicationId);
      toast.success('Job marked complete successfully');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark job complete');
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
    <div style={{ background: '#f6f7f9', minHeight: '100vh', padding: '32px 0' }}>
      <Container>
        <h2 className="fw-bold mb-4" style={{ color: '#0ea5e9', letterSpacing: 0.5 }}>My Earnings</h2>
        <Card className="mb-4" style={{ border: 'none', borderRadius: 16, boxShadow: '0 2px 12px #bae6fd33', background: '#e0f2fe' }}>
          <Card.Body className="d-flex flex-column flex-md-row align-items-center gap-4 p-4">
            <div style={{ flex: 1 }}>
              <div className="fw-bold" style={{ fontSize: 22, color: '#0369a1' }}>Total Amount Received</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#0ea5e9' }}>₹{totalEarnings}</div>
              <div className="small text-muted mt-2">
                Gross Paid: <span style={{ color: '#222', fontWeight: 600 }}>₹{totalGrossAmount}</span> &nbsp;•&nbsp; Platform Fee (₹20/payment): <span style={{ color: '#eab308', fontWeight: 600 }}>₹{totalPlatformFee}</span> &nbsp;•&nbsp; Net to Worker: <span style={{ color: '#059669', fontWeight: 600 }}>₹{totalEarnings}</span>
              </div>
            </div>
          </Card.Body>
        </Card>
        <Card style={{ border: 'none', borderRadius: 16, boxShadow: '0 2px 12px #d1d5db33', background: '#fff' }}>
          <Card.Body>
            <div className="fw-semibold mb-3" style={{ color: '#0ea5e9', fontSize: 18 }}>Payment History</div>
            {payments.length === 0 ? (
              <p className="text-muted mb-0">No payments received yet.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-sm align-middle mb-0" style={{ fontSize: 16 }}>
                  <thead style={{ background: '#f1f5f9' }}>
                    <tr>
                      <th>Job</th>
                      <th>Gross Amount</th>
                      <th>Platform Fee</th>
                      <th>Net to Worker</th>
                      <th>Method</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment._id}>
                        <td>{payment.applicationId?.jobId?.title || 'Job'}</td>
                        <td>₹{payment.amount}</td>
                        <td>₹{payment.platformFee || 0}</td>
                        <td>₹{payment.netAmount || 0}</td>
                        <td>{payment.paymentMethod?.replace('_', ' ') || 'Not available'}</td>
                        <td>
                          <Badge bg={payment.status === 'completed' ? 'success' : payment.status === 'pending' ? 'warning' : 'info'}>
                            {payment.status === 'completed'
                              ? 'Received'
                              : payment.status === 'pending'
                              ? 'Release Pending'
                              : 'In Process'}
                          </Badge>
                        </td>
                        <td>{new Date(payment.createdAt).toLocaleDateString()}</td>
                        <td>
                          {payment.applicationId?.status === 'accepted' ? (
                            <Button
                              size="sm"
                              variant="success"
                              onClick={() => handleMarkComplete(payment.applicationId?._id)}
                            >
                              Mark Complete
                            </Button>
                          ) : payment.applicationId?.status === 'completed' ? (
                            <span className="text-success small">Completed</span>
                          ) : (
                            <span className="text-muted small">N/A</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default WorkerPayments;
