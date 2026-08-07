import api from './api'

export const getTeacherDashboard  = ()             => api.get('/teacher/dashboard')
export const getTeacherProfile    = ()             => api.get('/teacher/profile')
export const updateTeacherProfile = (data)         => api.put('/teacher/profile', data)
export const uploadProfilePhoto   = (formData)     => api.post('/teacher/profile/photo', formData, { headers: { 'Content-Type': undefined } })
export const getAssignedStudents  = ()             => api.get('/teacher/students')
export const notifyStudent        = (studentId, message) => api.post(`/teacher/students/${studentId}/notify`, { message })
export const getAvailability      = ()             => api.get('/teacher/availability')
export const addAvailability      = (data)         => api.post('/teacher/availability', data)
export const updateAvailability   = (id, data)     => api.put(`/teacher/availability/${id}`, data)
export const deleteAvailability   = (id)           => api.delete(`/teacher/availability/${id}`)
export const getTeacherBookings   = (status)       => api.get('/teacher/bookings', { params: status ? { status } : {} })
