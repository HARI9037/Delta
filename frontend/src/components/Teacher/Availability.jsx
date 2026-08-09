import { useEffect, useState } from 'react'
import { getAvailability, addAvailability, updateAvailability, deleteAvailability } from '../../services/teacherService'
import { useAuth } from '../../context/AuthContext'
import Spinner from '../Common/Spinner'
import AlertMessage from '../Common/AlertMessage'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const MODES = ['Online', 'Offline']

function localDateStr(d = new Date()) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export default function Availability() {
  const { user } = useAuth()
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [form, setForm] = useState({ subject: '', date: localDateStr(), startTime: '09:00', endTime: '10:00', mode: 'Online', enabled: true })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const subjects = user?.subjects || []

  const fetchSlots = () => {
    setLoading(true)
    getAvailability()
      .then((res) => setSlots(res.data?.data || []))
      .catch(() => setError('Failed to load availability.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchSlots()
    if (subjects.length > 0) setForm((p) => ({ ...p, subject: subjects[0] }))
  }, [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleAdd = async (e) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      await addAvailability(form)
      fetchSlots()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add slot')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggle = async (slot) => {
    try {
      await updateAvailability(slot._id, { enabled: !slot.enabled })
      fetchSlots()
    } catch (err) {
      setError('Failed to update slot status')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this slot?')) return
    try {
      await deleteAvailability(id)
      fetchSlots()
    } catch (err) {
      setError('Failed to delete slot')
    }
  }

  if (loading && slots.length === 0) return <Spinner />

  return (
    <div>
      <p className="page-title">Manage Availability</p>
      <p className="page-subtitle">Set the days and times you are available for classes.</p>

      <AlertMessage type="danger" message={error} />

      <div className="row g-4">
        {/* Add Form */}
        <div className="col-lg-4">
          <div className="card">
            <div className="card-header bg-white pt-3 pb-2">
              <h6 className="mb-0 fw-semibold text-primary">Add New Slot</h6>
            </div>
            <div className="card-body">
              <form onSubmit={handleAdd}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Subject</label>
                  <select name="subject" className="form-select form-select-sm" value={form.subject} onChange={handleChange} required>
                    {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Date</label>
                  <input type="date" name="date" className="form-control form-control-sm" value={form.date} onChange={handleChange} required min={localDateStr()} />
                </div>
                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <label className="form-label small fw-semibold">Start Time</label>
                    <input type="time" name="startTime" className="form-control form-control-sm" value={form.startTime} onChange={handleChange} required />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-semibold">End Time</label>
                    <input type="time" name="endTime" className="form-control form-control-sm" value={form.endTime} onChange={handleChange} required />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="form-label small fw-semibold">Teaching Mode</label>
                  <select name="mode" className="form-select form-select-sm" value={form.mode} onChange={handleChange}>
                    {MODES.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <button type="submit" className="btn btn-primary w-100 btn-sm" disabled={isSubmitting || subjects.length === 0}>
                  {isSubmitting ? 'Adding...' : 'Add Slot'}
                </button>
                {subjects.length === 0 && (
                  <div className="text-danger small mt-2 text-center">Please add subjects in Profile first.</div>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* Existing Slots */}
        <div className="col-lg-8">
          <div className="card">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead>
                    <tr>
                      <th className="px-3">Subject & Date</th>
                      <th>Time</th>
                      <th>Mode</th>
                      <th>Status</th>
                      <th className="text-end px-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {slots.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-4 text-muted">
                          No availability slots configured.
                        </td>
                      </tr>
                    ) : (
                      slots.map((slot) => (
                        <tr key={slot._id}>
                          <td className="px-3">
                            <div className="fw-semibold small">{slot.subject}</div>
                            <div className="text-muted" style={{ fontSize: '0.75rem' }}>{new Date(slot.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                          </td>
                          <td className="small">{slot.startTime} – {slot.endTime}</td>
                          <td>
                            <span className={`badge ${slot.mode === 'Online' ? 'bg-success' : 'bg-warning'} bg-opacity-10 text-${slot.mode === 'Online' ? 'success' : 'warning'}`}>
                              {slot.mode}
                            </span>
                          </td>
                          <td>
                            <div className="form-check form-switch m-0 d-flex align-items-center">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                role="switch"
                                checked={slot.enabled}
                                onChange={() => handleToggle(slot)}
                                style={{ cursor: 'pointer' }}
                              />
                            </div>
                          </td>
                          <td className="text-end px-3">
                            <button
                              className="btn btn-sm text-danger"
                              onClick={() => handleDelete(slot._id)}
                              title="Delete Slot"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
