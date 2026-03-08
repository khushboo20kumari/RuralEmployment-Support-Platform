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
    <Container className="my-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card>
            <Card.Body className="p-5">
              <h2 className="text-center mb-4">लॉगिन</h2>
              
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>ईमेल</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="अपना ईमेल लिखें"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>पासवर्ड</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="अपना पासवर्ड लिखें"
                  />
                </Form.Group>

                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100 mb-3"
                  disabled={loading}
                >
                  {loading ? 'लॉगिन हो रहा है...' : 'लॉगिन करें'}
                </Button>
              </Form>

              <div className="text-center">
                <p>खाता नहीं है? <Link to="/register">यहाँ रजिस्टर करें</Link></p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
