import React, { useEffect, useState } from 'react';
import { Container, Card, Table, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { paymentAPI } from '../services/api';

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
      toast.error(error.response?.data?.message || 'कमाई की जानकारी लाने में दिक्कत हुई');
    } finally {
      setLoading(false);
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
      <h2 className="mb-4">मेरी कमाई</h2>

      <Card className="mb-4">
        <Card.Body>
          <h4 className="mb-0">कुल प्राप्त राशि: ₹{totalEarnings}</h4>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          {payments.length === 0 ? (
            <p className="text-muted mb-0">अभी कोई भुगतान नहीं मिला।</p>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>राशि</th>
                  <th>शुद्ध राशि</th>
                  <th>तरीका</th>
                  <th>स्थिति</th>
                  <th>तारीख</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment._id}>
                    <td>₹{payment.amount}</td>
                    <td>₹{payment.netAmount || 0}</td>
                    <td>{payment.paymentMethod?.replace('_', ' ') || 'जानकारी नहीं'}</td>
                    <td>
                      <Badge bg={payment.status === 'completed' ? 'success' : 'warning'}>
                        {payment.status === 'completed' ? 'पूरा' : 'लंबित'}
                      </Badge>
                    </td>
                    <td>{new Date(payment.createdAt).toLocaleDateString()}</td>
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
