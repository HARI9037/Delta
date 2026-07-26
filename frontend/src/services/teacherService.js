import api from './api'

export const getTeacherDashboard  = ()         => api.get('/teacher/dashboard')
export const getTeacherProfile    = ()         => api.get('/teacher/profile')
export const updateTeacherProfile = (data)     => api.put('/teacher/profile', data)
export const getAssignedStudents  = ()         => api.get('/teacher/students')
export const getAvailability      = ()         => api.get('/teacher/availability')
export const addAvailability      = (data)     => api.post('/teacher/availability', data)
export const updateAvailability   = (id, data) => api.put(`/teacher/availability/${id}`, data)
export const deleteAvailability   = (id)       => api.delete(`/teacher/availability/${id}`)
