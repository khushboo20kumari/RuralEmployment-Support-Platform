import React, { useEffect, useState } from 'react';
import { Container, Card, Table, Form, Button, Badge, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { paymentAPI } from '../services/api';

const EmployerPayments = () => {
  const [eligibleApplications, setEligibleApplications] = useState([]);
  const [payments, setPayments] = useState([]);
  const [amountByApp, setAmountByApp] = useState({});
  const [methodByApp, setMethodByApp] = useState({});
  const [txnByApp, setTxnByApp] = useState({});
  const [payingAppId, setPayingAppId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [razorpayReady, setRazorpayReady] = useState(false);

  const pendingReleasePayments = payments.filter((payment) => payment.status === 'advance_paid');
  const platformPendingPayments = payments.filter((payment) => payment.status === 'pending');
  const totalPlatformFee = payments.reduce((sum, payment) => sum + (payment.platformFee || 0), 0);
  const totalWorkerNet = payments.reduce((sum, payment) => sum + (payment.netAmount || 0), 0);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (window.Razorpay) {
      setRazorpayReady(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setRazorpayReady(true);
    script.onerror = () => {
      setRazorpayReady(false);
      toast.error('Payment gateway failed to load. Check internet and refresh the page.');
    };
    document.body.appendChild(script);
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
      toast.error(error.response?.data?.message || 'Failed to load payment information');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdvance = async (applicationId) => {
    const amount = Number(amountByApp[applicationId]);

    if (!process.env.REACT_APP_RAZORPAY_KEY_ID) {
      toast.error('Razorpay Key ID missing hai. Frontend .env me REACT_APP_RAZORPAY_KEY_ID set karein.');
      return;
    }

    if (!razorpayReady || !window.Razorpay) {
      toast.error('Payment gateway ready nahi hai. Page refresh karke dubara try karein.');
      return;
    }

    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (amount < 100) {
      toast.error('Minimum payment amount is ₹100');
      return;
    }

    try {
      setPayingAppId(applicationId);

      // Create Razorpay order
      const orderRes = await paymentAPI.createRazorpayOrder({
        applicationId,
        amount,
      });

      const { orderId, amount: orderAmount, keyId } = orderRes.data;
      const checkoutKey = keyId || process.env.REACT_APP_RAZORPAY_KEY_ID;

      if (!checkoutKey) {
        toast.error('Razorpay key missing from server response');
        setPayingAppId(null);
        return;
      }

      // Open Razorpay checkout
      const options = {
        key: checkoutKey,
        amount: orderAmount, // Amount in paise
        currency: 'INR',
        name: 'Rural Employment Platform',
        description: 'Advance Payment to Worker',
        order_id: orderId,
        handler: async function (response) {
          try {
            // Verify payment
            const verifyRes = await paymentAPI.verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              applicationId,
              amount,
            });
            toast.success(verifyRes.data.message || 'Payment successful!');
            fetchData();
          } catch (error) {
            toast.error(error.response?.data?.message || 'Payment verification failed');
          }
        },
        prefill: {
          name: 'Employer',
          email: 'employer@example.com',
        },
        theme: {
          color: '#0d6efd',
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', function (response) {
        toast.error('Payment failed. Please try again.');
        setPayingAppId(null);
      });
      razorpay.open();
      setPayingAppId(null);
    } catch (error) {
      const serverMessage = error.response?.data?.message;
      const debug = error.response?.data?.debug;
      const debugText = debug
        ? ` [employerId=${debug.employerId}, applicationEmployerId=${debug.applicationEmployerId}, jobEmployerId=${debug.jobEmployerId}]`
        : '';
      toast.error((serverMessage || error.message || 'Failed to create Razorpay order') + debugText);
      setPayingAppId(null);
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
      <h2 className="mb-4">💰 Payments</h2>

      <Card className="mb-4">
        <Card.Body>
          <div className="fw-semibold">Payment Summary</div>
          <div className="small text-muted mt-1">
            Gross Paid: ₹{payments.reduce((sum, payment) => sum + (payment.amount || 0), 0)} • Platform Fee (Auto ₹20 per payment): ₹{totalPlatformFee} • Net to Workers: ₹{totalWorkerNet}
          </div>
        </Card.Body>
      </Card>

      <Alert variant="info">
        <strong>Payment Flow:</strong> Step 1: Assign/Accept Work → Step 2: Give Advance Payment → Step 3: On work end date, payment auto moves to platform → Step 4: Admin releases to worker
      </Alert>

      <Card className="mb-4">
        <Card.Body>
          <h5 className="mb-3">📋 Advance Payment Ready (Not Yet Paid)</h5>
          {eligibleApplications.length === 0 ? (
            <p className="text-muted mb-0">No accepted applications available for advance payment.</p>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Worker Name</th>
                  <th>Job Title</th>
                  <th>Amount (₹)</th>
                  <th>Method</th>
                  <th>Transaction ID (Optional)</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {eligibleApplications.map((app) => (
                  <tr key={app._id}>
                    <td>{app.workerId?.userId?.name || 'N/A'}</td>
                    <td>{app.jobId?.title || 'N/A'}</td>
                    <td style={{ minWidth: '140px' }}>
                      <Form.Control
                        type="number"
                        min="1"
                        value={amountByApp[app._id] || ''}
                        onChange={(e) => setAmountByApp({ ...amountByApp, [app._id]: e.target.value })}
                        placeholder="Enter amount"
                      />
                    </td>
                    <td style={{ minWidth: '170px' }}>
                      <Form.Select
                        value={methodByApp[app._id] || 'upi'}
                        onChange={(e) => setMethodByApp({ ...methodByApp, [app._id]: e.target.value })}
                      >
                        <option value="upi">UPI</option>
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="digital_wallet">Digital Wallet</option>
                        <option value="cash">Cash</option>
                      </Form.Select>
                    </td>
                    <td style={{ minWidth: '180px' }}>
                      <Form.Control
                        type="text"
                        placeholder="Optional"
                        value={txnByApp[app._id] || ''}
                        onChange={(e) => setTxnByApp({ ...txnByApp, [app._id]: e.target.value })}
                      />
                    </td>
                    <td>
                      <Button
                        size="sm"
                        onClick={() => handleCreateAdvance(app._id)}
                        disabled={payingAppId === app._id}
                        variant="primary"
                      >
                        {payingAppId === app._id ? 'Processing...' : 'Pay Now'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      <Card className="mb-4 border-success">
        <Card.Body>
          <h5 className="mb-3">✅ Auto Move to Platform (By Assigned End Date)</h5>
          {pendingReleasePayments.length === 0 ? (
            <Alert variant="warning" className="mb-0">
              No advance-paid applications yet. First, make an advance payment above.
            </Alert>
          ) : (
            <>
            <Table responsive hover className="d-none d-md-table">
              <thead>
                <tr>
                  <th>Worker Name</th>
                  <th>Job Title</th>
                  <th>Assigned Duration</th>
                  <th>Job Status</th>
                  <th>Gross (₹)</th>
                  <th>Platform Fee (₹)</th>
                  <th>Net to Worker (₹)</th>
                  <th>Auto Transition</th>
                </tr>
              </thead>
              <tbody>
                {pendingReleasePayments.map((payment) => {
                  const jobCompleted = payment.applicationId?.status === 'completed';
                  return (
                    <tr key={`release-${payment._id}`}>
                      <td>{payment.workerId?.userId?.name || 'N/A'}</td>
                      <td>{payment.applicationId?.jobId?.title || 'N/A'}</td>
                      <td>
                        {payment.applicationId?.jobId?.startDate ? new Date(payment.applicationId.jobId.startDate).toLocaleDateString('en-IN') : '-'}
                        {' '}to{' '}
                        {payment.applicationId?.jobId?.endDate ? new Date(payment.applicationId.jobId.endDate).toLocaleDateString('en-IN') : '-'}
                      </td>
                      <td>
                        <Badge bg={jobCompleted ? 'success' : 'warning'}>
                          {jobCompleted ? '✓ Completed' : '⏳ In Progress'}
                        </Badge>
                      </td>
                      <td>₹{payment.amount}</td>
                      <td>₹{payment.platformFee || 0}</td>
                      <td>₹{payment.netAmount || 0}</td>
                      <td>
                        {jobCompleted ? (
                          <Badge bg="info">Moved to platform</Badge>
                        ) : (
                          <span className="small text-muted">Will auto move on end date</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>

            <div className="d-md-none">
              {pendingReleasePayments.map((payment) => {
                const jobCompleted = payment.applicationId?.status === 'completed';
                return (
                  <Card key={`release-mobile-${payment._id}`} className="mb-3 border-0 shadow-sm">
                    <Card.Body>
                      <div className="mb-2"><strong>Worker:</strong> {payment.workerId?.userId?.name || 'N/A'}</div>
                      <div className="mb-2"><strong>Job:</strong> {payment.applicationId?.jobId?.title || 'N/A'}</div>
                      <div className="mb-2">
                        <strong>Duration:</strong>{' '}
                        {payment.applicationId?.jobId?.startDate ? new Date(payment.applicationId.jobId.startDate).toLocaleDateString('en-IN') : '-'}
                        {' '}to{' '}
                        {payment.applicationId?.jobId?.endDate ? new Date(payment.applicationId.jobId.endDate).toLocaleDateString('en-IN') : '-'}
                      </div>
                      <div className="mb-3">
                        <Badge bg={jobCompleted ? 'success' : 'warning'}>
                          {jobCompleted ? '✓ Completed' : '⏳ In Progress'}
                        </Badge>
                      </div>
                      <div className="mb-3"><strong>Amount:</strong> ₹{payment.amount}</div>
                      <div className="small text-muted">
                        {jobCompleted ? 'Moved to platform' : 'Will auto move on end date'}
                      </div>
                    </Card.Body>
                  </Card>
                );
              })}
            </div>
            </>
          )}
        </Card.Body>
      </Card>

      <Card className="mb-4 border-info">
        <Card.Body>
          <h5 className="mb-3">🏦 Payment on Platform (Admin Will Release)</h5>
          {platformPendingPayments.length === 0 ? (
            <p className="text-muted mb-0">No payment is currently pending on platform.</p>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Worker Name</th>
                  <th>Job Title</th>
                  <th>Gross (₹)</th>
                  <th>Platform Fee (₹)</th>
                  <th>Net to Worker (₹)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {platformPendingPayments.map((payment) => (
                  <tr key={`platform-${payment._id}`}>
                    <td>{payment.workerId?.userId?.name || 'N/A'}</td>
                    <td>{payment.applicationId?.jobId?.title || 'N/A'}</td>
                    <td>₹{payment.amount}</td>
                    <td>₹{payment.platformFee || 0}</td>
                    <td>₹{payment.netAmount || 0}</td>
                    <td>
                      <Badge bg="info">On Platform • Waiting Admin Release</Badge>
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
          <h5 className="mb-3">📊 Payment History</h5>
          {payments.length === 0 ? (
            <p className="text-muted mb-0">No payments made yet.</p>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Worker Details</th>
                  <th>Job Title</th>
                  <th>Assigned Duration</th>
                  <th>Days Worked</th>
                  <th>Gross (₹)</th>
                  <th>Platform Fee (₹)</th>
                  <th>Net to Worker (₹)</th>
                  <th>Method</th>
                  <th>Payment Status</th>
                  <th>Job Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => {
                  const jobCompleted = payment.applicationId?.status === 'completed';
                  return (
                    <tr key={payment._id}>
                      <td>
                        <div className="small">
                          <div><strong>{payment.workerId?.userId?.name || 'N/A'}</strong></div>
                          <div className="text-muted">{payment.workerId?.userId?.phone || 'No phone'}</div>
                        </div>
                      </td>
                      <td>{payment.applicationId?.jobId?.title || 'N/A'}</td>
                      <td>
                        {payment.applicationId?.jobId?.startDate ? new Date(payment.applicationId.jobId.startDate).toLocaleDateString('en-IN') : '-'}
                        {' '}to{' '}
                        {payment.applicationId?.jobId?.endDate ? new Date(payment.applicationId.jobId.endDate).toLocaleDateString('en-IN') : '-'}
                      </td>
                      <td>{payment.applicationId?.attendanceCount || 0} days</td>
                      <td>₹{payment.amount}</td>
                      <td>₹{payment.platformFee || 0}</td>
                      <td>₹{payment.netAmount || 0}</td>
                      <td>{payment.paymentMethod?.replace('_', ' ') || 'N/A'}</td>
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
                            ? '✓ Completed'
                            : payment.status === 'advance_paid'
                            ? 'Advance Paid'
                            : 'Pending Release'}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg={jobCompleted ? 'success' : 'warning'}>
                          {jobCompleted ? '✓ Completed' : 'In Progress'}
                        </Badge>
                      </td>
                      <td>{new Date(payment.createdAt).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default EmployerPayments;
