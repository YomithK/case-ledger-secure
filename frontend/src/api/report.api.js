import api from './axios'

// Dashboard
export const getDashboardSummary = () => api.get('/reports/dashboard/summary')

// Case analytics
export const getCasesByStatus = (params) => api.get('/reports/cases/by-status', { params })
export const getCasesByPriority = (params) => api.get('/reports/cases/by-priority', { params })
export const getCasesByCategory = (params) => api.get('/reports/cases/by-category', { params })
export const getMonthlyCases = (params) => api.get('/reports/cases/monthly', { params })
export const getYearlyCases = (params) => api.get('/reports/cases/yearly', { params })
export const getAverageResolutionTime = (params) => api.get('/reports/cases/average-resolution-time', { params })
export const getLongestOpenCases = (params) => api.get('/reports/cases/longest-open', { params })

// Investigator performance
export const getInvestigatorPerformance = (id, params) =>
  api.get(`/reports/investigator/${id}/performance`, { params })

// Evidence analytics
export const getEvidenceDistribution = (params) => api.get('/reports/evidence/distribution', { params })
export const getEvidenceVerificationRatio = (params) =>
  api.get('/reports/evidence/verification-ratio', { params })

// Saved reports CRUD
export const getSavedReports = () => api.get('/reports')
export const getSavedReportById = (id) => api.get(`/reports/${id}`)
export const createSavedReport = (data) => api.post('/reports', data)
export const updateSavedReport = (id, data) => api.put(`/reports/${id}`, data)
export const deleteSavedReport = (id) => api.delete(`/reports/${id}`)

// CSV download
export const downloadCasesCsv = (params) =>
  api.get('/reports/cases/download', { params, responseType: 'blob' })

export const downloadSavedReport = (id) =>
  api.get(`/reports/${id}/download`, { responseType: 'blob' })
