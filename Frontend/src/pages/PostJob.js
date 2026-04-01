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
    name: '',
    village: '',
    district: '',
    state: '',
    address: '',
    contactPhone: '',
    amount: '',
    numberOfPositions: 1,
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    workType: '',
    // Optionally add skillsRequired if you want to support it
    // skillsRequired: [],
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
        // skillsRequired: formData.skillsRequired, // Uncomment if you add this field
        location: {
          village: formData.village,
          district: formData.district,
          state: formData.state,
          address: formData.address,
        },
        jobProviderContact: {
          phone: formData.contactPhone,
          address: formData.address,
          name: formData.name,
        },
        salary: {
          amount: formData.amount,
          period: 'daily',
        },
        numberOfPositions: formData.numberOfPositions,
        startDate: formData.startDate,
        endDate: formData.endDate,
        workingHours: {
          startTime: formData.startTime,
          endTime: formData.endTime,
        },
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
    <div className="post-job-layout" style={{ display: 'flex', minHeight: '100vh', background: '#f6f7f9' }}>
      {/* Sidebar placeholder (40%) */}
      <div className="post-job-sidebar" style={{ width: '40%', minWidth: 240, maxWidth: 420, background: '#e0f2fe', borderRight: '1.5px solid #bae6fd', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 18px', boxSizing: 'border-box' }}>
        <div style={{ maxWidth: 320, textAlign: 'center' }}>
          <h2 className="fw-bold mb-3" style={{ color: '#0ea5e9', fontSize: '2.2rem', letterSpacing: 0.5 }}>Post a New Job</h2>
          <div className="text-muted mb-4" style={{ fontSize: '1.13rem' }}>Create a clear job post to attract better workers faster. Fill all details carefully for best results.</div>
          <ul className="text-start" style={{ color: '#0369a1', fontSize: 16, lineHeight: 1.7, margin: '0 auto', maxWidth: 300, paddingLeft: 18 }}>
            <li>Use a simple, clear job title</li>
            <li>Describe work and location properly</li>
            <li>Give correct contact details</li>
            <li>Check all info before posting</li>
          </ul>
        </div>
      </div>
      {/* Main Form (60%) */}
      <div className="post-job-main" style={{ width: '60%', minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 0' }}>
        <div style={{ width: '100%', maxWidth: 520 }}>
          <Card className="post-job-card" style={{ border: '1.5px solid #e5e7eb', borderRadius: 16, background: '#fff', boxShadow: '0 2px 12px 0 #d1d5db55', marginBottom: 24 }}>
            <Card.Body className="p-3 p-md-4">
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Job Title *</Form.Label>
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
                  <Form.Label className="fw-semibold">Work Type *</Form.Label>
                  <Form.Select
                    name="workType"
                    value={formData.workType}
                    onChange={handleChange}
                    required
                    className="form-control-lg rounded-3"
                  >
                    <option value="">Select work type</option>
                    <option value="construction_labour">Construction Labour</option>
                    <option value="factory_helper">Factory Helper</option>
                    <option value="farm_worker">Farm Worker</option>
                    <option value="domestic_help">Domestic Help</option>
                    <option value="other">Other</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Job Description</Form.Label>
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
                  <Form.Label className="fw-semibold">Your Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Your Name"
                    className="rounded-3"
                  />
                </Form.Group>
                <div className="rounded-3 p-3 mb-3" style={{ background: '#f8fafc', border: '1px solid #e5e7eb' }}>
                  <h5 className="mb-3 fw-semibold">Location</h5>
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
                  <Row>
                    <Col xs={12} sm={8}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Address *</Form.Label>
                        <Form.Control
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          required
                          placeholder="Complete काम का address"
                          className="rounded-3"
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} sm={4}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Contact Phone *</Form.Label>
                        <Form.Control
                          type="tel"
                          name="contactPhone"
                          value={formData.contactPhone}
                          onChange={handleChange}
                          required
                          placeholder="10-digit phone"
                          className="rounded-3"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Amount per Worker (Daily) *</Form.Label>
                  <Form.Control
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    required
                    placeholder="Enter daily amount"
                    className="form-control-lg rounded-3"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Number of Workers Needed *</Form.Label>
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
                <div className="rounded-3 p-3 mb-3" style={{ background: '#f8fafc', border: '1px solid #e5e7eb' }}>
                  <h5 className="mb-3 fw-semibold">Work Duration</h5>
                  <Row>
                    <Col xs={12} sm={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Start Date *</Form.Label>
                        <Form.Control
                          type="date"
                          name="startDate"
                          value={formData.startDate}
                          onChange={handleChange}
                          required
                          className="rounded-3"
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} sm={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">End Date *</Form.Label>
                        <Form.Control
                          type="date"
                          name="endDate"
                          value={formData.endDate}
                          onChange={handleChange}
                          required
                          min={formData.startDate || undefined}
                          className="rounded-3"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>
                <Button variant="primary" type="submit" className="w-100 py-3 fw-bold rounded-3 post-job-submit-btn" size="lg" disabled={loading}>
                  {loading ? '⏳ Posting...' : 'Post Job Now'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </div>
      </div>

    </div>
  );
};

export default PostJob;
