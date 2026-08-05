import api from './api'

// ── Student ──────────────────────────────────────────────────────────
// Full payment history
export const getPayments       = ()     => api.get('/payment')

// Current-month payment status (creates record if missing)
export const getPaymentStatus  = ()     => api.get('/payment/status')

// Demo pay — simulate "Pay Now"
export const demoPayNow        = ()     => api.post('/payment/demo-pay')

// Legacy: upload receipt URL
export const uploadReceipt     = (data) => api.post('/payment/receipt', data)

// ── Config (public read) ─────────────────────────────────────────────
export const getPaymentConfig  = ()     => api.get('/payment/config')

// ── Admin (teacher role) ─────────────────────────────────────────────
export const updatePaymentConfig = (data) => api.put('/payment/config', data)
export const getAllPayments       = ()     => api.get('/payment/admin/all')
export const verifyPayment        = (id, data) => api.put(`/payment/admin/${id}/verify`, data || {})
export const rejectPayment        = (id, data) => api.put(`/payment/admin/${id}/reject`, data || {})
