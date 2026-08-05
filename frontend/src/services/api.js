import axios from 'axios'

// All API calls go to the backend running on port 5000.
// Vite proxy (vite.config.js) forwards /api to localhost:5000.
// Backend routes are mounted under /api (e.g. /api/user, /api/teacher, /api/payment).
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  try {
    const saved = localStorage.getItem('tms_user')
    if (saved) {
      const { token } = JSON.parse(saved)
      if (token) config.headers.Authorization = `Bearer ${token}`
    }
  } catch {
    // ignore parse errors
  }
  return config
})

// If server returns 401, clear storage and go to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('tms_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
