import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { jobAPI } from '../services/api';

const PostJob = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    workType: 'construction_labour',
    village: '',
    district: '',
    state: '',
    amount: '',
    period: 'daily',
    numberOfPositions: 1,
    experienceRequired: 0,
    startTime: '',
    endTime: '',
    accommodation: false,
    mealProvided: false,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const jobData = {
        title: formData.title,
        description: formData.description,
        workType: formData.workType,
        location: {
          village: formData.village,
          district: formData.district,
          state: formData.state,
        },
        salary: {
          amount: formData.amount,
          period: formData.period,
        },
        numberOfPositions: formData.numberOfPositions,
        experienceRequired: formData.experienceRequired,
        workingHours: {
          startTime: formData.startTime,
          endTime: formData.endTime,
        },
        accommodation: formData.accommodation,
        mealProvided: formData.mealProvided,
      };

      const response = await jobAPI.create(jobData);
      toast.success(response.data.message || 'Job posted successfully!');
      navigate('/employer/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error posting job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="my-3 my-md-5 py-2 post-job-page">
      <Row className="justify-content-center">
        <Col xs={12} lg={10}>
          <Card className="border rounded-4 post-job-card" style={{ borderColor: '#dbe3f1' }}>
            <Card.Body className="p-3 p-md-4">
              <div className="mb-4 rounded-4 p-3 p-md-4" style={{ background: 'linear-gradient(135deg, #eef4ff 0%, #f8fbff 100%)', border: '1px solid #d9e7ff' }}>
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                  <div>
                    <div className="mb-1" style={{ fontSize: '2rem' }}>🧾</div>
                    <h2 className="fw-bold mb-1">Post a New Job</h2>
                    <p className="text-muted mb-0">Create a clear job post to attract better workers faster.</p>
                  </div>
                  <div className="d-flex gap-2 flex-wrap">
                    <span className="badge bg-primary-subtle text-primary border">Professional</span>
                    <span className="badge bg-success-subtle text-success border">Fast Hiring</span>
                  </div>
                </div>
              </div>

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">💼 Job Title *</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Construction Worker Needed"
                    className="form-control-lg rounded-3"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">📝 Job Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe job requirements and responsibilities"
                    className="rounded-3"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">🏗️ Work Type *</Form.Label>
                  <Form.Select name="workType" value={formData.workType} onChange={handleChange} required className="form-select-lg rounded-3">
                    <option value="construction_labour">👷 Construction Labour</option>
                    <option value="factory_helper">🏭 Factory Helper</option>
                    <option value="farm_worker">🚜 Farm Worker</option>
                    <option value="domestic_help">🏠 Domestic Help</option>
                    <option value="other">📦 Other</option>
                  </Form.Select>
                </Form.Group>

                <div className="rounded-3 p-3 mb-3" style={{ background: '#f8fafc', border: '1px solid #e5e7eb' }}>
                  <h5 className="mb-3 fw-semibold">📍 Location</h5>
                  <Row>
                    <Col xs={12} sm={4}>
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
                    <Col xs={12} sm={4}>
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
                    <Col xs={12} sm={4}>
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
                  </Row>
                </div>

                <div className="rounded-3 p-3 mb-3" style={{ background: '#f8fafc', border: '1px solid #e5e7eb' }}>
                  <h5 className="mb-3 fw-semibold">💰 Salary</h5>
                  <Row>
                    <Col xs={12} sm={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Amount (₹) *</Form.Label>
                        <Form.Control
                          type="number"
                          name="amount"
                          value={formData.amount}
                          onChange={handleChange}
                          required
                          placeholder="Enter amount"
                          className="form-control-lg rounded-3"
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} sm={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Payment Period *</Form.Label>
                        <Form.Select name="period" value={formData.period} onChange={handleChange} required className="form-select-lg rounded-3">
                          <option value="hourly">⏰ Hourly</option>
                          <option value="daily">📅 Daily</option>
                          <option value="monthly">📆 Monthly</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                </div>

                <Row>
                  <Col xs={12} sm={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">👥 Positions *</Form.Label>
                      <Form.Control
                        type="number"
                        name="numberOfPositions"
                        value={formData.numberOfPositions}
                        onChange={handleChange}
                        required
                        min="1"
                        className="form-control-lg rounded-3"
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={12} sm={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">📊 Experience (years)</Form.Label>
                      <Form.Control
                        type="number"
                        name="experienceRequired"
                        value={formData.experienceRequired}
                        onChange={handleChange}
                        min="0"
                        className="form-control-lg rounded-3"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="rounded-3 p-3 mb-3" style={{ background: '#f8fafc', border: '1px solid #e5e7eb' }}>
                  <h5 className="mb-3 fw-semibold">⏰ Working Hours</h5>
                  <Row>
                    <Col xs={12} sm={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Start Time</Form.Label>
                        <Form.Control
                          type="time"
                          name="startTime"
                          value={formData.startTime}
                          onChange={handleChange}
                          className="rounded-3"
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} sm={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">End Time</Form.Label>
                        <Form.Control
                          type="time"
                          name="endTime"
                          value={formData.endTime}
                          onChange={handleChange}
                          className="rounded-3"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>

                <div className="rounded-3 p-3 mb-4" style={{ background: '#f8fafc', border: '1px solid #e5e7eb' }}>
                  <h5 className="mb-3 fw-semibold">✨ Benefits</h5>
                  <Form.Group className="mb-2">
                    <Form.Check
                      type="checkbox"
                      name="accommodation"
                      label="🏠 Accommodation Provided"
                      checked={formData.accommodation}
                      onChange={handleChange}
                      className="fw-semibold"
                    />
                  </Form.Group>
                  <Form.Group className="mb-2">
                    <Form.Check
                      type="checkbox"
                      name="mealProvided"
                      label="🍽️ Meals Provided"
                      checked={formData.mealProvided}
                      onChange={handleChange}
                      className="fw-semibold"
                    />
                  </Form.Group>
                </div>

                <Button variant="primary" type="submit" className="w-100 py-3 fw-bold rounded-3 post-job-submit-btn" size="lg" disabled={loading}>
                  {loading ? '⏳ Posting...' : '✅ Post Job Now'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PostJob;
