import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { studentLogin, teacherLogin } from '../../services/authService'
import AlertMessage from '../Common/AlertMessage'

export default function Login() {
  const [searchParams] = useSearchParams()
  const role = searchParams.get('role') === 'teacher' ? 'teacher' : 'student'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email || !password) { setError('Please fill in all fields'); return }
    setError('')
    setLoading(true)

    try {
      const fn = role === 'teacher' ? teacherLogin : studentLogin
      const res = await fn({ email, password })
      const data = res.data?.data || {}

      // Backend returns { token, student } or { token, teacher }
      const userObj = data.student || data.teacher || {}
      login({ ...userObj, token: data.token, role })

      navigate(role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard', { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const isTeacher = role === 'teacher'

  return (
    <div className="auth-wrapper">
      {/* Left panel */}
      <div className="auth-left">
        <div className="text-center">
          <h3 className="fw-bold mb-2">
            DEL<span style={{ color: 'var(--accent)' }}>TA</span>
          </h3>
          <div
            className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
            style={{ width: 80, height: 80, background: 'rgba(255,255,255,0.1)', fontSize: '2rem' }}
          >
            <i className={`bi ${isTeacher ? 'bi-person-video3' : 'bi-mortarboard-fill'}`}></i>
          </div>
          <h5 className="fw-semibold">{isTeacher ? 'Teacher Portal' : 'Student Portal'}</h5>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', maxWidth: 280 }}>
            {isTeacher
              ? 'Manage your schedule, students, and availability.'
              : 'Find tutors, book sessions, and track your learning.'}
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-right">
        <div className="auth-box">
          {/* Role toggle */}
          <div className="d-flex mb-4 rounded overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            <Link
              to="/login?role=student"
              className="flex-fill text-center py-2 text-decoration-none small fw-semibold"
              style={{ background: !isTeacher ? 'var(--primary)' : 'transparent', color: !isTeacher ? '#fff' : '#6B7280' }}
            >
              <i className="bi bi-mortarboard me-1"></i>Student
            </Link>
            <Link
              to="/login?role=teacher"
              className="flex-fill text-center py-2 text-decoration-none small fw-semibold"
              style={{ background: isTeacher ? 'var(--primary)' : 'transparent', color: isTeacher ? '#fff' : '#6B7280' }}
            >
              <i className="bi bi-person-video3 me-1"></i>Teacher
            </Link>
          </div>

          <h5 className="fw-bold mb-1" style={{ color: 'var(--primary)' }}>Welcome back</h5>
          <p className="text-muted small mb-3">Sign in to your account</p>

          <AlertMessage type="danger" message={error} />

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading
                ? <><span className="spinner-border spinner-border-sm me-2"></span>Signing in...</>
                : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-muted small mt-3 mb-0">
            Don't have an account?{' '}
            <Link to={`/register?role=${role}`} style={{ color: 'var(--accent)', fontWeight: 600 }}>
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
