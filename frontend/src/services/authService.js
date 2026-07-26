import api from './api'

// Student Auth
export const studentLogin    = (data) => api.post('/user/login', data)
export const studentRegister = (data) => api.post('/user/register', data)

// Teacher Auth
export const teacherLogin    = (data) => api.post('/teacher/login', data)
export const teacherRegister = (data) => api.post('/teacher/register', data)
