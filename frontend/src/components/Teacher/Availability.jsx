import { useEffect, useState } from 'react'
import { getAvailability, addAvailability, updateAvailability, deleteAvailability, getTeacherProfile } from '../../services/teacherService'
import { useAuth } from '../../context/AuthContext'
import { getTodayLocalDateStr, formatLocalDate } from '../../utils/dateUtils'
import Spinner from '../Common/Spinner'
import AlertMessage from '../Common/AlertMessage'

const MODES = ['Online', 'Offline']

export default function Availability() {
  const { user } = useAuth()
  const [slots, setSlots] = useState([])
  const [subjects, setSubjects] = useState(user?.subjects || [])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [form, setForm] = useState({
    subject: '',
    date: getTodayLocalDateStr(),
    startTime: '09:00',
    endTime: '10:00',
    mode: 'Online',
    enabled: true
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchSlots = () => {
    setLoading(true)
    getAvailability()
      .then((res) => setSlots(res.data?.data || []))
      .catch(() => setError('Failed to load availability.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchSlots()
    // If subjects not in auth context, fetch teacher profile
    if (!user?.subjects || user.subjects.length === 0) {
      getTeacherProfile()
        .then((res) => {
          const fetchedSubjects = res.data?.data?.subjects || []
          setSubjects(fetchedSubjects)
          if (fetchedSubjects.length > 0) {
            setForm((p) => ({ ...p, subject: fetchedSubjects[0] }))
          }
        })
        .catch(() => {})
    } else {
      setSubjects(user.subjects)
      setForm((p) => ({ ...p, subject: user.subjects[0] }))
    }
  }, [user])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleAdd = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsSubmitting(true)
    try {
      await addAvailability(form)
      setSuccess('Availability slot added successfully!')
      fetchSlots()
      setTimeout(() => setSuccess(''), 4000)
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
    } catch {
      setError('Failed to update slot status')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this slot? Any pending or confirmed bookings on this slot will be cancelled and students will be notified.')) return
    setError('')
    try {
      const res = await deleteAvailability(id)
      const count = res.data?.data?.cancelledBookingsCount || 0
      setSuccess(count > 0 ? `Slot deleted and ${count} booking(s) safely cancelled.` : 'Slot deleted successfully.')
      fetchSlots()
      setTimeout(() => setSuccess(''), 4000)
    } catch {
      setError('Failed to delete slot')
    }
  }

  if (loading && slots.length === 0) return <Spinner />

  return (
    <div>
      <p className="page-title">Manage Availability</p>
      <p className="page-subtitle">Set the days and time slots you are free to teach sessions.</p>

      <AlertMessage type="danger" message={error} />
      <AlertMessage type="success" message={success} />

      <div className="row g-4">
        {/* Add Form */}
        <div className="col-lg-4">
          <div className="card shadow-sm border-0" style={{ borderRadius: 14 }}>
            <div className="card-header bg-white pt-3 pb-2 border-0">
              <h6 className="mb-0 fw-semibold text-primary">
                <i className="bi bi-calendar-plus me-2"></i>Add New Slot
              </h6>
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
                  <input
                    type="date"
                    name="date"
                    className="form-control form-control-sm"
                    value={form.date}
                    onChange={handleChange}
                    required
                    min={getTodayLocalDateStr()}
                  />
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
                <button type="submit" className="btn btn-primary w-100 btn-sm rounded-pill fw-semibold" disabled={isSubmitting || subjects.length === 0}>
                  {isSubmitting ? 'Adding...' : 'Add Availability Slot'}
                </button>
                {subjects.length === 0 && (
                  <div className="text-danger small mt-2 text-center">
                    Please configure your teaching subjects in Profile first.
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* Existing Slots */}
        <div className="col-lg-8">
          <div className="card shadow-sm border-0" style={{ borderRadius: 14, overflow: 'hidden' }}>
            <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
              <span className="fw-bold text-dark">
                <i className="bi bi-clock-history me-2 text-primary"></i>Configured Active & Upcoming Slots
              </span>
              <span className="badge bg-primary bg-opacity-10 text-primary">{slots.length} Slots</span>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="px-3">Subject & Date</th>
                      <th>Time</th>
                      <th>Mode</th>
                      <th>Booking Open?</th>
                      <th className="text-end px-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {slots.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-5 text-muted">
                          <i className="bi bi-calendar2-x fs-2 d-block mb-2 text-muted opacity-50"></i>
                          No upcoming availability slots configured.
                        </td>
                      </tr>
                    ) : (
                      slots.map((slot) => (
                        <tr key={slot._id}>
                          <td className="px-3">
                            <div className="fw-semibold small text-dark">{slot.subject}</div>
                            <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                              {formatLocalDate(slot.date)}
                            </div>
                          </td>
                          <td className="small fw-semibold">{slot.startTime} – {slot.endTime}</td>
                          <td>
                            <span className={`badge ${slot.mode === 'Online' ? 'bg-success' : 'bg-warning'} bg-opacity-10 text-${slot.mode === 'Online' ? 'success' : 'warning'}`}>
                              {slot.mode}
                            </span>
                          </td>
                          <td>
                            <div className="form-check form-switch m-0 d-flex align-items-center gap-2">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                role="switch"
                                checked={slot.enabled}
                                onChange={() => handleToggle(slot)}
                                style={{ cursor: 'pointer' }}
                              />
                              <span className="small text-muted" style={{ fontSize: '0.75rem' }}>
                                {slot.enabled ? 'Open' : 'Closed'}
                              </span>
                            </div>
                          </td>
                          <td className="text-end px-3">
                            <button
                              className="btn btn-sm btn-outline-danger"
                              style={{ borderRadius: 14, fontSize: '0.75rem' }}
                              onClick={() => handleDelete(slot._id)}
                              title="Delete Slot & Cancel Associated Bookings"
                            >
                              <i className="bi bi-trash me-1"></i>Delete
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
