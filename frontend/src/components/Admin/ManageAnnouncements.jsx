import { useEffect, useState } from 'react'
import {
  getAdminAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  togglePublishAnnouncement,
} from '../../services/announcementService'
import Spinner from '../Common/Spinner'
import AlertMessage from '../Common/AlertMessage'

function PriorityBadge({ priority }) {
  const map = {
    Urgent: { bg: '#FEE2E2', color: '#991B1B' },
    High:   { bg: '#FEF3C7', color: '#92400E' },
    Medium: { bg: '#DBEAFE', color: '#1E40AF' },
    Low:    { bg: '#F3F4F6', color: '#4B5563' },
  }
  const p = map[priority] || map.Medium
  return (
    <span style={{ background: p.bg, color: p.color, borderRadius: 12, padding: '3px 10px', fontSize: '0.72rem', fontWeight: 700 }}>
      {priority}
    </span>
  )
}

function AudienceBadge({ audience }) {
  const map = {
    'All Users': { bg: '#E0E7FF', color: '#3730A3' },
    Students:    { bg: '#D1FAE5', color: '#065F46' },
    Teachers:    { bg: '#FEF3C7', color: '#92400E' },
  }
  const a = map[audience] || map['All Users']
  return (
    <span style={{ background: a.bg, color: a.color, borderRadius: 12, padding: '3px 10px', fontSize: '0.72rem', fontWeight: 700 }}>
      {audience}
    </span>
  )
}

// Modal for Creating or Editing Announcement
function AnnouncementModal({ announcement, onClose, onSaved }) {
  const isEditing = Boolean(announcement?._id)
  const [form, setForm] = useState({
    title:          announcement?.title || '',
    message:        announcement?.message || '',
    targetAudience: announcement?.targetAudience || 'All Users',
    priority:       announcement?.priority || 'Medium',
    published:      announcement?.published !== undefined ? announcement.published : true,
    expiryDate:     announcement?.expiryDate ? new Date(announcement.expiryDate).toISOString().substring(0, 10) : '',
  })

  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.message) {
      setErr('Title and message are required.')
      return
    }

    setSaving(true)
    setErr('')
    try {
      if (isEditing) {
        await updateAnnouncement(announcement._id, form)
      } else {
        await createAnnouncement(form)
      }
      onSaved()
      onClose()
    } catch (error) {
      setErr(error.response?.data?.message || 'Failed to save announcement.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal d-block" style={{ background: 'rgba(11,23,78,0.55)', zIndex: 1060 }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 16, overflow: 'hidden' }}>
          <div className="p-4 text-white d-flex align-items-center justify-content-between" style={{ background: 'linear-gradient(135deg,#0B174E,#25233F)' }}>
            <h5 className="fw-bold mb-0">
              <i className="bi bi-megaphone-fill me-2 text-warning"></i>
              {isEditing ? 'Edit Announcement' : 'Create New Announcement'}
            </h5>
            <button className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              {err && <AlertMessage type="danger" message={err} />}

              <div className="mb-3">
                <label className="form-label fw-semibold small">Announcement Title</label>
                <input
                  type="text"
                  name="title"
                  className="form-control"
                  placeholder="e.g. Schedule Update or Holiday Notice"
                  value={form.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold small">Message Content</label>
                <textarea
                  name="message"
                  className="form-control"
                  rows="4"
                  placeholder="Enter the full message visible to users..."
                  value={form.message}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold small">Target Audience</label>
                  <select name="targetAudience" className="form-select" value={form.targetAudience} onChange={handleChange}>
                    <option value="All Users">All Users (Students & Teachers)</option>
                    <option value="Students">Students Only</option>
                    <option value="Teachers">Teachers Only</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold small">Priority Level</label>
                  <select name="priority" className="form-select" value={form.priority} onChange={handleChange}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold small">Expiry Date (Optional)</label>
                  <input
                    type="date"
                    name="expiryDate"
                    className="form-control"
                    value={form.expiryDate}
                    onChange={handleChange}
                  />
                  <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                    Leave blank for no expiration.
                  </span>
                </div>

                <div className="col-md-6 d-flex align-items-center pt-3">
                  <div className="form-check form-switch mb-0">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      id="publishSwitch"
                      name="published"
                      checked={form.published}
                      onChange={handleChange}
                    />
                    <label className="form-check-label fw-semibold small" htmlFor="publishSwitch">
                      Publish Immediately
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer border-0 px-4 pb-4 bg-light">
              <button type="button" className="btn btn-outline-secondary btn-sm px-4" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary btn-sm px-4 fw-semibold" disabled={saving}>
                {saving ? 'Saving...' : isEditing ? 'Update Announcement' : 'Publish Announcement'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function ManageAnnouncements() {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [actingId, setActingId] = useState(null)

  const fetchAnnouncements = async () => {
    setLoading(true)
    try {
      const res = await getAdminAnnouncements()
      setAnnouncements(res.data?.data || [])
    } catch {
      setError('Failed to fetch announcements.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const handleTogglePublish = async (id) => {
    setActingId(id)
    try {
      await togglePublishAnnouncement(id)
      setSuccess('Publish status updated.')
      fetchAnnouncements()
      setTimeout(() => setSuccess(''), 4000)
    } catch {
      setError('Failed to toggle publish status.')
    } finally {
      setActingId(null)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return
    setActingId(id)
    try {
      await deleteAnnouncement(id)
      setSuccess('Announcement deleted successfully.')
      fetchAnnouncements()
      setTimeout(() => setSuccess(''), 4000)
    } catch {
      setError('Failed to delete announcement.')
    } finally {
      setActingId(null)
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <p className="page-title mb-0">System Announcements</p>
          <p className="page-subtitle mb-0">Create, edit, and broadcast announcements to students and teachers.</p>
        </div>
        <button
          className="btn btn-primary btn-sm fw-semibold d-flex align-items-center gap-2"
          style={{ borderRadius: 20, padding: '0.5rem 1.2rem' }}
          onClick={() => {
            setEditingItem(null)
            setShowModal(true)
          }}
        >
          <i className="bi bi-plus-circle-fill"></i>Create Announcement
        </button>
      </div>

      <AlertMessage type="danger" message={error} />
      <AlertMessage type="success" message={success} />

      {loading ? (
        <Spinner />
      ) : announcements.length === 0 ? (
        <div className="card border-0 shadow-sm p-5 text-center text-muted" style={{ borderRadius: 14 }}>
          <i className="bi bi-megaphone fs-1 text-primary opacity-50 mb-2"></i>
          <h6 className="fw-bold mb-1">No announcements published yet</h6>
          <p className="small text-muted mb-3">Click "Create Announcement" to post your first system notice.</p>
        </div>
      ) : (
        <div className="card border-0 shadow-sm" style={{ borderRadius: 14, overflow: 'hidden' }}>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th className="px-3">Title & Message</th>
                    <th>Audience</th>
                    <th>Priority</th>
                    <th>Published</th>
                    <th>Created Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {announcements.map((a) => (
                    <tr key={a._id}>
                      <td className="px-3" style={{ maxWidth: 320 }}>
                        <div className="fw-bold text-dark small mb-1">{a.title}</div>
                        <div
                          className="text-muted small"
                          style={{
                            fontSize: '0.78rem',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {a.message}
                        </div>
                      </td>
                      <td>
                        <AudienceBadge audience={a.targetAudience} />
                      </td>
                      <td>
                        <PriorityBadge priority={a.priority} />
                      </td>
                      <td>
                        <button
                          className={`btn btn-sm ${a.published ? 'btn-success' : 'btn-outline-secondary'}`}
                          style={{ borderRadius: 12, fontSize: '0.72rem', padding: '2px 10px' }}
                          disabled={actingId === a._id}
                          onClick={() => handleTogglePublish(a._id)}
                        >
                          {a.published ? 'Published' : 'Draft / Unpublished'}
                        </button>
                      </td>
                      <td className="small text-muted">{new Date(a.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="d-flex align-items-center gap-1">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            style={{ fontSize: '0.72rem' }}
                            onClick={() => {
                              setEditingItem(a)
                              setShowModal(true)
                            }}
                          >
                            <i className="bi bi-pencil me-1"></i>Edit
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            style={{ fontSize: '0.72rem' }}
                            disabled={actingId === a._id}
                            onClick={() => handleDelete(a._id)}
                          >
                            <i className="bi bi-trash me-1"></i>Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <AnnouncementModal
          announcement={editingItem}
          onClose={() => setShowModal(false)}
          onSaved={fetchAnnouncements}
        />
      )}
    </div>
  )
}
