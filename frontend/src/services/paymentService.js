import api from './api'

export const getPayments   = ()     => api.get('/payment')
export const uploadReceipt = (data) => api.post('/payment/receipt', data)
