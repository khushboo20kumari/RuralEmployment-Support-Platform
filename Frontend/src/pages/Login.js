import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Alert, Form, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { GoogleLogin } from '@react-oauth/google';
import { AuthContext } from '../context/AuthContext';
import { authAPI } from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [googleUserType, setGoogleUserType] = useState('worker');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const redirectByRole = (userType) => {
    if (userType === 'worker') {
      navigate('/worker/dashboard');
      return;
    }

    if (userType === 'employer') {
      navigate('/employer/dashboard');
      return;
    }

    if (userType === 'admin') {
      navigate('/admin/dashboard');
      return;
    }

    navigate('/');
  };

  const handleLocalLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await authAPI.login({ email, password });
      login(response.data.token, response.data.user);
      toast.success('Login successful');
      redirectByRole(response.data.user.userType);
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      if (!credentialResponse?.credential) {
        throw new Error('No Google credential received');
      }

      setLoading(true);
      setError('');

      const response = await authAPI.googleAuth({
        idToken: credentialResponse.credential,
        userType: googleUserType,
      });
      login(response.data.token, response.data.user);
      toast.success('Google login successful');

      if (response.data.needsProfileCompletion) {
        navigate('/profile');
        return;
      }

      redirectByRole(response.data.user.userType);
    } catch (error) {
      const message = error.response?.data?.message || 'Google login failed';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    const message = 'Google login was cancelled or failed';
    setError(message);
    toast.error(message);
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

              <Form onSubmit={handleLocalLogin}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">📧 Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    autoComplete="email"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">🔑 Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                </Form.Group>

                <Button type="submit" className="w-100 fw-bold" disabled={loading}>
                  {loading ? 'Logging in...' : 'Login with Email'}
                </Button>
              </Form>
              
              <hr className="my-4" />

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">👤 Select Role</Form.Label>
                <Form.Select
                  value={googleUserType}
                  onChange={(e) => setGoogleUserType(e.target.value)}
                >
                  <option value="worker">👷 Worker (काम करने वाला)</option>
                  <option value="employer">🏢 Employer (काम देने वाला)</option>
                  <option value="admin">🔐 Admin (प्रशासक)</option>
                </Form.Select>
              </Form.Group>

              <div className="my-4 d-flex justify-content-center">
                <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
              </div>

              <p className="text-muted text-center small mb-3">Google se Worker / Employer / Admin login support enabled hai.</p>

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
