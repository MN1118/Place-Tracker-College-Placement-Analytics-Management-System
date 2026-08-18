import api from './api';

export const departmentsApi = {
  list: () => api.get('/departments'),
};

export const studentsApi = {
  list: (params) => api.get('/students', { params }),
  get: (id) => api.get(`/students/${id}`),
  update: (id, payload) => api.put(`/students/${id}`, payload),
};

export const companiesApi = {
  list: (params) => api.get('/companies', { params }),
  get: (id) => api.get(`/companies/${id}`),
  create: (payload) => api.post('/companies', payload),
  update: (id, payload) => api.put(`/companies/${id}`, payload),
};

export const jobsApi = {
  list: (params) => api.get('/jobs', { params }),
  get: (id) => api.get(`/jobs/${id}`),
  create: (payload) => api.post('/jobs', payload),
  update: (id, payload) => api.put(`/jobs/${id}`, payload),
  remove: (id) => api.delete(`/jobs/${id}`),
};

export const applicationsApi = {
  apply: (jobDriveId) => api.post('/applications', { jobDriveId }),
  my: () => api.get('/applications/my'),
  list: (params) => api.get('/applications', { params }),
  get: (id) => api.get(`/applications/${id}`),
  updateStatus: (id, payload) => api.put(`/applications/${id}/status`, payload),
};

export const interviewsApi = {
  list: (params) => api.get('/interviews', { params }),
  create: (payload) => api.post('/interviews', payload),
  update: (id, payload) => api.put(`/interviews/${id}`, payload),
};

export const placementsApi = {
  list: (params) => api.get('/placements', { params }),
  create: (payload) => api.post('/placements', payload),
};

export const analyticsApi = {
  overview: () => api.get('/analytics/overview'),
  departments: () => api.get('/analytics/departments'),
  companies: () => api.get('/analytics/companies'),
  packages: () => api.get('/analytics/packages'),
  placements: () => api.get('/analytics/placements'),
  demographics: () => api.get('/analytics/demographics'),
};

export const notificationsApi = {
  list: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

export const reportsApi = {
  overall: () => api.get('/reports/overall'),
  departments: () => api.get('/reports/departments'),
  companies: () => api.get('/reports/companies'),
  salary: () => api.get('/reports/salary'),
};
