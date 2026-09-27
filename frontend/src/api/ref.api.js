import api from './axios'

export const getAssignableUsers = (params) => api.get('/ref/assignable-users', { params })
export const getVictimUsers = (params) => api.get('/ref/victim-users', { params })
