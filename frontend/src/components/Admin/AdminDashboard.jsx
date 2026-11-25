import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAdminDashboard, updateRegistrationStatus, confirmOrRejectBooking } from '../../services/adminService'
import Spinner from '../Common/Spinner'
import AlertMessage from '../Common/AlertMessage'
import AnnouncementSection from '../Common/AnnouncementSection'
import Avatar from '../Common/Avatar'
import { formatLocalDate } from '../../utils/dateUtils'

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [actingId, setActingId] = useState(null)
  const [actingBookingId, setActingBookingId] = useState(null)

  const fetchDashboard = async () => {
    try {
      setLoading(true)
      const res = await getAdminDashboard()
      setData(res.data?.data || null)
    } catch {
      setError('Failed to load admin dashboard statistics.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  const handleRegistrationAction = async (id, role, status) => {
    setActingId(id)
    try {
      await updateRegistrationStatus(id, { role, status })
      setSuccess(`Registration ${status.toLowerCase()} successfully.`)
      fetchDashboard()
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update registration.')
    } finally {
      setActingId(null)
    }
  }

  const handleBookingAction = async (id, status) => {
    setActingBookingId(id)
    try {
      await confirmOrRejectBooking(id, { status })
      setSuccess(`Booking request ${status.toLowerCase()} successfully.`)
      fetchDashboard()
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update booking status.')
    } finally {
      setActingBookingId(null)
    }
  }

  if (loading) return <Spinner />

  const stats = data?.stats || {
    totalStudents: 0,
    totalTeachers: 0,
    pendingRegistrations: 0,
    pendingPayments: 0,
    pendingBookings: 0,
    totalBookings: 0,
  }

  const pendingRegs = data?.recentPendingRegistrations || []
  const pendingPmts = data?.recentPendingPayments || []
  const pendingBookings = data?.recentPendingBookings || []

  return (
    <div>
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
        <div>
          <p className="page-title mb-1">Admin Dashboard</p>
          <p className="page-subtitle mb-0">Welcome back, Administrator. High-level system overview & controls.</p>
        </div>
        {/* Quick Access Actions */}
        <div className="d-flex flex-wrap gap-2">
          <Link to="/admin/timetable" className="btn btn-primary btn-sm px-3 rounded-pill fw-semibold">
            <i className="bi bi-table me-1"></i>Master Timetable
          </Link>
          <Link to="/admin/booking-confirmations" className="btn btn-warning text-dark btn-sm px-3 rounded-pill fw-semibold">
            <i className="bi bi-check2-square me-1"></i>Booking Requests ({stats.pendingBookings})
          </Link>
          <Link to="/teacher/availability" className="btn btn-outline-primary btn-sm px-3 rounded-pill fw-semibold">
            <i className="bi bi-calendar-plus me-1"></i>Update My Availability
          </Link>
        </div>
      </div>

      <AlertMessage type="danger" message={error} />
      <AlertMessage type="success" message={success} />

      {/* ── Stat Cards Grid ── */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-2">
          <Link to="/admin/students" className="text-decoration-none">
            <div className="stat-card stat-card-blue rounded-3 p-3 h-100">
              <div>
                <div className="stat-number">{stats.totalStudents}</div>
                <div className="stat-label">Total Students</div>
              </div>
              <i className="bi bi-mortarboard-fill fs-3" />
            </div>
          </Link>
        </div>

        <div className="col-sm-6 col-xl-2">
          <Link to="/admin/teachers" className="text-decoration-none">
            <div className="stat-card stat-card-blue rounded-3 p-3 h-100">
              <div>
                <div className="stat-number">{stats.totalTeachers}</div>
                <div className="stat-label">Total Teachers</div>
              </div>
              <i className="bi bi-person-video3 fs-3" />
            </div>
          </Link>
        </div>

        <div className="col-sm-6 col-xl-2">
          <Link to="/admin/registrations" className="text-decoration-none">
            <div className="stat-card stat-card-red rounded-3 p-3 h-100">
              <div>
                <div className="stat-number">{stats.pendingRegistrations}</div>
                <div className="stat-label">Pending Regs</div>
              </div>
              <i className="bi bi-person-plus-fill fs-3" />
            </div>
          </Link>
        </div>

        <div className="col-sm-6 col-xl-2">
          <Link to="/admin/booking-confirmations" className="text-decoration-none">
            <div className="stat-card stat-card-yellow rounded-3 p-3 h-100 border border-warning">
              <div>
                <div className="stat-number text-warning">{stats.pendingBookings}</div>
                <div className="stat-label fw-bold">Pending Bookings</div>
              </div>
              <i className="bi bi-calendar-check-fill fs-3 text-warning" />
            </div>
          </Link>
        </div>

        <div className="col-sm-6 col-xl-2">
          <Link to="/admin/timetable" className="text-decoration-none">
            <div className="stat-card stat-card-green rounded-3 p-3 h-100">
              <div>
                <div className="stat-number">{stats.totalBookings}</div>
                <div className="stat-label">Total Bookings</div>
              </div>
              <i className="bi bi-calendar-event-fill fs-3" />
            </div>
          </Link>
        </div>

        <div className="col-sm-6 col-xl-2">
          <Link to="/admin/payments" className="text-decoration-none">
            <div className="stat-card stat-card-yellow rounded-3 p-3 h-100">
              <div>
                <div className="stat-number">{stats.pendingPayments}</div>
                <div className="stat-label">Pending Payments</div>
              </div>
              <i className="bi bi-credit-card-fill fs-3" />
            </div>
          </Link>
        </div>
      </div>

      <div className="row g-4">
        {/* ── Pending Session Booking Requests Widget ── */}
        <div className="col-12">
          <div className="card shadow-sm border-0" style={{ borderRadius: 14 }}>
            <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
              <span className="fw-bold text-dark">
                <i className="bi bi-calendar-plus-fill me-2 text-warning"></i>
                Student Session Requests Requiring Admin Approval
              </span>
              <div className="d-flex gap-2">
                <Link to="/admin/timetable" className="btn btn-sm btn-outline-secondary" style={{ borderRadius: 20, fontSize: '0.78rem' }}>
                  <i className="bi bi-table me-1"></i>Master Timetable
                </Link>
                <Link to="/admin/booking-confirmations" className="btn btn-sm btn-warning" style={{ borderRadius: 20, fontSize: '0.78rem' }}>
                  View All Requests ({stats.pendingBookings})
                </Link>
              </div>
            </div>
            <div className="card-body p-0">
              {pendingBookings.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="bi bi-calendar-check fs-2 text-success d-block mb-2"></i>
                  <h6 className="fw-bold mb-1">No pending session booking requests!</h6>
                  <p className="small text-muted mb-0">All student requests have been processed.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.84rem' }}>
                    <thead className="table-light">
                      <tr>
                        <th className="px-3">Student</th>
                        <th>Preferred Teacher</th>
                        <th>Subject & Schedule</th>
                        <th>Mode</th>
                        <th>Notes / Requirement</th>
                        <th className="text-end px-3">Decision</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingBookings.map((b) => (
                        <tr key={b._id}>
                          <td className="px-3">
                            <div className="d-flex align-items-center gap-2">
                              <Avatar src={b.studentId?.profilePhoto} name={b.studentId?.name} size={32} />
                              <div>
                                <div className="fw-bold text-dark">{b.studentId?.name || 'Student'}</div>
                                <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                                  {b.studentId?.email} {b.studentId?.class ? `· Grade ${b.studentId.class}` : ''}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <Avatar src={b.teacherId?.profilePhoto} name={b.teacherId?.fullName} size={32} />
                              <div>
                                <div className="fw-bold text-dark">{b.teacherId?.fullName || 'Teacher'}</div>
                                <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                                  {b.teacherId?.email}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td>
                            <span className="badge bg-primary bg-opacity-10 text-primary px-2 py-1 mb-1 d-inline-block">
                              {b.subject}
                            </span>
                            <div className="small fw-semibold text-dark">
                              {formatLocalDate(b.date)} &bull; {b.startTime} - {b.endTime}
                            </div>
                          </td>

                          <td>
                            <span className={`badge ${b.mode === 'Online' ? 'bg-success bg-opacity-10 text-success' : 'bg-warning bg-opacity-10 text-warning'}`}>
                              {b.mode}
                            </span>
                          </td>

                          <td>
                            <span className="text-muted small text-truncate d-inline-block" style={{ maxWidth: 180 }}>
                              {b.requirement || '—'}
                            </span>
                          </td>

                          <td className="text-end px-3">
                            <div className="d-flex justify-content-end gap-1">
                              <button
                                className="btn btn-sm btn-outline-danger px-3 py-1"
                                style={{ borderRadius: 16, fontSize: '0.75rem' }}
                                disabled={actingBookingId === b._id}
                                onClick={() => handleBookingAction(b._id, 'Cancelled')}
                              >
                                Reject
                              </button>
                              <button
                                className="btn btn-sm btn-success px-3 py-1 fw-semibold"
                                style={{ borderRadius: 16, fontSize: '0.75rem' }}
                                disabled={actingBookingId === b._id}
                                onClick={() => handleBookingAction(b._id, 'Approved')}
                              >
                                Approve
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Pending Registrations Quick Requests Widget ── */}
        <div className="col-lg-6">
          <div className="card h-100 shadow-sm border-0" style={{ borderRadius: 14 }}>
            <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
              <span className="fw-bold text-dark">
                <i className="bi bi-person-lines-fill me-2 text-danger"></i>Pending User Registrations
              </span>
              <Link to="/admin/registrations" className="btn btn-sm btn-outline-primary" style={{ borderRadius: 20, fontSize: '0.78rem' }}>
                View All ({stats.pendingRegistrations})
              </Link>
            </div>
            <div className="card-body p-3">
              {pendingRegs.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <i className="bi bi-check-circle fs-3 text-success d-block mb-2"></i>
                  <span className="small">No pending registration requests!</span>
                </div>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {pendingRegs.map((req) => (
                    <div
                      key={req._id}
                      className="d-flex align-items-center justify-content-between p-2 rounded-3"
                      style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}
                    >
                      <div className="d-flex align-items-center gap-3">
                        <Avatar src={req.profilePhoto} name={req.name} size={40} />
                        <div>
                          <div className="fw-semibold text-dark small mb-0">{req.name}</div>
                          <div className="text-muted" style={{ fontSize: '0.74rem' }}>
                            {req.email} &bull;{' '}
                            <span className={`badge ${req.role === 'student' ? 'bg-info text-dark' : 'bg-warning text-dark'}`} style={{ fontSize: '0.65rem' }}>
                              {req.role}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="d-flex gap-1">
                        <button
                          className="btn btn-sm btn-success px-3 py-1"
                          style={{ fontSize: '0.75rem', borderRadius: 16 }}
                          disabled={actingId === req._id}
                          onClick={() => handleRegistrationAction(req._id, req.role, 'Verified')}
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger px-3 py-1"
                          style={{ fontSize: '0.75rem', borderRadius: 16 }}
                          disabled={actingId === req._id}
                          onClick={() => handleRegistrationAction(req._id, req.role, 'Rejected')}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Pending Payments Quick Widget ── */}
        <div className="col-lg-6">
          <div className="card h-100 shadow-sm border-0" style={{ borderRadius: 14 }}>
            <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
              <span className="fw-bold text-dark">
                <i className="bi bi-credit-card me-2 text-warning"></i>Pending Payments
              </span>
              <Link to="/admin/payments" className="btn btn-sm btn-outline-primary" style={{ borderRadius: 20, fontSize: '0.78rem' }}>
                Manage Payments ({stats.pendingPayments})
              </Link>
            </div>
            <div className="card-body p-3">
              {pendingPmts.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <i className="bi bi-check2-circle fs-3 text-success d-block mb-2"></i>
                  <span className="small">No pending payment verifications!</span>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.82rem' }}>
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Month/Year</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingPmts.map((p) => (
                        <tr key={p._id}>
                          <td>
                            <div className="fw-semibold">{p.studentId?.name || '—'}</div>
                            <div className="text-muted" style={{ fontSize: '0.72rem' }}>{p.studentId?.email}</div>
                          </td>
                          <td>{p.month} {p.year}</td>
                          <td className="fw-semibold">{p.currency || 'INR'} {p.amount}</td>
                          <td>
                            <span className={`badge ${p.status === 'Uploaded' ? 'bg-primary' : 'bg-warning text-dark'}`}>
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── System Announcements Feed ── */}
        <div className="col-12 mt-2">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0 text-dark">
              <i className="bi bi-megaphone-fill me-2 text-warning"></i>Announcements Overview
            </h5>
            <Link to="/admin/announcements" className="btn btn-sm btn-primary px-3 rounded-pill fw-semibold" style={{ fontSize: '0.82rem' }}>
              <i className="bi bi-plus-lg me-1"></i>Create / Manage Announcements
            </Link>
          </div>
          <AnnouncementSection />
        </div>
      </div>
    </div>
  )
}
