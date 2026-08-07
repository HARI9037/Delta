import api from './api'

export const getStudentDashboard  = ()       => api.get('/user/dashboard')
export const getStudentProfile    = ()       => api.get('/user/profile')
export const updateStudentProfile = (data)   => api.put('/user/profile', data)
export const uploadProfilePhoto   = (formData) => api.post('/user/profile/photo', formData, { headers: { 'Content-Type': undefined } })
export const getAllTeachers        = ()       => api.get('/user/teachers')
export const bookSlot             = (data)   => api.post('/user/bookings', data)
export const getNotifications     = ()       => api.get('/user/notifications')
export const markNotificationsRead = ()      => api.put('/user/notifications/read')
