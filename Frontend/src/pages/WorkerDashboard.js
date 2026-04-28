// import React, { useState, useEffect, useContext } from 'react';
// import { Container, Row, Col, Card, Button } from 'react-bootstrap';
// import { Link } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import { applicationAPI, workerAPI, paymentAPI, messageAPI } from '../services/api';
// import { useLanguage } from '../hooks/useLanguage';
// import { AuthContext } from '../context/AuthContext';

// const WorkerDashboard = () => {
//   const { t } = useLanguage();
//   const { user } = useContext(AuthContext);
//   const [stats, setStats] = useState({
//     activeApplications: 0,
//     acceptedApplications: 0,
//     completedJobs: 0,
//     totalEarnings: 0,
//   });
//   const [applications, setApplications] = useState([]);
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [profileCompletion, setProfileCompletion] = useState(0);
//   const [completingId, setCompletingId] = useState(null);
//   const [unreadCount, setUnreadCount] = useState(0);

//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   const handleMarkCompleted = async (applicationId) => {
//     if (!window.confirm(t('workerDashboard.markCompletedConfirm'))) {
//       return;
//     }
//     setCompletingId(applicationId);
//     try {
//       await applicationAPI.markAsCompleted(applicationId);
//       toast.success(t('workerDashboard.completedSuccess'));
//       fetchDashboardData();
//     } catch (error) {
//       toast.error(error.response?.data?.message || t('workerDashboard.completedError'));
//     } finally {
//       setCompletingId(null);
//     }
//   };

//   const fetchDashboardData = async () => {
//     try {
//       const [applicationsRes, paymentsRes, profileRes] = await Promise.all([
//         applicationAPI.getWorkerApplications(),
//         paymentAPI.getWorkerPayments(),
//         workerAPI.getProfile(),
//       ]);
//       const apps = applicationsRes.data.applications || [];
//       const payments = paymentsRes.data.payments || [];
//       const profile = profileRes.data.worker;
//       setApplications(apps);
//       setProfile(profile);
//       // Calculate stats
//       const active = apps.filter((a) => ['applied', 'shortlisted'].includes(a.status)).length;
//       const accepted = apps.filter((a) => a.status === 'accepted').length;
//       const completed = apps.filter((a) => a.status === 'completed').length;
//       const earnings = payments
//         .filter((p) => p.status === 'completed')
//         .reduce((sum, p) => sum + (p.netAmount || 0), 0);
//       setStats({
//         activeApplications: active,
//         acceptedApplications: accepted,
//         completedJobs: completed,
//         totalEarnings: earnings,
//       });
//       // Calculate profile completion
//       const fields = [
//         profile?.skills?.length > 0,
//         profile?.experience,
//         profile?.dailyRate,
//         profile?.monthlyRate,
//         profile?.availability,
//       ];
//       const completion = (fields.filter(Boolean).length / fields.length) * 100;
//       setProfileCompletion(Math.round(completion));
//       try {
//         const unreadRes = await messageAPI.getUnreadCount();
//         setUnreadCount(Number(unreadRes.data?.unreadCount || 0));
//       } catch (e) {
//         setUnreadCount(0);
//       }
//     } catch (error) {
//       toast.error('Failed to load dashboard');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <Container className="my-5 text-center">
//         <div className="spinner-border text-primary" role="status" />
//       </Container>
//     );
//   }

//   return (
//     <Container className="py-5 text-center" style={{ minHeight: '100vh', background: '#f6f7f9' }}>
//       <h3 className="mb-4">👷 Worker Dashboard</h3>
//       {/* Dashboard content removed as per request */}
//     </Container>
//   );
// };

// export default WorkerDashboard;
