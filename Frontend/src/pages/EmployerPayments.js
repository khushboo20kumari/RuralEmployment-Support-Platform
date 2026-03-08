import React, { useEffect, useState } from 'react';
import { Container, Card, Table, Form, Button, Badge, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { paymentAPI } from '../services/api';
import { useLanguage } from '../hooks/useLanguage';

const EmployerPayments = () => {
  const { t } = useLanguage();
  const [eligibleApplications, setEligibleApplications] = useState([]);
  const [payments, setPayments] = useState([]);
  const [amountByApp, setAmountByApp] = useState({});
  const [methodByApp, setMethodByApp] = useState({});
  const [txnByApp, setTxnByApp] = useState({});
  const [payingAppId, setPayingAppId] = useState(null);
  const [releasingPaymentId, setReleasingPaymentId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [eligibleRes, paymentsRes] = await Promise.all([
        paymentAPI.getEligibleApplications(),
        paymentAPI.getEmployerPayments(),
      ]);

      const apps = eligibleRes.data.applications || [];
      setEligibleApplications(apps);
      setPayments(paymentsRes.data.payments || []);

      const defaults = {};
      const methods = {};
      apps.forEach((app) => {
        defaults[app._id] = app.jobId?.salary?.amount || '';
        methods[app._id] = 'upi';
      });
      setAmountByApp(defaults);
      setMethodByApp(methods);
    } catch (error) {
      toast.error(error.response?.data?.message || 'भुगतान जानकारी लोड करने में दिक्कत हुई');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdvance = async (applicationId) => {
    const amount = Number(amountByApp[applicationId]);
    const paymentMethod = methodByApp[applicationId] || 'upi';
    const transactionId = txnByApp[applicationId] || '';

    if (!amount || amount <= 0) {
      toast.error('कृपया सही राशि लिखें');
      return;
    }

    try {
      setPayingAppId(applicationId);
      await paymentAPI.createAdvance({
        applicationId,
        amount,
        paymentMethod,
        transactionId,
      });
      toast.success('एडवांस भुगतान सफल हुआ');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'एडवांस भुगतान करने में दिक्कत हुई');
    } finally {
      setPayingAppId(null);
    }
  };

  const handleRelease = async (paymentId) => {
    if (!window.confirm('क्या आप अंतिम भुगतान जारी करना चाहते हैं?')) return;

    try {
      setReleasingPaymentId(paymentId);
      await paymentAPI.releasePayment(paymentId);
      toast.success('अंतिम भुगतान सफलतापूर्वक जारी हुआ');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'अंतिम भुगतान जारी करने में दिक्कत हुई');
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
    <Container className="my-5">
      <h2 className="mb-4">भुगतान (आसान तरीका)</h2>

      <Alert variant="info">
        चरण 1: अर्ज़ी स्वीकार करें → चरण 2: एडवांस दें → चरण 3: काम पूरा होने पर <strong>अंतिम भुगतान जारी करें</strong> दबाएँ।
      </Alert>

      <Card className="mb-4">
        <Card.Body>
          <h5 className="mb-3">एडवांस के लिए तैयार स्वीकृत अर्ज़ियाँ</h5>
          {eligibleApplications.length === 0 ? (
            <p className="text-muted mb-0">भुगतान के लिए कोई स्वीकृत अर्ज़ी नहीं मिली।</p>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>मज़दूर</th>
                  <th>काम</th>
                  <th>राशि</th>
                  <th>तरीका</th>
                  <th>ट्रांजैक्शन ID (वैकल्पिक)</th>
                  <th>कार्रवाई</th>
                </tr>
              </thead>
              <tbody>
                {eligibleApplications.map((app) => (
                  <tr key={app._id}>
                    <td>{app.workerId?.userId?.name || 'जानकारी नहीं'}</td>
                    <td>{app.jobId?.title || 'जानकारी नहीं'}</td>
                    <td style={{ minWidth: '140px' }}>
                      <Form.Control
                        type="number"
                        min="1"
                        value={amountByApp[app._id] || ''}
                        onChange={(e) => setAmountByApp({ ...amountByApp, [app._id]: e.target.value })}
                      />
                    </td>
                    <td style={{ minWidth: '170px' }}>
                      <Form.Select
                        value={methodByApp[app._id] || 'upi'}
                        onChange={(e) => setMethodByApp({ ...methodByApp, [app._id]: e.target.value })}
                      >
                        <option value="upi">UPI</option>
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="digital_wallet">Wallet</option>
                        <option value="cash">Cash</option>
                      </Form.Select>
                    </td>
                    <td style={{ minWidth: '180px' }}>
                      <Form.Control
                        type="text"
                        placeholder="वैकल्पिक"
                        value={txnByApp[app._id] || ''}
                        onChange={(e) => setTxnByApp({ ...txnByApp, [app._id]: e.target.value })}
                      />
                    </td>
                    <td>
                      <Button
                        size="sm"
                        onClick={() => handleCreateAdvance(app._id)}
                        disabled={payingAppId === app._id}
                      >
                        {payingAppId === app._id ? 'हो रहा है...' : 'एडवांस भुगतान करें'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          <h5 className="mb-3">मेरा भुगतान इतिहास</h5>
          {payments.length === 0 ? (
            <p className="text-muted mb-0">अभी कोई भुगतान नहीं है।</p>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Worker Details</th>
                  <th>Job</th>
                  <th>Attendance</th>
                  <th>राशि</th>
                  <th>तरीका</th>
                  <th>स्थिति</th>
                  <th>Job Status</th>
                  <th>तारीख</th>
                  <th>कार्रवाई</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment._id}>
                    <td>
                      <div className="small">
                        <div><strong>{payment.workerId?.userId?.name || 'N/A'}</strong></div>
                        <div className="text-muted">{payment.workerId?.userId?.phone || 'No phone'}</div>
                      </div>
                    </td>
                    <td>{payment.applicationId?.jobId?.title || 'N/A'}</td>
                    <td>{payment.applicationId?.attendanceCount || 0} days</td>
                    <td>₹{payment.amount}</td>
                    <td>{payment.paymentMethod?.replace('_', ' ') || 'जानकारी नहीं'}</td>
                    <td>
                      <Badge
                        bg={
                          payment.status === 'completed'
                            ? 'success'
                            : payment.status === 'advance_paid'
                            ? 'info'
                            : 'warning'
                        }
                      >
                        {payment.status === 'completed'
                          ? 'पूरा'
                          : payment.status === 'advance_paid'
                          ? 'एडवांस दिया गया'
                          : 'लंबित'}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg={payment.applicationId?.status === 'completed' ? 'success' : 'warning'}>
                        {payment.applicationId?.status === 'completed' ? 'Completed by Worker' : 'Work in Progress'}
                      </Badge>
                    </td>
                    <td>{new Date(payment.createdAt).toLocaleDateString()}</td>
                    <td>
                      {payment.status === 'advance_paid' ? (
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => handleRelease(payment._id)}
                          disabled={
                            releasingPaymentId === payment._id ||
                            payment.applicationId?.status !== 'completed'
                          }
                        >
                          {releasingPaymentId === payment._id
                            ? 'हो रहा है...'
                            : payment.applicationId?.status === 'completed'
                            ? 'अंतिम भुगतान जारी करें'
                            : 'Worker completion pending'}
                        </Button>
                      ) : (
                        <span className="text-muted">-</span>
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

export default EmployerPayments;
