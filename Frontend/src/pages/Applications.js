import React, { useState, useEffect } from 'react';
import { Container, Card, Badge, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { applicationAPI } from '../services/api';
import { useLanguage } from '../hooks/useLanguage';

const Applications = () => {
  const { t } = useLanguage();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await applicationAPI.getMyApplications();
      setApplications(response.data.applications);
    } catch (error) {
      toast.error('अर्ज़ियाँ लाने में दिक्कत हुई');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (applicationId) => {
    if (window.confirm('क्या आप यह अर्ज़ी रद्द करना चाहते हैं?')) {
      try {
        await applicationAPI.cancel(applicationId);
        toast.success('अर्ज़ी रद्द हो गई');
        fetchApplications();
      } catch (error) {
        toast.error('अर्ज़ी रद्द करने में दिक्कत हुई');
      }
    }
  };

  if (loading) {
    return (
      <Container className="my-5 text-center">
        <div className="spinner-border text-primary" role="status" />
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <h2 className="mb-4">मेरी अर्ज़ियाँ</h2>

      {applications.length === 0 ? (
        <Card>
          <Card.Body className="text-center py-5">
            <h4>अभी कोई अर्ज़ी नहीं है</h4>
            <p className="text-muted">काम पर अर्ज़ी भेजें, यहाँ आपकी सभी अर्ज़ियाँ दिखेंगी</p>
          </Card.Body>
        </Card>
      ) : (
        applications.map((app) => (
          <Card key={app._id} className="mb-3">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h5>{app.jobId?.title}</h5>
                  <p className="mb-2">
                    <strong>मालिक:</strong> {app.employerId?.companyName || 'जानकारी नहीं'}<br />
                    <strong>जगह:</strong> {app.jobId?.location?.district}, {app.jobId?.location?.state}<br />
                    <strong>मजदूरी:</strong> ₹{app.jobId?.salary?.amount} / {app.jobId?.salary?.period}<br />
                    <strong>अर्ज़ी की तारीख:</strong> {new Date(app.applicationDate).toLocaleDateString()}
                  </p>
                  {app.appliedMessage && (
                    <p className="text-muted">
                      <strong>आपका संदेश:</strong> {app.appliedMessage}
                    </p>
                  )}
                  {app.employerNotes && (
                    <p className="text-muted">
                      <strong>मालिक की टिप्पणी:</strong> {app.employerNotes}
                    </p>
                  )}
                </div>
                <div className="text-end">
                  <Badge 
                    bg={
                      app.status === 'accepted' ? 'success' :
                      app.status === 'rejected' ? 'danger' :
                      app.status === 'applied' ? 'primary' : 
                      app.status === 'completed' ? 'info' : 'secondary'
                    }
                    className="mb-2"
                  >
                    {app.status === 'accepted'
                      ? 'स्वीकृत'
                      : app.status === 'rejected'
                      ? 'अस्वीकृत'
                      : app.status === 'applied'
                      ? 'भेजी गई'
                      : app.status === 'completed'
                      ? 'पूरा हुआ'
                      : 'प्रक्रिया में'}
                  </Badge>
                  {app.status === 'applied' && (
                    <div>
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => handleCancel(app._id)}
                      >
                        रद्द करें
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card.Body>
          </Card>
        ))
      )}
    </Container>
  );
};

export default Applications;
