import api from './axios'

export const getCases = (params) => api.get('/cases', { params })
export const getPublicCases = (params) => api.get('/cases/public', { params })
export const getAssociatedCases = (params) => api.get('/cases/associated', { params })
export const getCaseById = (id) => api.get(`/cases/${id}`)
export const createCase = (data) => api.post('/cases', data)
export const updateCase = (id, data) => api.put(`/cases/${id}`, data)
export const assignInvestigator = (id, data) => api.put(`/cases/${id}/assign`, data)
export const assignVictim = (id, data) => api.put(`/cases/${id}/assign-victim`, data)
export const updateCaseStatus = (id, data) => api.put(`/cases/${id}/status`, data)
export const deleteCase = (id) => api.delete(`/cases/${id}`)
