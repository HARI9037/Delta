import { useEffect, useState, useRef } from 'react'
import { getTeacherProfile, updateTeacherProfile, uploadProfilePhoto } from '../../services/teacherService'
import { useAuth } from '../../context/AuthContext'
import Spinner from '../Common/Spinner'
import AlertMessage from '../Common/AlertMessage'

const MAX_PHOTO_SIZE = 2 * 1024 * 1024 // 2 MB

export default function AdminProfile() {
  const { login } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [photoUploading, setPhotoUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [form, setForm] = useState({ name: '', phone: '' })
  const fileInputRef = useRef(null)

  useEffect(() => {
    getTeacherProfile()
      .then((res) => {
        const data = res.data?.data || {}
        setProfile(data)
        setForm({
          name: data.name || data.fullName || '',
          phone: data.phone || '',
        })
      })
      .catch(() => setError('Failed to load admin profile.'))
      .finally(() => setLoading(false))
  }, [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  async function handlePhotoChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { setError('Please choose an image file.'); return }
    if (file.size > MAX_PHOTO_SIZE) { setError('Photo must be under 2 MB.'); return }

    setError('')
    setSuccess('')
    setPhotoUploading(true)
    try {
      const fd = new FormData()
      fd.append('photo', file)
      const res = await uploadProfilePhoto(fd)
      const updated = res.data?.data || {}
      setProfile(updated)
      const stored = JSON.parse(localStorage.getItem('tms_user') || '{}')
      login({ ...stored, name: updated.name || updated.fullName, profilePhoto: updated.profilePhoto })
      setSuccess('Profile photo updated successfully.')
    } catch (err) {
      setError(err.response?.data?.message || 'Photo upload failed. Please try again.')
    } finally {
      setPhotoUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleRemovePhoto() {
    setError('')
    setSuccess('')
    setSaving(true)
    try {
      const res = await updateTeacherProfile({ profilePhoto: '' })
      const updated = res.data?.data || {}
      setProfile(updated)
      const stored = JSON.parse(localStorage.getItem('tms_user') || '{}')
      login({ ...stored, name: updated.name || updated.fullName, profilePhoto: '' })
      setSuccess('Profile photo removed.')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove photo.')
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)

    try {
      const res = await updateTeacherProfile({ fullName: form.name, phone: form.phone })
      const updated = res.data?.data || {}
      setProfile(updated)

      const stored = JSON.parse(localStorage.getItem('tms_user') || '{}')
      login({ ...stored, name: updated.name || updated.fullName || form.name })

      setSuccess('Admin profile updated successfully.')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Spinner />

  return (
    <div>
      <p className="page-title">Admin Profile</p>
      <p className="page-subtitle">Manage your administrative account information and settings.</p>

      <div className="row">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header bg-white pt-3 pb-2">
              <h6 className="mb-0 fw-semibold text-primary">Administrator Details</h6>
            </div>
            <div className="card-body p-4">
              <AlertMessage type="danger" message={error} />
              <AlertMessage type="success" message={success} />

              <div className="d-flex align-items-center gap-4 mb-4 pb-4 border-bottom flex-wrap">
                {profile?.profilePhoto ? (
                  <img
                    src={profile.profilePhoto}
                    alt="Profile"
                    className="rounded-circle object-fit-cover"
                    style={{ width: 80, height: 80 }}
                  />
                ) : (
                  <div
                    className="rounded-circle text-white d-flex align-items-center justify-content-center"
                    style={{ width: 80, height: 80, fontSize: '2.5rem', background: '#0B174E' }}
                  >
                    <i className="bi bi-person-badge-fill"></i>
                  </div>
                )}
                <div className="flex-grow-1">
                  <h5 className="fw-bold mb-1">{profile?.name || profile?.fullName}</h5>
                  <p className="text-muted small mb-0">{profile?.email}</p>
                  <span className="badge mt-2" style={{ background: 'rgba(238,12,3,0.15)', color: '#ee0c03', border: '1px solid rgba(238,12,3,0.3)' }}>
                    👑 Administrator Account
                  </span>
                </div>
                <div className="d-flex flex-column gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="d-none"
                    onChange={handlePhotoChange}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={photoUploading}
                  >
                    {photoUploading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>Uploading...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-camera me-1"></i>Change Photo
                      </>
                    )}
                  </button>
                  {profile?.profilePhoto && (
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      onClick={handleRemovePhoto}
                      disabled={photoUploading}
                    >
                      <i className="bi bi-trash me-1"></i>Remove Photo
                    </button>
                  )}
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      className="form-control form-control-sm"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Email Address (Read-only)</label>
                    <input
                      type="email"
                      className="form-control form-control-sm"
                      value={profile?.email || ''}
                      disabled
                    />
                  </div>
                </div>

                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      className="form-control form-control-sm"
                      value={form.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">System Role</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value="System Administrator"
                      disabled
                    />
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
