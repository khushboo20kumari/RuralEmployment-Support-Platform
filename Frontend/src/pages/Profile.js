import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Container, Row, Col, Card, Form, Button, Tabs, Tab, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { authAPI, workerAPI, employerAPI, reviewAPI } from '../services/api';
import { useLanguage } from '../hooks/useLanguage';

const Profile = () => {
  const navigate = useNavigate();
  const { user, loadUser } = useContext(AuthContext);
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  
  const [userProfile, setUserProfile] = useState({
    name: '',
    phone: '',
    userType: 'worker',
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

  const skillOptions = [
    { value: 'construction_labour', labelHi: 'निर्माण मजदूरी', labelEn: 'Construction Labour' },
    { value: 'factory_helper', labelHi: 'फैक्ट्री हेल्पर', labelEn: 'Factory Helper' },
    { value: 'farm_worker', labelHi: 'खेती मजदूर', labelEn: 'Farm Worker' },
    { value: 'domestic_help', labelHi: 'घरेलू काम', labelEn: 'Domestic Help' },
    { value: 'other', labelHi: 'अन्य काम', labelEn: 'Other Work' },
  ];

  const availabilityOptions = [
    { value: 'full_time', labelHi: 'पूरा समय', labelEn: 'Full Time' },
    { value: 'part_time', labelHi: 'आधा समय', labelEn: 'Part Time' },
    { value: 'seasonal', labelHi: 'मौसमी', labelEn: 'Seasonal' },
    { value: 'flexible', labelHi: 'लचीला', labelEn: 'Flexible' },
  ];

  const companyTypeOptions = [
    { value: '', labelHi: 'चुनें', labelEn: 'Select Type' },
    { value: 'factory', labelHi: 'फैक्ट्री', labelEn: 'Factory' },
    { value: 'construction', labelHi: 'कंस्ट्रक्शन', labelEn: 'Construction' },
    { value: 'farm', labelHi: 'खेती', labelEn: 'Farm' },
    { value: 'business', labelHi: 'दुकान/व्यापार', labelEn: 'Business' },
    { value: 'other', labelHi: 'अन्य', labelEn: 'Other' },
  ];

  const getLabel = (item) => (language === 'hi' ? item.labelHi : item.labelEn);

  const fetchProfile = useCallback(async () => {
    try {
      const userRes = await authAPI.getMe();
      setUserProfile({
        name: userRes.data.user.name,
        phone: userRes.data.user.phone,
        userType: userRes.data.user.userType || 'worker',
      });

      if (userRes.data.user.userType === 'worker') {
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
      } else if (userRes.data.user.userType === 'employer') {
        const employerRes = await employerAPI.getProfile();
        setEmployerProfile({
          companyName: employerRes.data.employer.companyName || '',
          companyType: employerRes.data.employer.companyType || '',
          contactPerson: employerRes.data.employer.contactPerson || '',
          websiteUrl: employerRes.data.employer.websiteUrl || '',
        });
      }
    } catch (error) {
      toast.error(language === 'hi' ? 'प्रोफाइल लोड करने में दिक्कत हुई' : 'Error loading profile');
    }
  }, [language]);

  const fetchReviews = useCallback(async () => {
    try {
      const response = await reviewAPI.getMyReviews();
      setReviews(response.data.reviews);
    } catch (error) {
      console.error('Error fetching reviews', error);
    }
  }, []);

  useEffect(() => {
    if (!user?._id || !user?.userType) return;
    fetchProfile();
    fetchReviews();
  }, [user?._id, user?.userType, fetchProfile, fetchReviews]);

  const toggleSkill = (value) => {
    const exists = workerProfile.skills.includes(value);
    setWorkerProfile({
      ...workerProfile,
      skills: exists
        ? workerProfile.skills.filter((s) => s !== value)
        : [...workerProfile.skills, value],
    });
  };

  const handleUserProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const previousUserType = user?.userType;
      await authAPI.updateProfile(userProfile);
      await loadUser();
      toast.success(language === 'hi' ? 'मूल जानकारी सफलतापूर्वक अपडेट हुई' : 'Basic profile updated successfully');

      if (userProfile.userType && userProfile.userType !== previousUserType) {
        toast.info(language === 'hi' ? 'रोल अपडेट हो गया, सही डैशबोर्ड खोला जा रहा है' : 'Role updated, opening your dashboard');
        navigate(userProfile.userType === 'employer' ? '/employer/dashboard' : '/worker/dashboard');
      }
    } catch (error) {
      toast.error(language === 'hi' ? 'प्रोफाइल अपडेट नहीं हो पाई' : 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handleWorkerProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await workerAPI.updateProfile(workerProfile);
      toast.success(language === 'hi' ? 'काम की जानकारी सफलतापूर्वक सेव हो गई' : 'Worker profile updated successfully');
    } catch (error) {
      toast.error(language === 'hi' ? 'काम की जानकारी अपडेट नहीं हो पाई' : 'Error updating worker profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEmployerProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await employerAPI.updateProfile(employerProfile);
      toast.success(language === 'hi' ? 'कंपनी जानकारी सफलतापूर्वक सेव हो गई' : 'Employer profile updated successfully');
    } catch (error) {
      toast.error(language === 'hi' ? 'कंपनी जानकारी अपडेट नहीं हो पाई' : 'Error updating employer profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Container className="my-5 text-center">
        <div className="spinner-border text-primary" role="status" />
      </Container>
    );
  }

  return (
    <div style={{ background: '#f6f7f9', minHeight: '100vh', padding: '32px 0' }}>
      <Container>
        <Card className="profile-header-card mb-4" style={{ border: 'none', borderRadius: 18, boxShadow: '0 2px 12px #bae6fd33', background: '#e0f2fe' }}>
          <Card.Body className="d-flex align-items-center gap-4 p-4">
            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name||'U')}&background=0ea5e9&color=fff&rounded=true&size=80`} alt="avatar" style={{ width: 80, height: 80, borderRadius: '50%', boxShadow: '0 2px 8px #bae6fd33', border: '3px solid #fff' }} />
            <div>
              <h2 className="fw-bold mb-1" style={{ color: '#0ea5e9', fontSize: '2.1rem', letterSpacing: 0.5 }}>{language === 'hi' ? 'मेरी प्रोफाइल' : 'My Profile'}</h2>
              <div className="text-muted mb-1" style={{ fontSize: '1.08rem' }}>{user?.email}</div>
              <div style={{ fontSize: 15, color: '#059669', fontWeight: 600 }}>{user?.userType === 'worker' ? (language === 'hi' ? 'मज़दूर' : 'Worker') : (language === 'hi' ? 'मालिक' : 'Employer')}</div>
            </div>
          </Card.Body>
        </Card>
        <p className="text-muted mb-4" style={{ fontSize: 17 }}>
          {language === 'hi'
            ? 'सिर्फ जरूरी जानकारी भरें। जितनी साफ प्रोफाइल होगी, उतनी जल्दी काम मिलेगा।'
            : 'Fill only needed details. A clear profile helps you get work faster.'}
        </p>
        <Row>
          <Col md={8}>
          <Tabs defaultActiveKey="basic" className="mb-3">
            <Tab eventKey="basic" title={language === 'hi' ? '1) जरूरी जानकारी' : '1) Basic Info'}>
              <Card className="simple-profile-card">
                <Card.Body>
                  <Form onSubmit={handleUserProfileUpdate}>
                    <h6 className="mb-3">
                      {language === 'hi' ? 'नाम और मोबाइल सही रखें' : 'Keep your name and mobile correct'}
                    </h6>

                    <Form.Group className="mb-3">
                      <Form.Label>{language === 'hi' ? 'पूरा नाम' : 'Full Name'}</Form.Label>
                      <Form.Control
                        type="text"
                        value={userProfile.name}
                        placeholder={language === 'hi' ? 'अपना पूरा नाम लिखें' : 'Enter your full name'}
                        onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>{language === 'hi' ? 'मोबाइल नंबर' : 'Mobile Number'}</Form.Label>
                      <Form.Control
                        type="tel"
                        value={userProfile.phone}
                        placeholder={language === 'hi' ? '10 अंकों का नंबर लिखें' : 'Enter 10-digit mobile number'}
                        onChange={(e) => setUserProfile({ ...userProfile, phone: e.target.value })}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>{language === 'hi' ? 'मैं कौन हूँ?' : 'I am a'}</Form.Label>
                      <Form.Select
                        value={userProfile.userType}
                        onChange={(e) => setUserProfile({ ...userProfile, userType: e.target.value })}
                      >
                        <option value="worker">👷 {language === 'hi' ? 'काम करने वाला (Worker)' : 'Worker (Looking for jobs)'}</option>
                        <option value="employer">🏢 {language === 'hi' ? 'काम देने वाला (Employer)' : 'Employer (Hiring workers)'}</option>
                      </Form.Select>
                      <Form.Text className="text-muted">
                        {language === 'hi'
                          ? 'रोल चुनने के बाद आपका डैशबोर्ड उसी हिसाब से दिखेगा।'
                          : 'Your dashboard will update based on selected role.'}
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>{language === 'hi' ? 'ईमेल' : 'Email'}</Form.Label>
                      <Form.Control
                        type="email"
                        value={user?.email}
                        disabled
                      />
                      <Form.Text className="text-muted">
                        {language === 'hi' ? 'ईमेल बदला नहीं जा सकता' : 'Email cannot be changed'}
                      </Form.Text>
                    </Form.Group>

                    <Button variant="primary" type="submit" disabled={loading}>
                      {loading
                        ? (language === 'hi' ? 'सेव हो रहा है...' : 'Saving...')
                        : (language === 'hi' ? 'जानकारी सेव करें' : 'Save Basic Info')}
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </Tab>

            {user.userType === 'worker' && (
              <Tab eventKey="worker" title={language === 'hi' ? '2) काम की जानकारी' : '2) Work Details'}>
                <Card className="simple-profile-card">
                  <Card.Body>
                    <Form onSubmit={handleWorkerProfileUpdate}>
                      <h6 className="mb-2">
                        {language === 'hi' ? 'आपको जो काम आता है, उसे टिक करें' : 'Tick only the work you can do'}
                      </h6>

                      <Form.Group className="mb-3">
                        <Form.Label>{language === 'hi' ? 'कौशल (Skills)' : 'Skills'}</Form.Label>
                        <div className="simple-skill-grid">
                          {skillOptions.map((skill) => (
                            <div className="simple-skill-item" key={skill.value}>
                              <Form.Check
                                id={`skill-${skill.value}`}
                                type="checkbox"
                                checked={workerProfile.skills.includes(skill.value)}
                                onChange={() => toggleSkill(skill.value)}
                                label={getLabel(skill)}
                              />
                            </div>
                          ))}
                        </div>
                        <Form.Text className="text-muted">
                          {language === 'hi'
                            ? 'एक से ज़्यादा काम भी चुन सकते हैं।'
                            : 'You can select more than one skill.'}
                        </Form.Text>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>{language === 'hi' ? 'अनुभव (साल में)' : 'Experience (years)'}</Form.Label>
                        <Form.Control
                          type="number"
                          min="0"
                          value={workerProfile.experience}
                          placeholder={language === 'hi' ? 'जैसे: 2' : 'Example: 2'}
                          onChange={(e) => setWorkerProfile({ ...workerProfile, experience: e.target.value })}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>{language === 'hi' ? 'काम का छोटा विवरण' : 'Short work details'}</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          placeholder={language === 'hi' ? 'जैसे: 2 साल निर्माण का काम किया है' : 'Example: Worked 2 years in construction'}
                          value={workerProfile.experienceDetails}
                          onChange={(e) => setWorkerProfile({ ...workerProfile, experienceDetails: e.target.value })}
                        />
                      </Form.Group>

                      <h6 className="mb-3">{language === 'hi' ? 'अपनी मजदूरी भरें (₹)' : 'Enter your expected wage (₹)'}</h6>

                      <Row>
                        <Col md={4}>
                          <Form.Group className="mb-3">
                            <Form.Label>{language === 'hi' ? 'घंटे की दर' : 'Hourly Rate'}</Form.Label>
                            <Form.Control
                              type="number"
                              min="0"
                              value={workerProfile.hourlyRate}
                              placeholder={language === 'hi' ? '₹/घंटा' : '₹/hour'}
                              onChange={(e) => setWorkerProfile({ ...workerProfile, hourlyRate: e.target.value })}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group className="mb-3">
                            <Form.Label>{language === 'hi' ? 'दिन की दर' : 'Daily Rate'}</Form.Label>
                            <Form.Control
                              type="number"
                              min="0"
                              value={workerProfile.dailyRate}
                              placeholder={language === 'hi' ? '₹/दिन' : '₹/day'}
                              onChange={(e) => setWorkerProfile({ ...workerProfile, dailyRate: e.target.value })}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group className="mb-3">
                            <Form.Label>{language === 'hi' ? 'महीने की दर' : 'Monthly Rate'}</Form.Label>
                            <Form.Control
                              type="number"
                              min="0"
                              value={workerProfile.monthlyRate}
                              placeholder={language === 'hi' ? '₹/महीना' : '₹/month'}
                              onChange={(e) => setWorkerProfile({ ...workerProfile, monthlyRate: e.target.value })}
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <Form.Group className="mb-3">
                        <Form.Label>{language === 'hi' ? 'उपलब्धता' : 'Availability'}</Form.Label>
                        <Form.Select
                          value={workerProfile.availability}
                          onChange={(e) => setWorkerProfile({ ...workerProfile, availability: e.target.value })}
                        >
                          {availabilityOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {getLabel(option)}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>

                      <Button variant="primary" type="submit" disabled={loading}>
                        {loading
                          ? (language === 'hi' ? 'सेव हो रहा है...' : 'Saving...')
                          : (language === 'hi' ? 'काम की जानकारी सेव करें' : 'Save Work Details')}
                      </Button>
                    </Form>
                  </Card.Body>
                </Card>
              </Tab>
            )}

            {user.userType === 'employer' && (
              <Tab eventKey="employer" title={language === 'hi' ? '2) कंपनी जानकारी' : '2) Company Details'}>
                <Card className="simple-profile-card">
                  <Card.Body>
                    <Form onSubmit={handleEmployerProfileUpdate}>
                      <h6 className="mb-3">{language === 'hi' ? 'कंपनी की साफ जानकारी भरें' : 'Fill clear company details'}</h6>

                      <Form.Group className="mb-3">
                        <Form.Label>{language === 'hi' ? 'कंपनी का नाम' : 'Company Name'}</Form.Label>
                        <Form.Control
                          type="text"
                          value={employerProfile.companyName}
                          placeholder={language === 'hi' ? 'जैसे: शर्मा कंस्ट्रक्शन' : 'Example: Sharma Construction'}
                          onChange={(e) => setEmployerProfile({ ...employerProfile, companyName: e.target.value })}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>{language === 'hi' ? 'कंपनी का प्रकार' : 'Company Type'}</Form.Label>
                        <Form.Select
                          value={employerProfile.companyType}
                          onChange={(e) => setEmployerProfile({ ...employerProfile, companyType: e.target.value })}
                        >
                          {companyTypeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {getLabel(option)}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>{language === 'hi' ? 'संपर्क व्यक्ति का नाम' : 'Contact Person'}</Form.Label>
                        <Form.Control
                          type="text"
                          value={employerProfile.contactPerson}
                          placeholder={language === 'hi' ? 'जैसे: राम शर्मा' : 'Example: Ram Sharma'}
                          onChange={(e) => setEmployerProfile({ ...employerProfile, contactPerson: e.target.value })}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>{language === 'hi' ? 'वेबसाइट (अगर है)' : 'Website (optional)'}</Form.Label>
                        <Form.Control
                          type="url"
                          value={employerProfile.websiteUrl}
                          placeholder={language === 'hi' ? 'जैसे: https://example.com' : 'Example: https://example.com'}
                          onChange={(e) => setEmployerProfile({ ...employerProfile, websiteUrl: e.target.value })}
                        />
                      </Form.Group>

                      <Button variant="primary" type="submit" disabled={loading}>
                        {loading
                          ? (language === 'hi' ? 'सेव हो रहा है...' : 'Saving...')
                          : (language === 'hi' ? 'कंपनी जानकारी सेव करें' : 'Save Company Details')}
                      </Button>
                    </Form>
                  </Card.Body>
                </Card>
              </Tab>
            )}

            <Tab eventKey="reviews" title={language === 'hi' ? '3) रेटिंग और राय' : '3) Ratings & Reviews'}>
              <Card className="simple-profile-card">
                <Card.Body>
                  <h5 className="mb-3">{language === 'hi' ? 'मेरी रेटिंग' : 'My Reviews'}</h5>
                  {reviews.length === 0 ? (
                    <p className="text-muted">{language === 'hi' ? 'अभी कोई रेटिंग नहीं मिली।' : 'No reviews yet.'}</p>
                  ) : (
                    reviews.map((review) => (
                      <div key={review._id} className="border-bottom pb-3 mb-3">
                        <div className="d-flex justify-content-between">
                          <strong>
                            {language === 'hi' ? 'रेटिंग' : 'Rating'}: {review.rating}/5 {'⭐'.repeat(review.rating)}
                          </strong>
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
          <Card className="simple-profile-summary">
            <Card.Body>
              <h5>{language === 'hi' ? 'खाता सारांश' : 'Account Summary'}</h5>
              <p>
                <strong>{language === 'hi' ? 'प्रकार' : 'Type'}:</strong>{' '}
                <Badge bg="secondary">
                  {user?.userType === 'worker'
                    ? (language === 'hi' ? 'मज़दूर' : 'Worker')
                    : user?.userType === 'employer'
                    ? (language === 'hi' ? 'मालिक' : 'Employer')
                    : (language === 'hi' ? 'यूज़र' : 'User')}
                </Badge>
              </p>
              <p><strong>{language === 'hi' ? 'ईमेल' : 'Email'}:</strong> {user?.email}</p>
              <p>
                <strong>{language === 'hi' ? 'जुड़ने की तारीख' : 'Member since'}:</strong>{' '}
                {new Date(user?.createdAt).toLocaleDateString()}
              </p>

              {user?.userType === 'worker' && (
                <div className="mt-3">
                  <h6>{language === 'hi' ? 'झटपट सलाह' : 'Quick Tips'}</h6>
                  <ul className="small text-muted ps-3 mb-0">
                    <li>{language === 'hi' ? 'मोबाइल नंबर हमेशा सही रखें' : 'Keep mobile number updated'}</li>
                    <li>{language === 'hi' ? 'कम से कम 2 कौशल चुनें' : 'Select at least 2 skills'}</li>
                    <li>{language === 'hi' ? 'दैनिक दर जरूर भरें' : 'Add your daily wage'}</li>
                  </ul>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Profile;
