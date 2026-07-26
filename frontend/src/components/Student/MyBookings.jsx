import { useEffect, useState } from 'react'
import { getStudentDashboard } from '../../services/studentService'
import Spinner from '../Common/Spinner'
import AlertMessage from '../Common/AlertMessage'

function StatusBadge({ status }) {
  const badgeClass = {
    Pending: 'badge-pending',
    Confirmed: 'badge-confirmed',
    Cancelled: 'badge-cancelled',
    Completed: 'badge-completed',
  }[status] || 'badge-pending'

  return <span className={`badge ${badgeClass} px-2 py-1`}>{status}</span>
}

export default function MyBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // Reusing the dashboard API as it returns all bookings for the student
    getStudentDashboard()
      .then((res) => setBookings(res.data?.data?.bookings || []))
      .catch(() => setError('Failed to load bookings.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  return (
    <div>
      <p className="page-title">My Bookings</p>
      <p className="page-subtitle">View all your past and upcoming tuition sessions.</p>

      <AlertMessage type="danger" message={error} />

      <div className="card">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th className="px-3">Subject & Teacher</th>
                  <th>Schedule</th>
                  <th>Mode</th>
                  <th>Requirements</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-muted">
                      No bookings found.
                    </td>
                  </tr>
                ) : (
                  bookings.map((b) => (
                    <tr key={b._id}>
                      <td className="px-3 py-3">
                        <div className="fw-semibold small">{b.subject}</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>{b.teacherId?.name}</div>
                      </td>
                      <td>
                        <div className="small">{b.date?.split('T')[0] || b.day}</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>{b.startTime} - {b.endTime}</div>
                      </td>
                      <td>
                        <span className={`badge ${b.mode === 'Online' ? 'bg-success' : 'bg-warning'} bg-opacity-10 text-${b.mode === 'Online' ? 'success' : 'warning'}`}>
                          {b.mode}
                        </span>
                      </td>
                      <td>
                        <div className="text-muted small text-truncate" style={{ maxWidth: 150 }}>
                          {b.requirement || '-'}
                        </div>
                      </td>
                      <td><StatusBadge status={b.status} /></td>
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
