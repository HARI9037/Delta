import api from './api'

export const getAdminAnnouncements    = ()         => api.get('/announcements/admin')
export const getActiveAnnouncements   = ()         => api.get('/announcements/active')
export const createAnnouncement        = (data)     => api.post('/announcements', data)
export const updateAnnouncement        = (id, data) => api.put(`/announcements/${id}`, data)
export const deleteAnnouncement        = (id)       => api.delete(`/announcements/${id}`)
export const togglePublishAnnouncement = (id)       => api.put(`/announcements/${id}/publish`)
