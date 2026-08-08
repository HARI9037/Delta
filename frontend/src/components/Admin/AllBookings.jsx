import { useEffect, useState } from 'react'
import { getAllBookings } from '../../services/adminService'
import Spinner from '../Common/Spinner'
import AlertMessage from '../Common/AlertMessage'

export default function AllBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('')

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const res = await getAllBookings({ search: searchTerm, status: statusFilter, date: dateFilter })
      setBookings(res.data?.data || [])
    } catch {
      setError('Failed to fetch system bookings.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [statusFilter, dateFilter])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    fetchBookings()
  }

  return (
    <div>
      <p className="page-title">All System Bookings</p>
      <p className="page-subtitle">View and filter all tutoring sessions booked across all students and teachers.</p>

      <AlertMessage type="danger" message={error} />

      {/* Filter / Search Controls */}
      <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 12 }}>
        <div className="card-body py-2">
          <form onSubmit={handleSearchSubmit} className="row g-2 align-items-center">
            <div className="col-md-4">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search by student, teacher, or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <select className="form-select form-select-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All Booking Statuses</option>
                <option value="Approved">Approved</option>
                <option value="Pending">Pending Confirmation</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div className="col-md-3">
              <input
                type="date"
                className="form-control form-control-sm"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <button type="submit" className="btn btn-primary btn-sm w-100">
                <i className="bi bi-search me-1"></i>Search
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Bookings Table */}
      {loading ? (
        <Spinner />
      ) : (
        <div className="card border-0 shadow-sm" style={{ borderRadius: 14, overflow: 'hidden' }}>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th className="px-3">Student</th>
                    <th>Teacher</th>
                    <th>Subject</th>
                    <th>Date</th>
                    <th>Time Slot</th>
                    <th>Mode</th>
                    <th>Status</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-4 text-muted">
                        No bookings found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    bookings.map((b) => (
                      <tr key={b._id}>
                        <td className="px-3">
                          <div className="fw-semibold small">{b.studentId?.name || '—'}</div>
                          <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                            {b.studentId?.email}
                          </div>
                        </td>
                        <td>
                          <div className="fw-semibold small">{b.teacherId?.fullName || '—'}</div>
                          <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                            {b.teacherId?.email}
                          </div>
                        </td>
                        <td className="small fw-semibold">{b.subject}</td>
                        <td className="small">{b.date}</td>
                        <td className="small text-muted">{b.startTime} - {b.endTime}</td>
                        <td className="small">{b.mode}</td>
                        <td>
                          <span
                            className={`badge ${
                              b.status === 'Approved'
                                ? 'bg-success'
                                : b.status === 'Pending'
                                ? 'bg-warning text-dark'
                                : 'bg-danger'
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                        <td className="small text-muted">{new Date(b.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
