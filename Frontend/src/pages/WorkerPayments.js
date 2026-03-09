import React, { useEffect, useState } from 'react';
import { Container, Card, Table, Badge, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { paymentAPI } from '../services/api';
import { applicationAPI } from '../services/api';

const WorkerPayments = () => {
  const [payments, setPayments] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [loading, setLoading] = useState(true);

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
    <Container className="my-5">
      <h2 className="mb-4">My Earnings</h2>

      <Card className="mb-4">
        <Card.Body>
          <h4 className="mb-0">Total Amount Received: ₹{totalEarnings}</h4>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          {payments.length === 0 ? (
            <p className="text-muted mb-0">No payments received yet.</p>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Job</th>
                  <th>Amount</th>
                  <th>Net Amount</th>
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
                    <td>₹{payment.netAmount || 0}</td>
                    <td>{payment.paymentMethod?.replace('_', ' ') || 'Not available'}</td>
                    <td>
                      <Badge bg={payment.status === 'completed' ? 'success' : payment.status === 'pending' ? 'warning' : 'info'}>
                        {payment.status === 'completed'
                          ? 'Received'
                          : payment.status === 'pending'
                          ? 'Admin Release Pending'
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
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default WorkerPayments;
