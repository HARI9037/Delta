import api from './api'

export const getStudentDashboard  = ()       => api.get('/user/dashboard')
export const getStudentProfile    = ()       => api.get('/user/profile')
export const updateStudentProfile = (data)   => api.put('/user/profile', data)
export const getAllTeachers        = ()       => api.get('/user/teachers')
export const bookSlot             = (data)   => api.post('/user/bookings', data)
