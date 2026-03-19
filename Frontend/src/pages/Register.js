import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Alert, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { GoogleLogin } from '@react-oauth/google';
import { AuthContext } from '../context/AuthContext';
import { authAPI } from '../services/api';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [googleUserType, setGoogleUserType] = useState('worker');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      toast.success('Google authentication successful');

      if (response.data.isNewUser || response.data.needsProfileCompletion) {
        navigate('/profile');
        return;
      }

      if (response.data.user.userType === 'worker') {
        navigate('/worker/dashboard');
      } else if (response.data.user.userType === 'employer') {
        navigate('/employer/dashboard');
      } else {
        navigate('/');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Google signup failed';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    const message = 'Google signup was cancelled or failed';
    setError(message);
    toast.error(message);
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
              
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">👤 Select Role</Form.Label>
                <Form.Select
                  value={googleUserType}
                  onChange={(e) => setGoogleUserType(e.target.value)}
                >
                  <option value="worker">👷 Worker (काम करने वाला)</option>
                  <option value="employer">🏢 Employer (काम देने वाला)</option>
                </Form.Select>
              </Form.Group>

              <div className="my-4 d-flex justify-content-center">
                <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
              </div>

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
