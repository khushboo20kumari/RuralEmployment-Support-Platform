import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Auth API
export const authAPI = {
  register: (data) => axios.post(`${API_URL}/auth/register`, data),
  login: (data) => axios.post(`${API_URL}/auth/login`, data),
  getMe: () => axios.get(`${API_URL}/auth/me`, { headers: getAuthHeader() }),
  updateProfile: (data) => axios.put(`${API_URL}/auth/update-profile`, data, { headers: getAuthHeader() }),
};

// Worker API
export const workerAPI = {
  getProfile: () => axios.get(`${API_URL}/workers/profile/me`, { headers: getAuthHeader() }),
  updateProfile: (data) => axios.put(`${API_URL}/workers/profile/update`, data, { headers: getAuthHeader() }),
  getAll: (params) => axios.get(`${API_URL}/workers`, { params }),
  getById: (id) => axios.get(`${API_URL}/workers/${id}`),
};

// Employer API
export const employerAPI = {
  getProfile: () => axios.get(`${API_URL}/employers/profile/me`, { headers: getAuthHeader() }),
  updateProfile: (data) => axios.put(`${API_URL}/employers/profile/update`, data, { headers: getAuthHeader() }),
  getAll: (params) => axios.get(`${API_URL}/employers`, { params }),
  getById: (id) => axios.get(`${API_URL}/employers/${id}`),
};

// Job API
export const jobAPI = {
  getAll: (params) => axios.get(`${API_URL}/jobs`, { params }),
  getById: (id) => axios.get(`${API_URL}/jobs/${id}`),
  create: (data) => axios.post(`${API_URL}/jobs`, data, { headers: getAuthHeader() }),
  getMyJobs: () => axios.get(`${API_URL}/jobs/my-jobs/list`, { headers: getAuthHeader() }),
  update: (id, data) => axios.put(`${API_URL}/jobs/${id}`, data, { headers: getAuthHeader() }),
  close: (id) => axios.patch(`${API_URL}/jobs/${id}/close`, {}, { headers: getAuthHeader() }),
};

// Application API
export const applicationAPI = {
  apply: (jobId, data) => axios.post(`${API_URL}/applications/apply/${jobId}`, data, { headers: getAuthHeader() }),
  getMyApplications: (params) => axios.get(`${API_URL}/applications/my-applications/list`, { headers: getAuthHeader(), params }),
  getWorkerApplications: (params) => axios.get(`${API_URL}/applications/worker/list`, { headers: getAuthHeader(), params }),
  getJobApplications: (jobId, params) => axios.get(`${API_URL}/applications/job/${jobId}/applications`, { headers: getAuthHeader(), params }),
  updateStatus: (applicationId, data) => axios.put(`${API_URL}/applications/${applicationId}/status`, data, { headers: getAuthHeader() }),
  markAsCompleted: (applicationId) => axios.put(`${API_URL}/applications/${applicationId}/complete`, {}, { headers: getAuthHeader() }),
  accept: (applicationId) => axios.put(`${API_URL}/applications/${applicationId}/accept`, {}, { headers: getAuthHeader() }),
  reject: (applicationId) => axios.put(`${API_URL}/applications/${applicationId}/reject`, {}, { headers: getAuthHeader() }),
  cancel: (applicationId) => axios.delete(`${API_URL}/applications/${applicationId}/cancel`, { headers: getAuthHeader() }),
};

// Payment API
export const paymentAPI = {
  createAdvance: (data) => axios.post(`${API_URL}/payments/advance`, data, { headers: getAuthHeader() }),
  releasePayment: (paymentId) => axios.put(`${API_URL}/payments/${paymentId}/release`, {}, { headers: getAuthHeader() }),
  getEligibleApplications: () => axios.get(`${API_URL}/payments/eligible-applications/list`, { headers: getAuthHeader() }),
  getWorkerPayments: (params) => axios.get(`${API_URL}/payments/worker/earnings`, { headers: getAuthHeader(), params }),
  getEmployerPayments: (params) => axios.get(`${API_URL}/payments/my-payments/list`, { headers: getAuthHeader(), params }),
  getDetails: (paymentId) => axios.get(`${API_URL}/payments/${paymentId}/details`, { headers: getAuthHeader() }),
};

// Review API
export const reviewAPI = {
  create: (data) => axios.post(`${API_URL}/reviews`, data, { headers: getAuthHeader() }),
  getForUser: (userId) => axios.get(`${API_URL}/reviews/user/${userId}`),
  getMyReviews: () => axios.get(`${API_URL}/reviews/my-reviews/list`, { headers: getAuthHeader() }),
};

// Admin API
export const adminAPI = {
  getPendingJobs: () => axios.get(`${API_URL}/admin/jobs/pending`, { headers: getAuthHeader() }),
  approveJob: (jobId) => axios.put(`${API_URL}/admin/jobs/${jobId}/approve`, {}, { headers: getAuthHeader() }),
  rejectJob: (jobId) => axios.put(`${API_URL}/admin/jobs/${jobId}/reject`, {}, { headers: getAuthHeader() }),
  getAllUsers: () => axios.get(`${API_URL}/admin/users`, { headers: getAuthHeader() }),
  getAnalytics: () => axios.get(`${API_URL}/admin/analytics`, { headers: getAuthHeader() }),
  getUserStats: (userId) => axios.get(`${API_URL}/admin/users/${userId}/stats`, { headers: getAuthHeader() }),
};
