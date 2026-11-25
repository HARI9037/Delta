import { useEffect, useState } from 'react'
import { getAdminTimetable, confirmOrRejectBooking } from '../../services/adminService'
import { getTodayLocalDateStr, formatLocalDate } from '../../utils/dateUtils'
import Spinner from '../Common/Spinner'
import AlertMessage from '../Common/AlertMessage'
import Avatar from '../Common/Avatar'

export default function AdminTimetable() {
  const [selectedDate, setSelectedDate] = useState(getTodayLocalDateStr())
  const [statusFilter, setStatusFilter] = useState('all')
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [actingId, setActingId] = useState(null)

  const fetchTimetable = async (date) => {
    setLoading(true)
    setError('')
    try {
      const res = await getAdminTimetable({ date: date || selectedDate })
      setBookings(res.data?.data?.bookings || [])
    } catch {
      setError('Failed to fetch timetable for the selected date.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTimetable(selectedDate)
  }, [selectedDate])

  const handlePrevDay = () => {
    const parts = selectedDate.split('-').map(Number)
    const dt = new Date(parts[0], parts[1] - 1, parts[2] - 1)
    const y = dt.getFullYear()
    const m = String(dt.getMonth() + 1).padStart(2, '0')
    const d = String(dt.getDate()).padStart(2, '0')
    setSelectedDate(`${y}-${m}-${d}`)
  }

  const handleNextDay = () => {
    const parts = selectedDate.split('-').map(Number)
    const dt = new Date(parts[0], parts[1] - 1, parts[2] + 1)
    const y = dt.getFullYear()
    const m = String(dt.getMonth() + 1).padStart(2, '0')
    const d = String(dt.getDate()).padStart(2, '0')
    setSelectedDate(`${y}-${m}-${d}`)
  }

  const handleToday = () => {
    setSelectedDate(getTodayLocalDateStr())
  }

  const handleAction = async (id, status) => {
    setActingId(id)
    try {
      await confirmOrRejectBooking(id, { status })
      setSuccess(`Booking ${status.toLowerCase()} successfully.`)
      fetchTimetable(selectedDate)
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update booking status.')
    } finally {
      setActingId(null)
    }
  }

  // Filter bookings by status if chosen
  const filteredBookings = statusFilter === 'all'
    ? bookings
    : bookings.filter((b) => b.status === statusFilter)

  // Download Timetable as CSV
  const handleDownloadCSV = () => {
    if (filteredBookings.length === 0) {
      alert('No sessions to export for this date.')
      return
    }

    const headers = [
      'Time Slot',
      'Subject',
      'Mode',
      'Teacher Name',
      'Teacher Email',
      'Teacher Phone',
      'Student Name',
      'Student Email',
      'Student Class',
      'Status',
      'Requirement / Notes'
    ]

    const escapeCsv = (str) => {
      if (!str) return '""'
      const sanitized = String(str).replace(/"/g, '""')
      return `"${sanitized}"`
    }

    const rows = filteredBookings.map((b) => [
      escapeCsv(`${b.startTime} - ${b.endTime}`),
      escapeCsv(b.subject),
      escapeCsv(b.mode),
      escapeCsv(b.teacherId?.fullName || 'Teacher'),
      escapeCsv(b.teacherId?.email || ''),
      escapeCsv(b.teacherId?.phone || ''),
      escapeCsv(b.studentId?.name || 'Student'),
      escapeCsv(b.studentId?.email || ''),
      escapeCsv(b.studentId?.class || ''),
      escapeCsv(b.status),
      escapeCsv(b.requirement || '')
    ])

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Master_Timetable_${selectedDate}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const approvedCount = bookings.filter((b) => b.status === 'Approved').length
  const pendingCount = bookings.filter((b) => b.status === 'Pending').length

  return (
    <div>
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
        <div>
          <p className="page-title mb-1">Master Timetable</p>
          <p className="page-subtitle mb-0">
            View, manage, and download the daily class schedule across all teachers and students.
          </p>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-primary btn-sm px-3 rounded-pill fw-semibold"
            onClick={handleDownloadCSV}
            disabled={filteredBookings.length === 0}
            title="Download CSV for this date"
          >
            <i className="bi bi-download me-1"></i>Download Timetable (CSV)
          </button>
          <button
            className="btn btn-outline-secondary btn-sm px-3 rounded-pill fw-semibold d-none d-sm-inline-flex align-items-center"
            onClick={() => window.print()}
          >
            <i className="bi bi-printer me-1"></i>Print
          </button>
        </div>
      </div>

      <AlertMessage type="danger" message={error} />
      <AlertMessage type="success" message={success} />

      {/* Date & Filter Navigation Bar */}
      <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 14 }}>
        <div className="card-body p-3">
          <div className="row g-2 align-items-center">
            {/* Quick date navigators */}
            <div className="col-lg-5 col-md-6 d-flex align-items-center gap-2">
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={handlePrevDay}
                title="Previous Day"
              >
                <i className="bi bi-chevron-left"></i>
              </button>
              <input
                type="date"
                className="form-control form-control-sm fw-semibold"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={handleNextDay}
                title="Next Day"
              >
                <i className="bi bi-chevron-right"></i>
              </button>
              <button
                className="btn btn-sm btn-primary px-3 text-nowrap"
                onClick={handleToday}
              >
                Today
              </button>
            </div>

            {/* Status Filter */}
            <div className="col-lg-3 col-md-3">
              <select
                className="form-select form-select-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses ({bookings.length})</option>
                <option value="Approved">Approved Only ({approvedCount})</option>
                <option value="Pending">Pending Confirmation ({pendingCount})</option>
                <option value="Cancelled">Cancelled Only</option>
              </select>
            </div>

            {/* Quick summary pill */}
            <div className="col-lg-4 col-md-3 text-md-end text-muted small">
              <span className="badge bg-primary bg-opacity-10 text-primary me-2 px-2 py-1">
                {bookings.length} Total Sessions
              </span>
              <span className="badge bg-success bg-opacity-10 text-success me-2 px-2 py-1">
                {approvedCount} Approved
              </span>
              {pendingCount > 0 && (
                <span className="badge bg-warning bg-opacity-10 text-warning px-2 py-1">
                  {pendingCount} Pending
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Selected Date Header */}
      <div className="d-flex align-items-center justify-content-between mb-3 px-1">
        <h6 className="fw-bold text-dark mb-0">
          <i className="bi bi-calendar3 me-2 text-primary"></i>
          Schedule for {formatLocalDate(selectedDate)}
        </h6>
        <span className="text-muted small">
          Showing {filteredBookings.length} session{filteredBookings.length === 1 ? '' : 's'}
        </span>
      </div>

      {/* Timetable Table */}
      {loading ? (
        <Spinner />
      ) : filteredBookings.length === 0 ? (
        <div className="card border-0 shadow-sm p-5 text-center text-muted" style={{ borderRadius: 14 }}>
          <i className="bi bi-calendar-x fs-1 text-muted opacity-50 mb-2"></i>
          <h6 className="fw-bold mb-1">No sessions scheduled on this date</h6>
          <p className="small text-muted mb-0">
            {selectedDate === getTodayLocalDateStr()
              ? 'No classes booked for today yet.'
              : `No classes booked for ${formatLocalDate(selectedDate)}.`}
          </p>
        </div>
      ) : (
        <div className="card border-0 shadow-sm" style={{ borderRadius: 14, overflow: 'hidden' }}>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="px-3" style={{ width: 140 }}>Time</th>
                    <th>Subject</th>
                    <th>Teacher</th>
                    <th>Student</th>
                    <th>Mode</th>
                    <th>Status</th>
                    <th className="text-end px-3">Actions / Review</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((b) => (
                    <tr key={b._id}>
                      <td className="px-3">
                        <span className="fw-semibold small text-primary d-block">
                          {b.startTime} - {b.endTime}
                        </span>
                        <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                          {b.date}
                        </span>
                      </td>

                      <td>
                        <span className="fw-semibold small text-dark d-block">
                          {b.subject}
                        </span>
                        {b.requirement && (
                          <span
                            className="text-muted text-truncate d-inline-block"
                            style={{ fontSize: '0.72rem', maxWidth: 160 }}
                            title={b.requirement}
                          >
                            <i className="bi bi-chat-left-text me-1"></i>{b.requirement}
                          </span>
                        )}
                      </td>

                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <Avatar src={b.teacherId?.profilePhoto} name={b.teacherId?.fullName} size={30} />
                          <div>
                            <div className="fw-semibold small">{b.teacherId?.fullName || 'Teacher'}</div>
                            <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                              {b.teacherId?.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <Avatar src={b.studentId?.profilePhoto} name={b.studentId?.name} size={30} />
                          <div>
                            <div className="fw-semibold small">{b.studentId?.name || 'Student'}</div>
                            <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                              {b.studentId?.email} {b.studentId?.class ? `· Grade ${b.studentId.class}` : ''}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`badge ${
                            b.mode === 'Online'
                              ? 'bg-success bg-opacity-10 text-success'
                              : 'bg-warning bg-opacity-10 text-warning'
                          }`}
                          style={{ fontSize: '0.75rem' }}
                        >
                          {b.mode}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`badge ${
                            b.status === 'Approved'
                              ? 'bg-success'
                              : b.status === 'Pending'
                              ? 'bg-warning text-dark'
                              : 'bg-danger'
                          }`}
                          style={{ fontSize: '0.75rem' }}
                        >
                          {b.status}
                        </span>
                      </td>

                      <td className="text-end px-3">
                        {b.status === 'Pending' ? (
                          <div className="d-flex justify-content-end gap-1">
                            <button
                              className="btn btn-sm btn-outline-danger px-2 py-1"
                              style={{ fontSize: '0.75rem', borderRadius: 14 }}
                              disabled={actingId === b._id}
                              onClick={() => handleAction(b._id, 'Cancelled')}
                              title="Reject Booking Request"
                            >
                              Reject
                            </button>
                            <button
                              className="btn btn-sm btn-success px-2 py-1 fw-semibold"
                              style={{ fontSize: '0.75rem', borderRadius: 14 }}
                              disabled={actingId === b._id}
                              onClick={() => handleAction(b._id, 'Approved')}
                              title="Approve Booking Request"
                            >
                              Approve
                            </button>
                          </div>
                        ) : (
                          <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
                            {b.status === 'Approved' ? (
                              <span className="text-success"><i className="bi bi-check-circle me-1"></i>Confirmed</span>
                            ) : (
                              <span className="text-danger"><i className="bi bi-x-circle me-1"></i>Cancelled</span>
                            )}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
