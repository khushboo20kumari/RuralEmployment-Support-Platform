import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { useLanguage } from '../hooks/useLanguage';

const Login = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
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

    try {
      const response = await authAPI.login(formData);
      login(response.data.token, response.data.user);
      toast.success(t('login.loginSuccess'));
      
      // Redirect based on user type
      if (response.data.user.userType === 'worker') {
        navigate('/worker/dashboard');
      } else if (response.data.user.userType === 'employer') {
        navigate('/employer/dashboard');
      } else {
        navigate('/');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'लॉगिन नहीं हो पाया';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="my-3 my-md-5 py-3">
      <Row className="justify-content-center">
        <Col xs={12} sm={10} md={8} lg={5}>
          <Card className="shadow-lg border-0 rounded-4">
            <Card.Body className="p-4 p-md-5">
              <div className="text-center mb-4">
                <div className="mb-3" style={{ fontSize: '3rem' }}>🔐</div>
                <h2 className="fw-bold mb-2">Welcome Back!</h2>
                <p className="text-muted">Login to your account</p>
              </div>
              
              {error && <Alert variant="danger" className="rounded-3">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">📧 Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter your email"
                    className="form-control-lg rounded-3"
                    style={{ fontSize: '1rem' }}
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">🔒 Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Enter your password"
                    className="form-control-lg rounded-3"
                    style={{ fontSize: '1rem' }}
                  />
                </Form.Group>

                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100 py-3 fw-bold rounded-3 mb-3"
                  size="lg"
                  disabled={loading}
                  style={{ fontSize: '1.1rem' }}
                >
                  {loading ? '⏳ Logging in...' : '✅ Login Now'}
                </Button>
              </Form>

              <hr className="my-4" />

              <div className="text-center">
                <p className="mb-0">Don't have an account?</p>
                <Link to="/register" className="btn btn-outline-primary mt-2 px-4 rounded-3 fw-semibold">
                  ✨ Register Here
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
