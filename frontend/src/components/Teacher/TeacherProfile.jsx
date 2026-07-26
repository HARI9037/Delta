import { useEffect, useState } from 'react'
import { getTeacherProfile, updateTeacherProfile } from '../../services/teacherService'
import { useAuth } from '../../context/AuthContext'
import Spinner from '../Common/Spinner'
import AlertMessage from '../Common/AlertMessage'

const ALL_SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Computer Science', 'Economics']

export default function TeacherProfile() {
  const { login } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [form, setForm] = useState({ name: '', phone: '', bio: '' })
  const [subjects, setSubjects] = useState([])

  useEffect(() => {
    getTeacherProfile()
      .then((res) => {
        const data = res.data?.data || {}
        setProfile(data)
        setForm({
          name: data.name || '',
          phone: data.phone || '',
          bio: data.bio || ''
        })
        setSubjects(data.subjects || [])
      })
      .catch(() => setError('Failed to load profile.'))
      .finally(() => setLoading(false))
  }, [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const toggleSubject = (sub) => {
    setSubjects((prev) => prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)

    try {
      const res = await updateTeacherProfile({ ...form, subjects })
      const updated = res.data?.data || {}
      setProfile(updated)

      const stored = JSON.parse(localStorage.getItem('tms_user') || '{}')
      login({ ...stored, name: updated.name, subjects: updated.subjects })

      setSuccess('Profile updated successfully.')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Spinner />

  return (
    <div>
      <p className="page-title">My Profile</p>
      <p className="page-subtitle">Manage your personal information and teaching preferences.</p>

      <div className="row">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header bg-white pt-3 pb-2">
              <h6 className="mb-0 fw-semibold text-primary">Profile Details</h6>
            </div>
            <div className="card-body p-4">
              <AlertMessage type="danger" message={error} />
              <AlertMessage type="success" message={success} />

              <div className="d-flex align-items-center gap-4 mb-4 pb-4 border-bottom">
                <div
                  className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                  style={{ width: 80, height: 80, fontSize: '2.5rem' }}
                >
                  <i className="bi bi-person-video3"></i>
                </div>
                <div>
                  <h5 className="fw-bold mb-1">{profile?.name}</h5>
                  <p className="text-muted small mb-0">{profile?.email}</p>
                  <span className="badge bg-light text-primary border mt-2">Teacher Account</span>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Full Name</label>
                    <input type="text" name="name" className="form-control form-control-sm" value={form.name} onChange={handleChange} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Email Address (Read-only)</label>
                    <input type="email" className="form-control form-control-sm" value={profile?.email || ''} disabled />
                  </div>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Phone Number</label>
                    <input type="tel" name="phone" className="form-control form-control-sm" value={form.phone} onChange={handleChange} required />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold">Teaching Subjects</label>
                  <div className="d-flex flex-wrap gap-2">
                    {ALL_SUBJECTS.map((sub) => (
                      <div key={sub} className="form-check form-check-inline m-0">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`sub-${sub}`}
                          checked={subjects.includes(sub)}
                          onChange={() => toggleSubject(sub)}
                        />
                        <label className="form-check-label small" htmlFor={`sub-${sub}`}>{sub}</label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-semibold">Short Bio</label>
                  <textarea
                    name="bio"
                    className="form-control form-control-sm"
                    rows={3}
                    value={form.bio}
                    onChange={handleChange}
                  ></textarea>
                </div>

                <div className="d-flex justify-content-end">
                  <button type="submit" className="btn btn-primary px-4" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
