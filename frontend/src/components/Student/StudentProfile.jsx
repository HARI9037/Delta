import { useEffect, useState } from 'react'
import { getStudentProfile, updateStudentProfile } from '../../services/studentService'
import { useAuth } from '../../context/AuthContext'
import Spinner from '../Common/Spinner'
import AlertMessage from '../Common/AlertMessage'

export default function StudentProfile() {
  const { login } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [form, setForm] = useState({ name: '', phone: '', grade: '' })

  useEffect(() => {
    getStudentProfile()
      .then((res) => {
        const data = res.data?.data || {}
        setProfile(data)
        setForm({ name: data.name || '', phone: data.phone || '', grade: data.grade || '' })
      })
      .catch(() => setError('Failed to load profile.'))
      .finally(() => setLoading(false))
  }, [])

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)

    try {
      const res = await updateStudentProfile(form)
      const updated = res.data?.data || {}
      setProfile(updated)

      // Update local storage name via context login method 
      // (assuming token is still valid, we just re-merge)
      const stored = JSON.parse(localStorage.getItem('tms_user') || '{}')
      login({ ...stored, name: updated.name })

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
      <p className="page-subtitle">Manage your personal information and account settings.</p>

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
                  <i className="bi bi-person"></i>
                </div>
                <div>
                  <h5 className="fw-bold mb-1">{profile?.name}</h5>
                  <p className="text-muted small mb-0">{profile?.email}</p>
                  <span className="badge bg-light text-primary border mt-2">Student Account</span>
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

                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Phone Number</label>
                    <input type="tel" name="phone" className="form-control form-control-sm" value={form.phone} onChange={handleChange} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Grade / Class</label>
                    <input type="text" name="grade" className="form-control form-control-sm" value={form.grade} onChange={handleChange} />
                  </div>
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
