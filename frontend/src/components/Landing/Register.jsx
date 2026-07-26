import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { studentRegister, teacherRegister } from '../../services/authService'
import AlertMessage from '../Common/AlertMessage'

const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Computer Science', 'Economics']

export default function Register() {
  const [searchParams] = useSearchParams()
  const role = searchParams.get('role') === 'teacher' ? 'teacher' : 'student'

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '', grade: '', bio: '' })
  const [subjects, setSubjects] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()
  const isTeacher = role === 'teacher'

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function toggleSubject(sub) {
    setSubjects((prev) =>
      prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub]
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return }
    setError('')
    setLoading(true)

    try {
      const payload = {
        email: form.email,
        phone: form.phone,
        password: form.password,
        ...(isTeacher
          ? { fullName: form.name, subjects, bio: form.bio }
          : { name: form.name, grade: form.grade }),
      }

      const fn = isTeacher ? teacherRegister : studentRegister
      const res = await fn(payload)
      const data = res.data?.data || {}

      const userObj = data.student || data.teacher || {}
      login({ ...userObj, token: data.token, role })
      navigate(isTeacher ? '/teacher/dashboard' : '/student/dashboard', { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

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
          <h5 className="fw-semibold">Create Your Account</h5>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', maxWidth: 280 }}>
            {isTeacher
              ? 'Join as a teacher and start managing your tuition classes.'
              : 'Register as a student and find your perfect tutor.'}
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-right">
        <div className="auth-box">
          {/* Role toggle */}
          <div className="d-flex mb-4 rounded overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            <Link
              to="/register?role=student"
              className="flex-fill text-center py-2 text-decoration-none small fw-semibold"
              style={{ background: !isTeacher ? 'var(--primary)' : 'transparent', color: !isTeacher ? '#fff' : '#6B7280' }}
            >
              <i className="bi bi-mortarboard me-1"></i>Student
            </Link>
            <Link
              to="/register?role=teacher"
              className="flex-fill text-center py-2 text-decoration-none small fw-semibold"
              style={{ background: isTeacher ? 'var(--primary)' : 'transparent', color: isTeacher ? '#fff' : '#6B7280' }}
            >
              <i className="bi bi-person-video3 me-1"></i>Teacher
            </Link>
          </div>

          <h5 className="fw-bold mb-1" style={{ color: 'var(--primary)' }}>
            Register as {isTeacher ? 'Teacher' : 'Student'}
          </h5>
          <p className="text-muted small mb-3">Fill in your details to get started</p>

          <AlertMessage type="danger" message={error} />

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Full Name</label>
              <input type="text" name="name" className="form-control" placeholder="Your full name" value={form.name} onChange={handleChange} required />
            </div>

            <div className="mb-3">
              <label className="form-label">Email</label>
              <input type="email" name="email" className="form-control" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
            </div>

            <div className="mb-3">
              <label className="form-label">Phone</label>
              <input type="tel" name="phone" className="form-control" placeholder="e.g. 03001234567" value={form.phone} onChange={handleChange} required />
            </div>

            {/* Student only: Grade */}
            {!isTeacher && (
              <div className="mb-3">
                <label className="form-label">Grade / Class</label>
                <input type="text" name="grade" className="form-control" placeholder="e.g. Grade 10 / A-Levels" value={form.grade} onChange={handleChange} />
              </div>
            )}

            {/* Teacher only: Subjects, Rate, Bio */}
            {isTeacher && (
              <>
                <div className="mb-3">
                  <label className="form-label">Subjects</label>
                  <div className="d-flex flex-wrap gap-2">
                    {SUBJECTS.map((sub) => (
                      <div key={sub} className="form-check form-check-inline m-0">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={sub}
                          checked={subjects.includes(sub)}
                          onChange={() => toggleSubject(sub)}
                        />
                        <label className="form-check-label small" htmlFor={sub}>{sub}</label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Short Bio</label>
                  <textarea name="bio" className="form-control" rows={2} placeholder="Brief introduction..." value={form.bio} onChange={handleChange} />
                </div>
              </>
            )}

            <div className="mb-3">
              <label className="form-label">Password</label>
              <input type="password" name="password" className="form-control" placeholder="Min 6 characters" value={form.password} onChange={handleChange} required />
            </div>

            <div className="mb-4">
              <label className="form-label">Confirm Password</label>
              <input type="password" name="confirmPassword" className="form-control" placeholder="Repeat password" value={form.confirmPassword} onChange={handleChange} required />
            </div>

            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading
                ? <><span className="spinner-border spinner-border-sm me-2"></span>Creating account...</>
                : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-muted small mt-3 mb-0">
            Already have an account?{' '}
            <Link to={`/login?role=${role}`} style={{ color: 'var(--accent)', fontWeight: 600 }}>
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
