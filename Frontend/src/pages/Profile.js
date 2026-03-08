import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Form, Button, Tabs, Tab } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import { authAPI, workerAPI, employerAPI, reviewAPI } from '../services/api';

const Profile = () => {
  const { user, loadUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  
  const [userProfile, setUserProfile] = useState({
    name: '',
    phone: '',
  });

  const [workerProfile, setWorkerProfile] = useState({
    skills: [],
    experience: 0,
    experienceDetails: '',
    hourlyRate: '',
    dailyRate: '',
    monthlyRate: '',
    availability: 'flexible',
  });

  const [employerProfile, setEmployerProfile] = useState({
    companyName: '',
    companyType: '',
    contactPerson: '',
    websiteUrl: '',
  });

  useEffect(() => {
    fetchProfile();
    fetchReviews();
  }, []);

  const fetchProfile = async () => {
    try {
      const userRes = await authAPI.getMe();
      setUserProfile({
        name: userRes.data.user.name,
        phone: userRes.data.user.phone,
      });

      if (user.userType === 'worker') {
        const workerRes = await workerAPI.getProfile();
        setWorkerProfile({
          skills: workerRes.data.worker.skills || [],
          experience: workerRes.data.worker.experience || 0,
          experienceDetails: workerRes.data.worker.experienceDetails || '',
          hourlyRate: workerRes.data.worker.hourlyRate || '',
          dailyRate: workerRes.data.worker.dailyRate || '',
          monthlyRate: workerRes.data.worker.monthlyRate || '',
          availability: workerRes.data.worker.availability || 'flexible',
        });
      } else if (user.userType === 'employer') {
        const employerRes = await employerAPI.getProfile();
        setEmployerProfile({
          companyName: employerRes.data.employer.companyName || '',
          companyType: employerRes.data.employer.companyType || '',
          contactPerson: employerRes.data.employer.contactPerson || '',
          websiteUrl: employerRes.data.employer.websiteUrl || '',
        });
      }
    } catch (error) {
      toast.error('Error loading profile');
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await reviewAPI.getMyReviews();
      setReviews(response.data.reviews);
    } catch (error) {
      console.error('Error fetching reviews');
    }
  };

  const handleUserProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.updateProfile(userProfile);
      await loadUser();
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handleWorkerProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await workerAPI.updateProfile(workerProfile);
      toast.success('Worker profile updated successfully');
    } catch (error) {
      toast.error('Error updating worker profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEmployerProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await employerAPI.updateProfile(employerProfile);
      toast.success('Employer profile updated successfully');
    } catch (error) {
      toast.error('Error updating employer profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="my-5">
      <h2 className="mb-4">My Profile</h2>

      <Row>
        <Col md={8}>
          <Tabs defaultActiveKey="basic" className="mb-3">
            <Tab eventKey="basic" title="Basic Info">
              <Card>
                <Card.Body>
                  <Form onSubmit={handleUserProfileUpdate}>
                    <Form.Group className="mb-3">
                      <Form.Label>Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={userProfile.name}
                        onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Phone</Form.Label>
                      <Form.Control
                        type="tel"
                        value={userProfile.phone}
                        onChange={(e) => setUserProfile({ ...userProfile, phone: e.target.value })}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        value={user?.email}
                        disabled
                      />
                      <Form.Text className="text-muted">Email cannot be changed</Form.Text>
                    </Form.Group>

                    <Button variant="primary" type="submit" disabled={loading}>
                      {loading ? 'Updating...' : 'Update Basic Info'}
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </Tab>

            {user.userType === 'worker' && (
              <Tab eventKey="worker" title="Worker Details">
                <Card>
                  <Card.Body>
                    <Form onSubmit={handleWorkerProfileUpdate}>
                      <Form.Group className="mb-3">
                        <Form.Label>Skills</Form.Label>
                        <Form.Select
                          multiple
                          value={workerProfile.skills}
                          onChange={(e) => {
                            const selected = Array.from(e.target.selectedOptions, option => option.value);
                            setWorkerProfile({ ...workerProfile, skills: selected });
                          }}
                        >
                          <option value="construction_labour">Construction Labour</option>
                          <option value="factory_helper">Factory Helper</option>
                          <option value="farm_worker">Farm Worker</option>
                          <option value="domestic_help">Domestic Help</option>
                          <option value="other">Other</option>
                        </Form.Select>
                        <Form.Text className="text-muted">Hold Ctrl/Cmd to select multiple</Form.Text>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Experience (years)</Form.Label>
                        <Form.Control
                          type="number"
                          value={workerProfile.experience}
                          onChange={(e) => setWorkerProfile({ ...workerProfile, experience: e.target.value })}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Experience Details</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          value={workerProfile.experienceDetails}
                          onChange={(e) => setWorkerProfile({ ...workerProfile, experienceDetails: e.target.value })}
                        />
                      </Form.Group>

                      <Row>
                        <Col md={4}>
                          <Form.Group className="mb-3">
                            <Form.Label>Hourly Rate (₹)</Form.Label>
                            <Form.Control
                              type="number"
                              value={workerProfile.hourlyRate}
                              onChange={(e) => setWorkerProfile({ ...workerProfile, hourlyRate: e.target.value })}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group className="mb-3">
                            <Form.Label>Daily Rate (₹)</Form.Label>
                            <Form.Control
                              type="number"
                              value={workerProfile.dailyRate}
                              onChange={(e) => setWorkerProfile({ ...workerProfile, dailyRate: e.target.value })}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group className="mb-3">
                            <Form.Label>Monthly Rate (₹)</Form.Label>
                            <Form.Control
                              type="number"
                              value={workerProfile.monthlyRate}
                              onChange={(e) => setWorkerProfile({ ...workerProfile, monthlyRate: e.target.value })}
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <Form.Group className="mb-3">
                        <Form.Label>Availability</Form.Label>
                        <Form.Select
                          value={workerProfile.availability}
                          onChange={(e) => setWorkerProfile({ ...workerProfile, availability: e.target.value })}
                        >
                          <option value="full_time">Full Time</option>
                          <option value="part_time">Part Time</option>
                          <option value="seasonal">Seasonal</option>
                          <option value="flexible">Flexible</option>
                        </Form.Select>
                      </Form.Group>

                      <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? 'Updating...' : 'Update Worker Profile'}
                      </Button>
                    </Form>
                  </Card.Body>
                </Card>
              </Tab>
            )}

            {user.userType === 'employer' && (
              <Tab eventKey="employer" title="Employer Details">
                <Card>
                  <Card.Body>
                    <Form onSubmit={handleEmployerProfileUpdate}>
                      <Form.Group className="mb-3">
                        <Form.Label>Company Name</Form.Label>
                        <Form.Control
                          type="text"
                          value={employerProfile.companyName}
                          onChange={(e) => setEmployerProfile({ ...employerProfile, companyName: e.target.value })}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Company Type</Form.Label>
                        <Form.Select
                          value={employerProfile.companyType}
                          onChange={(e) => setEmployerProfile({ ...employerProfile, companyType: e.target.value })}
                        >
                          <option value="">Select Type</option>
                          <option value="factory">Factory</option>
                          <option value="construction">Construction</option>
                          <option value="farm">Farm</option>
                          <option value="business">Business</option>
                          <option value="other">Other</option>
                        </Form.Select>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Contact Person</Form.Label>
                        <Form.Control
                          type="text"
                          value={employerProfile.contactPerson}
                          onChange={(e) => setEmployerProfile({ ...employerProfile, contactPerson: e.target.value })}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Website URL</Form.Label>
                        <Form.Control
                          type="url"
                          value={employerProfile.websiteUrl}
                          onChange={(e) => setEmployerProfile({ ...employerProfile, websiteUrl: e.target.value })}
                        />
                      </Form.Group>

                      <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? 'Updating...' : 'Update Employer Profile'}
                      </Button>
                    </Form>
                  </Card.Body>
                </Card>
              </Tab>
            )}

            <Tab eventKey="reviews" title="Reviews">
              <Card>
                <Card.Body>
                  <h5 className="mb-3">My Reviews</h5>
                  {reviews.length === 0 ? (
                    <p className="text-muted">No reviews yet</p>
                  ) : (
                    reviews.map((review) => (
                      <div key={review._id} className="border-bottom pb-3 mb-3">
                        <div className="d-flex justify-content-between">
                          <strong>Rating: {review.rating}/5 ⭐</strong>
                          <small className="text-muted">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </small>
                        </div>
                        {review.comment && <p className="mb-0 mt-2">{review.comment}</p>}
                      </div>
                    ))
                  )}
                </Card.Body>
              </Card>
            </Tab>
          </Tabs>
        </Col>

        <Col md={4}>
          <Card>
            <Card.Body>
              <h5>Account Summary</h5>
              <p><strong>Type:</strong> {user?.userType}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Member since:</strong> {new Date(user?.createdAt).toLocaleDateString()}</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
