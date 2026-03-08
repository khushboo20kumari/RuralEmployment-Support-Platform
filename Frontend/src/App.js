import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
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

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <Navbar />
            <ToastContainer position="top-right" autoClose={3000} />
            <Routes>
              <Route path="/" element={<Home />} />
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
                  <Applications />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/worker/payments" 
              element={
                <ProtectedRoute allowedRoles={['worker']}>
                  <WorkerPayments />
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
                  <PostJob />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/employer/payments" 
              element={
                <ProtectedRoute allowedRoles={['employer']}>
                  <EmployerPayments />
                </ProtectedRoute>
              } 
            />
            
            {/* Admin Routes */}
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Common Routes */}
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute allowedRoles={['worker', 'employer']}>
                  <Profile />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
