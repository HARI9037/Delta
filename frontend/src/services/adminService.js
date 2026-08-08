import api from './api'

export const getAdminDashboard         = ()             => api.get('/admin/dashboard')
export const getRegistrations         = (params)       => api.get('/admin/registrations', { params })
export const updateRegistrationStatus = (id, data)     => api.put(`/admin/registrations/${id}/status`, data)
export const getAllStudents           = (params)       => api.get('/admin/students', { params })
export const getStudentDetails        = (id)           => api.get(`/admin/students/${id}`)
export const getAllTeachers           = (params)       => api.get('/admin/teachers', { params })
export const getTeacherDetails        = (id)           => api.get(`/admin/teachers/${id}`)
export const getPendingBookings       = ()             => api.get('/admin/bookings/pending')
export const confirmOrRejectBooking   = (id, data)     => api.put(`/admin/bookings/${id}/status`, data)
export const getAllBookings           = (params)       => api.get('/admin/bookings', { params })
