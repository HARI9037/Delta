import { useEffect, useState } from 'react'
import { getStudentBookings, cancelBooking } from '../../services/studentService'
import { formatLocalDate } from '../../utils/dateUtils'
import Spinner from '../Common/Spinner'
import AlertMessage from '../Common/AlertMessage'
import Avatar from '../Common/Avatar'

function StatusBadge({ status }) {
  if (status === 'Approved') {
    return (
      <span className="badge bg-success px-2 py-1" style={{ fontSize: '0.75rem' }}>
        <i className="bi bi-check-circle me-1"></i>Approved
      </span>
    )
  }
  if (status === 'Cancelled' || status === 'Rejected') {
    return (
      <span className="badge bg-danger bg-opacity-10 text-danger px-2 py-1 border border-danger border-opacity-25" style={{ fontSize: '0.75rem' }}>
        <i className="bi bi-x-circle me-1"></i>Cancelled
      </span>
    )
  }
  if (status === 'Completed') {
    return (
      <span className="badge bg-secondary px-2 py-1" style={{ fontSize: '0.75rem' }}>
        <i className="bi bi-check2-all me-1"></i>Completed
      </span>
    )
  }
  return (
    <span className="badge bg-warning text-dark px-2 py-1" style={{ fontSize: '0.75rem' }}>
      <i className="bi bi-hourglass-split me-1"></i>Pending Approval
    </span>
  )
}

export default function MyBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [cancellingId, setCancellingId] = useState(null)

  const fetchBookings = () => {
    setLoading(true)
    getStudentBookings()
      .then((res) => setBookings(res.data?.data || []))
      .catch(() => setError('Failed to load bookings.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  const handleCancelBooking = async (b) => {
    const isPending = b.status === 'Pending'
    const confirmMsg = isPending
      ? `Undo and cancel this pending booking for ${b.subject} with ${b.teacherId?.fullName || 'the teacher'}?`
      : `Are you sure you want to cancel your confirmed ${b.subject} session on ${formatLocalDate(b.date)}?`

    if (!window.confirm(confirmMsg)) return

    setCancellingId(b._id)
    setError('')
    try {
      await cancelBooking(b._id)
      setSuccess('Booking cancelled successfully.')
      fetchBookings()
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel booking.')
    } finally {
      setCancellingId(null)
    }
  }

  if (loading) return <Spinner />

  return (
    <div>
      <p className="page-title">My Bookings</p>
      <p className="page-subtitle">View and manage all your past, upcoming, and pending tuition sessions.</p>

      <AlertMessage type="danger" message={error} />
      <AlertMessage type="success" message={success} />

      <div className="card shadow-sm border-0" style={{ borderRadius: 14 }}>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="px-3">Subject & Teacher</th>
                  <th>Schedule</th>
                  <th>Mode</th>
                  <th>Requirements / Notes</th>
                  <th>Status</th>
                  <th className="text-end px-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">
                      <i className="bi bi-calendar-x fs-2 d-block mb-2"></i>
                      No tuition bookings found.
                    </td>
                  </tr>
                ) : (
                  bookings.map((b) => (
                    <tr key={b._id}>
                      <td className="px-3 py-3">
                        <div className="d-flex align-items-center gap-2">
                          <Avatar src={b.teacherId?.profilePhoto} name={b.teacherId?.fullName} size={36} />
                          <div>
                            <div className="fw-semibold small text-dark">{b.subject}</div>
                            <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                              {b.teacherId?.fullName || 'Teacher'} &bull; {b.teacherId?.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="small fw-semibold text-dark">{formatLocalDate(b.date)}</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>{b.startTime} - {b.endTime}</div>
                      </td>
                      <td>
                        <span className={`badge ${b.mode === 'Online' ? 'bg-success bg-opacity-10 text-success' : 'bg-warning bg-opacity-10 text-warning'}`}>
                          {b.mode}
                        </span>
                      </td>
                      <td>
                        <div className="text-muted small text-truncate" style={{ maxWidth: 160 }} title={b.requirement || ''}>
                          {b.requirement || '—'}
                        </div>
                      </td>
                      <td>
                        <StatusBadge status={b.status} />
                      </td>
                      <td className="text-end px-3">
                        {['Pending', 'Approved'].includes(b.status) ? (
                          <button
                            className="btn btn-sm btn-outline-danger"
                            style={{ borderRadius: 14, fontSize: '0.75rem' }}
                            disabled={cancellingId === b._id}
                            onClick={() => handleCancelBooking(b)}
                            title="Cancel / Undo this booking"
                          >
                            <i className="bi bi-x-circle me-1"></i>
                            {cancellingId === b._id ? 'Cancelling...' : b.status === 'Pending' ? 'Undo Booking' : 'Cancel'}
                          </button>
                        ) : (
                          <span className="text-muted small" style={{ fontSize: '0.75rem' }}>—</span>
                        )}
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
  )
}
