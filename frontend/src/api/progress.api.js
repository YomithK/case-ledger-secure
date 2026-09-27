import api from './axios'

export const getCaseProgress = (caseId) => api.get(`/cases/${caseId}/progress`)
export const addCaseProgress = (caseId, data) => api.post(`/cases/${caseId}/progress`, data)
export const updateProgress = (progressId, data) => api.put(`/progress/${progressId}`, data)
export const deleteProgress = (progressId) => api.delete(`/progress/${progressId}`)
