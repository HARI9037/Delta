import { useEffect, useState } from 'react'
import { getPendingBookings, confirmOrRejectBooking } from '../../services/adminService'
import Spinner from '../Common/Spinner'
import AlertMessage from '../Common/AlertMessage'

export default function BookingConfirmations() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [actingId, setActingId] = useState(null)

  const fetchPending = async () => {
    setLoading(true)
    try {
      const res = await getPendingBookings()
      setBookings(res.data?.data || [])
    } catch {
      setError('Failed to fetch pending booking confirmations.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPending()
  }, [])

  const handleAction = async (id, status) => {
    setActingId(id)
    try {
      await confirmOrRejectBooking(id, { status })
      setSuccess(`Booking request ${status.toLowerCase()} successfully.`)
      fetchPending()
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update booking status.')
    } finally {
      setActingId(null)
    }
  }

  return (
    <div>
      <p className="page-title">Booking Confirmations</p>
      <p className="page-subtitle">Review and confirm pending session booking requests from students.</p>

      <AlertMessage type="danger" message={error} />
      <AlertMessage type="success" message={success} />

      {loading ? (
        <Spinner />
      ) : bookings.length === 0 ? (
        <div className="card border-0 shadow-sm p-5 text-center text-muted" style={{ borderRadius: 14 }}>
          <i className="bi bi-calendar-check fs-1 text-success opacity-50 mb-2"></i>
          <h6 className="fw-bold mb-1">No pending booking confirmations</h6>
          <p className="small text-muted mb-0">All booking requests have been processed.</p>
        </div>
      ) : (
        <div className="row g-3">
          {bookings.map((b) => (
            <div key={b._id} className="col-md-6 col-xl-4">
              <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 14 }}>
                <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
                  <span className="badge bg-primary px-3 py-2" style={{ borderRadius: 12 }}>
                    {b.subject}
                  </span>
                  <span className="badge bg-warning text-dark px-2 py-1" style={{ borderRadius: 10 }}>
                    {b.status}
                  </span>
                </div>

                <div className="card-body p-3">
                  {/* Student Info */}
                  <div className="d-flex align-items-center gap-2 mb-3 p-2 rounded" style={{ background: '#F8FAFC' }}>
                    <div className="rounded-circle bg-info text-dark fw-bold d-flex align-items-center justify-content-center" style={{ width: 36, height: 36, fontSize: '0.85rem' }}>
                      {b.studentId?.name?.substring(0, 2).toUpperCase() || 'ST'}
                    </div>
                    <div>
                      <div className="fw-bold small">{b.studentId?.name || 'Student'}</div>
                      <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                        {b.studentId?.email} &bull; Class: {b.studentId?.class || 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* Teacher Info */}
                  <div className="d-flex align-items-center gap-2 mb-3 p-2 rounded" style={{ background: '#F8FAFC' }}>
                    <div className="rounded-circle bg-warning text-dark fw-bold d-flex align-items-center justify-content-center" style={{ width: 36, height: 36, fontSize: '0.85rem' }}>
                      {b.teacherId?.fullName?.substring(0, 2).toUpperCase() || 'TR'}
                    </div>
                    <div>
                      <div className="fw-bold small">{b.teacherId?.fullName || 'Teacher'}</div>
                      <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                        {b.teacherId?.email}
                      </div>
                    </div>
                  </div>

                  {/* Session Timing */}
                  <div className="small text-secondary mb-2">
                    <i className="bi bi-calendar-event me-2 text-primary"></i>
                    <strong>Date:</strong> {b.date}
                  </div>
                  <div className="small text-secondary mb-2">
                    <i className="bi bi-clock me-2 text-primary"></i>
                    <strong>Time:</strong> {b.startTime} - {b.endTime}
                  </div>
                  <div className="small text-secondary mb-3">
                    <i className="bi bi-geo-alt me-2 text-primary"></i>
                    <strong>Mode:</strong> {b.mode}
                  </div>

                  {b.requirement && (
                    <div className="p-2 rounded bg-light small mb-3 text-muted">
                      <strong>Notes:</strong> {b.requirement}
                    </div>
                  )}
                </div>

                <div className="card-footer bg-light border-0 p-3 d-flex gap-2">
                  <button
                    className="btn btn-outline-danger btn-sm flex-fill"
                    style={{ borderRadius: 16 }}
                    disabled={actingId === b._id}
                    onClick={() => handleAction(b._id, 'Cancelled')}
                  >
                    Reject
                  </button>
                  <button
                    className="btn btn-success btn-sm flex-fill fw-semibold"
                    style={{ borderRadius: 16 }}
                    disabled={actingId === b._id}
                    onClick={() => handleAction(b._id, 'Approved')}
                  >
                    Confirm Booking
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
