import api from './axios'

export const getUsers = (params) => api.get('/users', { params })
export const getUserById = (id) => api.get(`/users/${id}`)
export const updateUser = (id, data) => api.put(`/users/${id}`, data)
export const updateUserRole = (id, data) => api.put(`/users/${id}/role`, data)
export const deleteUser = (id) => api.delete(`/users/${id}`)
export const uploadProfilePhoto = (id, formData) =>
  api.post(`/users/${id}/profile-photo`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
