import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getStudentDashboard, getNotifications, markNotificationsRead } from '../../services/studentService'
import Spinner from '../Common/Spinner'
import AlertMessage from '../Common/AlertMessage'

export default function StudentDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    getStudentDashboard()
      .then((res) => setData(res.data?.data))
      .catch(() => setError('Failed to load dashboard. Please refresh.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    getNotifications()
      .then((res) => setNotifications(res.data?.data || []))
      .catch(() => {})
  }, [])

  const handleMarkRead = async () => {
    try {
      await markNotificationsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    } catch {
      /* ignore */
    }
  }

  if (loading) return <Spinner />
  if (error) return <AlertMessage type="danger" message={error} />

  const todaysClasses = data?.todaysClasses || []
  const upcomingClasses = data?.upcomingClasses || []
  const bookings = data?.bookingHistory || []
  const payments = data?.payments || []
  const pendingPayments = payments.filter((p) => p.status === 'Pending').length

  return (
    <div>
      <p className="page-title">Dashboard</p>
      <p className="page-subtitle">Welcome back! Here is your learning overview.</p>

      {/* Stat cards */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-3">
          <div className="stat-card stat-card-blue rounded-3">
            <div>
              <div className="stat-number">{todaysClasses.length}</div>
              <div className="stat-label">Today's Classes</div>
            </div>
            <i className="bi bi-calendar-check-fill"></i>
          </div>
        </div>
        <div className="col-sm-6 col-xl-3">
          <div className="stat-card stat-card-red rounded-3">
            <div>
              <div className="stat-number">{upcomingClasses.length}</div>
              <div className="stat-label">Upcoming Classes</div>
            </div>
            <i className="bi bi-clock-history"></i>
          </div>
        </div>
        <div className="col-sm-6 col-xl-3">
          <div className="stat-card stat-card-green rounded-3">
            <div>
              <div className="stat-number">{bookings.length}</div>
              <div className="stat-label">Total Bookings</div>
            </div>
            <i className="bi bi-journal-bookmark-fill"></i>
          </div>
        </div>
        <div className="col-sm-6 col-xl-3">
          <div className="stat-card stat-card-yellow rounded-3">
            <div>
              <div className="stat-number">{pendingPayments}</div>
              <div className="stat-label">Pending Payments</div>
            </div>
            <i className="bi bi-credit-card-fill"></i>
          </div>
        </div>
      </div>

      <div className="row g-3">
        {/* Today's Classes */}
        <div className="col-lg-6">
          <div className="card h-100">
            <div className="card-header">
              <i className="bi bi-calendar-day me-2 text-primary"></i>Today's Classes
            </div>
            <div className="card-body p-0">
              {todaysClasses.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <i className="bi bi-calendar-x fs-2 d-block mb-2"></i>
                  No classes today
                </div>
              ) : (
                <ul className="list-group list-group-flush">
                  {todaysClasses.map((c) => (
                    <li key={c._id} className="list-group-item d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center gap-2">
                        {c.teacherId?.profilePhoto ? (
                          <img src={c.teacherId.profilePhoto} alt={c.teacherId.fullName} className="rounded-circle object-fit-cover flex-shrink-0" style={{ width: 30, height: 30 }} />
                        ) : (
                          <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 30, height: 30, fontSize: '0.8rem' }}>
                            <i className="bi bi-person-fill"></i>
                          </div>
                        )}
                        <div>
                          <div className="fw-semibold small">{c.subject}</div>
                          <div className="text-muted" style={{ fontSize: '0.78rem' }}>
                            {c.startTime} – {c.endTime} · {c.teacherId?.fullName}
                          </div>
                        </div>
                      </div>
                      <span
                        className="badge"
                        style={{
                          background: c.mode === 'Online' ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)',
                          color: c.mode === 'Online' ? 'var(--success)' : 'var(--warning)',
                          fontSize: '0.72rem',
                        }}
                      >
                        {c.mode}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="col-lg-6">
          <div className="card h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <span><i className="bi bi-journal-check me-2 text-primary"></i>Recent Bookings</span>
              <Link to="/student/bookings" className="btn btn-outline-primary btn-sm" style={{ fontSize: '0.75rem' }}>View All</Link>
            </div>
            <div className="card-body p-0">
              {bookings.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <i className="bi bi-journal-x fs-2 d-block mb-2"></i>
                  No bookings yet
                </div>
              ) : (
                <ul className="list-group list-group-flush">
                  {bookings.slice(0, 5).map((b) => (
                    <li key={b._id} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <div className="fw-semibold small">{b.subject}</div>
                        <div className="text-muted" style={{ fontSize: '0.78rem' }}>{new Date(b.date).toLocaleDateString()} · {b.startTime} – {b.endTime}</div>
                      </div>
                      <span className={`badge badge-${b.status?.toLowerCase()} px-2 py-1`}>{b.status}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="row g-3">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <span><i className="bi bi-bell me-2 text-primary"></i>Notifications</span>
              <div className="d-flex align-items-center gap-2">
                {notifications.some((n) => !n.read) && (
                  <button className="btn btn-outline-primary btn-sm" style={{ fontSize: '0.75rem' }} onClick={handleMarkRead}>
                    Mark all read
                  </button>
                )}
                <Link to="/student/inbox" className="btn btn-outline-primary btn-sm" style={{ fontSize: '0.75rem' }}>View All</Link>
              </div>
            </div>
            <div className="card-body p-0">
              {notifications.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <i className="bi bi-bell-slash fs-2 d-block mb-2"></i>
                  No notifications
                </div>
              ) : (
                <ul className="list-group list-group-flush">
                  {notifications.map((n) => (
                    <li key={n._id} className={`list-group-item d-flex justify-content-between align-items-center ${!n.read ? 'bg-warning bg-opacity-10' : ''}`}>
                      <div>
                        <div className="small">{n.message}</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                          {n.teacherId?.fullName || 'Teacher'} · {new Date(n.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      {!n.read && <span className="badge bg-warning">New</span>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
