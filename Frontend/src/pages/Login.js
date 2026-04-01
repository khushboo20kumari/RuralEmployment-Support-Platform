import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Form, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { GoogleLogin } from '@react-oauth/google';
import { AuthContext } from '../context/AuthContext';
import { authAPI } from '../services/api';

const Login = ({ isModal }) => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
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
    <div className={isModal ? 'auth-modal-inner' : ''} style={isModal ? { width: '100%' } : {}}>
      <div className="w-100 d-flex justify-content-center">
        <div style={{ width: isModal ? '100%' : 380, maxWidth: '100%' }}>
          <div className="border-0 rounded-4 p-0" style={{ boxShadow: isModal ? 'none' : '0 4px 32px #bae6fd33', background: 'linear-gradient(135deg, #f0f7ff 0%, #fff 100%)' }}>
            <div className="p-0">
              <div className="text-center mb-3 pt-2">
                <div style={{ fontSize: 38, color: '#0ea5e9', marginBottom: 6 }}>
                  <span role="img" aria-label="login">🔐</span>
                </div>
                <h2 className="fw-bold mb-1" style={{ fontSize: '2.1rem', color: '#0ea5e9', letterSpacing: 0.2 }}>Welcome Back!</h2>
                <p className="text-muted mb-0" style={{ fontSize: '1.08rem' }}>Login to access jobs, track work, and get paid securely</p>
              </div>
              <hr style={{ border: 0, borderTop: '1.5px solid #e5e7eb', margin: '0 0 18px 0' }} />
              {error && <Alert variant="danger" className="rounded-3">{error}</Alert>}
              <div className="d-flex flex-column align-items-center gap-2 mb-3">
                <Form.Group className="mb-2 w-100">
                  <Form.Label className="fw-semibold mb-1">Login as</Form.Label>
                  <Form.Select
                    value={googleUserType}
                    onChange={(e) => setGoogleUserType(e.target.value)}
                    size="lg"
                    style={{ cursor: 'pointer', borderRadius: 10, border: '1.5px solid #bae6fd', background: '#f8fafc' }}
                  >
                    <option value="worker">👷 Worker</option>
                    <option value="employer">🏢 Employer</option>
                    <option value="admin">🛡️ Admin</option>
                  </Form.Select>
                </Form.Group>
                <div style={{ width: 240 }}>
                  <div className="google-btn-hover">
                    <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} width="100%" text="signin_with" shape="rectangular" size="large" />
                  </div>
                  <div className="text-center mt-2" style={{ fontWeight: 500, color: '#0ea5e9', fontSize: '1.08rem', letterSpacing: 0.1 }}>Login with Google</div>
                </div>
              </div>
              <div className="text-center mt-3 pb-2">
                <span className="text-muted">Don't have an account?</span>
                <Button variant="link" className="fw-semibold ps-2" style={{ color: '#0ea5e9', fontSize: '1.08rem', textDecoration: 'underline' }} onClick={() => window.dispatchEvent(new CustomEvent('showRegisterModal'))}>
                  Register Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Login;
