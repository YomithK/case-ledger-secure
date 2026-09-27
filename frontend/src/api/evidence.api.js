import api from './axios'

export const getCaseEvidence = (caseId) => api.get(`/cases/${caseId}/evidence`)
export const uploadEvidence = (caseId, formData) =>
  api.post(`/cases/${caseId}/evidence`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
export const getEvidenceById = (id) => api.get(`/evidence/${id}`)
export const updateEvidence = (id, data) => api.put(`/evidence/${id}`, data)
export const verifyEvidence = (id) => api.put(`/evidence/${id}/verify`)
export const deleteEvidence = (id) => api.delete(`/evidence/${id}`)
