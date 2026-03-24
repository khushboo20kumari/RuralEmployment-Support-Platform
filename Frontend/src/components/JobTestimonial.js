import React, { useState } from 'react';
import { Card, Button, Form, Alert } from 'react-bootstrap';

const JobTestimonial = ({ jobId, onSubmit, existingTestimonial }) => {
  const [testimonial, setTestimonial] = useState(existingTestimonial || '');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!testimonial.trim()) {
      setError('Please write something.');
      return;
    }
    setError('');
    setSubmitted(true);
    if (onSubmit) await onSubmit(testimonial);
  };

  if (submitted) {
    return <Alert variant="success">Thank you for your feedback!</Alert>;
  }

  return (
    <Card className="mb-3">
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-2">
            <Form.Label>Share your experience (Testimonial)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={testimonial}
              onChange={e => setTestimonial(e.target.value)}
              placeholder="How was your experience with this payment/job?"
            />
            {error && <div className="text-danger small mt-1">{error}</div>}
          </Form.Group>
          <Button type="submit" variant="primary" size="sm">Submit</Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default JobTestimonial;
