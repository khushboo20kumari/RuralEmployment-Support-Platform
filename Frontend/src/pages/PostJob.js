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
  const [phoneError, setPhoneError] = useState('');

  const handleChange = (e) => {
    let value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    if (e.target.name === 'contactPhone') {
      // Remove non-digits and limit to 10 digits
      value = value.replace(/\D/g, '').slice(0, 10);
      // Validate phone
      if (value.length > 0 && value.length < 10) {
        setPhoneError('Enter a valid 10-digit phone number');
      } else {
        setPhoneError('');
      }
    }
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Phone validation before submit
    if (!formData.contactPhone || formData.contactPhone.length !== 10) {
      setPhoneError('Enter a valid 10-digit phone number');
      return;
    }
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
   
      <div className="post-job-main" style={{ width: '100%', minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 0' }}>
        <div style={{ width: '100%', maxWidth: 700 }}>
          <Card className="post-job-card" style={{ border: '1.5px solid #e5e7eb', borderRadius: 16, background: '#fff', boxShadow: '0 2px 12px 0 #d1d5db55', marginBottom: 18 }}>
            <Card.Body className="p-3 p-md-4">
              <Form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px 18px' }}>
                  <Form.Group>
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
                  <Form.Group>
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
                  <Form.Group style={{ gridColumn: '1 / 3' }}>
                    <Form.Label className="fw-semibold">Job Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Describe job requirements and responsibilities"
                      className="rounded-3"
                    />
                  </Form.Group>
                  <Form.Group>
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
                  <Form.Group>
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
                  <Form.Group>
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
                  <Form.Group>
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
                  <Form.Group style={{ gridColumn: '1 / 3' }}>
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
                  <Form.Group style={{ gridColumn: '1 / 2' }}>
                    <Form.Label className="fw-semibold">Contact Phone *</Form.Label>
                    <Form.Control
                      type="tel"
                      name="contactPhone"
                      value={formData.contactPhone}
                      onChange={handleChange}
                      required
                      placeholder="10-digit phone"
                      className="rounded-3"
                      pattern="[0-9]{10}"
                      maxLength={10}
                      inputMode="numeric"
                    />
                    {phoneError && (
                      <div style={{ color: '#dc2626', fontSize: 13, marginTop: 2 }}>{phoneError}</div>
                    )}
                  </Form.Group>
                  <Form.Group>
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
                  <Form.Group>
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
                  <Form.Group>
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
                  <Form.Group>
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
                </div>
                <Button variant="primary" type="submit" className="w-100 py-3 fw-bold rounded-3 post-job-submit-btn" size="lg" disabled={loading} style={{ marginTop: 18 }}>
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
