import React, { useState, useContext } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { useLanguage } from '../hooks/useLanguage';

const Register = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const { login } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    userType: searchParams.get('type') || 'worker',
    village: '',
    district: '',
    state: '',
    pincode: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError(t('register.passwordMismatch'));
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.register(formData);
      login(response.data.token, response.data.user);
      toast.success(t('register.registerSuccess'));
      
      // Redirect based on user type
      if (response.data.user.userType === 'worker') {
        navigate('/worker/dashboard');
      } else if (response.data.user.userType === 'employer') {
        navigate('/employer/dashboard');
      } else {
        navigate('/');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'रजिस्ट्रेशन नहीं हो पाया';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="my-3 my-md-5 py-3">
      <Row className="justify-content-center">
        <Col xs={12} sm={11} md={10} lg={7}>
          <Card className="shadow-lg border-0 rounded-4">
            <Card.Body className="p-3 p-md-5">
              <div className="text-center mb-4">
                <div className="mb-3" style={{ fontSize: '3rem' }}>✨</div>
                <h2 className="fw-bold mb-2">Create Account</h2>
                <p className="text-muted">Join the platform in 2 minutes</p>
              </div>
              
              {error && <Alert variant="danger" className="rounded-3">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">👤 I am a</Form.Label>
                  <Form.Select
                    name="userType"
                    value={formData.userType}
                    onChange={handleChange}
                    required
                    className="form-select-lg rounded-3"
                    style={{ fontSize: '1rem' }}
                  >
                    <option value="worker">👷 Worker (Looking for jobs)</option>
                    <option value="employer">🏢 Employer (Looking to hire)</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">📝 Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter your full name"
                    className="form-control-lg rounded-3"
                    style={{ fontSize: '1rem' }}
                  />
                </Form.Group>

                <Row>
                  <Col xs={12} md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">📧 Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="your.email@example.com"
                        className="form-control-lg rounded-3"
                        style={{ fontSize: '1rem' }}
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={12} md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">📱 Mobile</Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        placeholder="10-digit number"
                        className="form-control-lg rounded-3"
                        style={{ fontSize: '1rem' }}
                        maxLength="10"
                        pattern="[0-9]{10}"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col xs={12} md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">🔒 Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        placeholder="At least 6 characters"
                        className="form-control-lg rounded-3"
                        style={{ fontSize: '1rem' }}
                        minLength="6"
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={12} md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">🔒 Confirm</Form.Label>
                      <Form.Control
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        placeholder="Re-enter password"
                        className="form-control-lg rounded-3"
                        style={{ fontSize: '1rem' }}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="bg-light rounded-3 p-3 mb-4">
                  <h5 className="mb-3 fw-semibold">📍 Location</h5>
                  <Row>
                    <Col xs={12} sm={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Village</Form.Label>
                        <Form.Control
                          type="text"
                          name="village"
                          value={formData.village}
                          onChange={handleChange}
                          placeholder="Village name"
                          className="rounded-3"
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} sm={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">District *</Form.Label>
                        <Form.Control
                          type="text"
                          name="district"
                          value={formData.district}
                          onChange={handleChange}
                          required
                          placeholder="District"
                          className="rounded-3"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col xs={12} sm={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">State *</Form.Label>
                        <Form.Control
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          required
                          placeholder="State"
                          className="rounded-3"
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} sm={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">PIN Code</Form.Label>
                        <Form.Control
                          type="text"
                          name="pincode"
                          value={formData.pincode}
                          onChange={handleChange}
                          placeholder="6-digit"
                          className="rounded-3"
                          maxLength="6"
                          pattern="[0-9]{6}"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>

                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100 py-3 fw-bold rounded-3 mb-3"
                  size="lg"
                  disabled={loading}
                  style={{ fontSize: '1.1rem' }}
                >
                  {loading ? '⏳ Creating...' : '✅ Register Now'}
                </Button>
              </Form>

              <hr className="my-4" />

              <div className="text-center">
                <p className="mb-0">Already have account?</p>
                <Link to="/login" className="btn btn-outline-primary mt-2 px-4 rounded-3 fw-semibold">
                  🔐 Login Here
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;
