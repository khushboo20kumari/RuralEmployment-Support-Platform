import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { jobAPI } from '../services/api';
import { useLanguage } from '../hooks/useLanguage';

const PostJob = () => {
  const { t } = useLanguage();
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
    <Container className="my-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card>
            <Card.Body className="p-4">
              <h2 className="mb-4">Post a New Job</h2>

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Job Title *</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Construction Worker Needed"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Job Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe the job requirements and responsibilities"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Work Type *</Form.Label>
                  <Form.Select name="workType" value={formData.workType} onChange={handleChange} required>
                    <option value="construction_labour">Construction Labour</option>
                    <option value="factory_helper">Factory Helper</option>
                    <option value="farm_worker">Farm Worker</option>
                    <option value="domestic_help">Domestic Help</option>
                    <option value="other">Other</option>
                  </Form.Select>
                </Form.Group>

                <h5 className="mt-4 mb-3">Location</h5>
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Village</Form.Label>
                      <Form.Control
                        type="text"
                        name="village"
                        value={formData.village}
                        onChange={handleChange}
                        placeholder="Village name"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>District *</Form.Label>
                      <Form.Control
                        type="text"
                        name="district"
                        value={formData.district}
                        onChange={handleChange}
                        required
                        placeholder="District"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>State *</Form.Label>
                      <Form.Control
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        required
                        placeholder="State"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <h5 className="mt-4 mb-3">Salary</h5>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Amount (₹) *</Form.Label>
                      <Form.Control
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        required
                        placeholder="Enter amount"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Payment Period *</Form.Label>
                      <Form.Select name="period" value={formData.period} onChange={handleChange} required>
                        <option value="hourly">Hourly</option>
                        <option value="daily">Daily</option>
                        <option value="monthly">Monthly</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Number of Positions *</Form.Label>
                      <Form.Control
                        type="number"
                        name="numberOfPositions"
                        value={formData.numberOfPositions}
                        onChange={handleChange}
                        required
                        min="1"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Experience Required (years)</Form.Label>
                      <Form.Control
                        type="number"
                        name="experienceRequired"
                        value={formData.experienceRequired}
                        onChange={handleChange}
                        min="0"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <h5 className="mt-4 mb-3">Working Hours</h5>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Start Time</Form.Label>
                      <Form.Control
                        type="time"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>End Time</Form.Label>
                      <Form.Control
                        type="time"
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <h5 className="mt-4 mb-3">Benefits</h5>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    name="accommodation"
                    label="Accommodation Provided"
                    checked={formData.accommodation}
                    onChange={handleChange}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    name="mealProvided"
                    label="Meals Provided"
                    checked={formData.mealProvided}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100" disabled={loading}>
                  {loading ? 'Posting...' : 'Post Job'}
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
