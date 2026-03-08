import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './context/AuthContext';
import { AuthContext } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import DashboardLayout from './components/DashboardLayout';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import WorkerDashboard from './pages/WorkerDashboard';
import EmployerDashboard from './pages/EmployerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import JobList from './pages/JobList';
import JobDetails from './pages/JobDetails';
import PostJob from './pages/PostJob';
import Applications from './pages/Applications';
import Profile from './pages/Profile';
import EmployerPayments from './pages/EmployerPayments';
import WorkerPayments from './pages/WorkerPayments';
import ProtectedRoute from './components/ProtectedRoute';

const HomeResolver = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  if (!user) return <Home />;

  if (user.userType === 'worker') return <Navigate to="/worker/dashboard" replace />;
  if (user.userType === 'employer') return <Navigate to="/employer/dashboard" replace />;
  if (user.userType === 'admin') return <Navigate to="/admin/dashboard" replace />;

  return <Home />;
};

const RolePageLayout = ({ children }) => {
  const { user } = useContext(AuthContext);

  if (!user) return children;

  const menuByRole = {
    worker: [
      { to: '/worker/dashboard', label: 'Dashboard', icon: '🏠' },
      { to: '/jobs', label: 'Find Jobs', icon: '🔍' },
      { to: '/worker/applications', label: 'My Applications', icon: '📋' },
      { to: '/worker/payments', label: 'My Earnings', icon: '💳' },
      { to: '/profile', label: 'Account', icon: '👤' },
    ],
    employer: [
      { to: '/employer/dashboard', label: 'Dashboard', icon: '🏠' },
      { to: '/employer/post-job', label: 'Post New Job', icon: '➕' },
      { to: '/employer/payments', label: 'Payments', icon: '💳' },
      { to: '/jobs', label: 'Public Jobs', icon: '📋' },
      { to: '/profile', label: 'Account', icon: '👤' },
    ],
    admin: [
      { to: '/admin/dashboard', label: 'Dashboard', icon: '🏠' },
    ],
  };

  const titleByRole = {
    worker: '👷 Worker Panel',
    employer: '🏢 Employer Panel',
    admin: '👨‍⚖️ Admin Panel',
  };

  const subtitleByRole = {
    worker: 'Use left options easily',
    employer: 'Manage jobs from left menu',
    admin: 'Platform controls in one place',
  };

  return (
    <div className="py-4 px-2 px-md-3">
      <DashboardLayout
        title={titleByRole[user.userType] || 'Dashboard'}
        subtitle={subtitleByRole[user.userType] || ''}
        menuItems={menuByRole[user.userType] || []}
        accountInfo={{
          name: user.name,
          email: user.email,
          type: user.userType,
        }}
      >
        {children}
      </DashboardLayout>
    </div>
  );
};

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <Navbar />
            <ToastContainer position="top-right" autoClose={3000} />
            <Routes>
              <Route path="/" element={<HomeResolver />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/jobs" element={<JobList />} />
              <Route path="/jobs/:id" element={<JobDetails />} />
            
            {/* Worker Routes */}
            <Route 
              path="/worker/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['worker']}>
                  <WorkerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/worker/applications" 
              element={
                <ProtectedRoute allowedRoles={['worker']}>
                  <RolePageLayout>
                    <Applications />
                  </RolePageLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/worker/payments" 
              element={
                <ProtectedRoute allowedRoles={['worker']}>
                  <RolePageLayout>
                    <WorkerPayments />
                  </RolePageLayout>
                </ProtectedRoute>
              } 
            />
            
            {/* Employer Routes */}
            <Route 
              path="/employer/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['employer']}>
                  <EmployerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/employer/post-job" 
              element={
                <ProtectedRoute allowedRoles={['employer']}>
                  <RolePageLayout>
                    <PostJob />
                  </RolePageLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/employer/payments" 
              element={
                <ProtectedRoute allowedRoles={['employer']}>
                  <RolePageLayout>
                    <EmployerPayments />
                  </RolePageLayout>
                </ProtectedRoute>
              } 
            />
            
            {/* Admin Routes */}
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <RolePageLayout>
                    <AdminDashboard />
                  </RolePageLayout>
                </ProtectedRoute>
              } 
            />
            
            {/* Common Routes */}
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute allowedRoles={['worker', 'employer']}>
                  <RolePageLayout>
                    <Profile />
                  </RolePageLayout>
                </ProtectedRoute>
              } 
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
