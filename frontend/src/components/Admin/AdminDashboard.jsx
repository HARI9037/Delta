import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAdminDashboard, updateRegistrationStatus } from '../../services/adminService'
import Spinner from '../Common/Spinner'
import AlertMessage from '../Common/AlertMessage'
import AnnouncementSection from '../Common/AnnouncementSection'
import Avatar from '../Common/Avatar'

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [actingId, setActingId] = useState(null)

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

  const handleAction = async (id, role, status) => {
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

  return (
    <div>
      <p className="page-title">Admin Dashboard</p>
      <p className="page-subtitle">Welcome back, Administrator. High-level system overview & controls.</p>

      <AlertMessage type="danger" message={error} />
      <AlertMessage type="success" message={success} />

      {/* ── Stat Cards Grid ── */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-2">
          <div className="stat-card stat-card-blue rounded-3 p-3">
            <div>
              <div className="stat-number">{stats.totalStudents}</div>
              <div className="stat-label">Total Students</div>
            </div>
            <i className="bi bi-mortarboard-fill fs-3" />
          </div>
        </div>

        <div className="col-sm-6 col-xl-2">
          <div className="stat-card stat-card-blue rounded-3 p-3">
            <div>
              <div className="stat-number">{stats.totalTeachers}</div>
              <div className="stat-label">Total Teachers</div>
            </div>
            <i className="bi bi-person-video3 fs-3" />
          </div>
        </div>

        <div className="col-sm-6 col-xl-2">
          <div className="stat-card stat-card-red rounded-3 p-3">
            <div>
              <div className="stat-number">{stats.pendingRegistrations}</div>
              <div className="stat-label">Pending Regs</div>
            </div>
            <i className="bi bi-person-plus-fill fs-3" />
          </div>
        </div>

        <div className="col-sm-6 col-xl-2">
          <div className="stat-card stat-card-yellow rounded-3 p-3">
            <div>
              <div className="stat-number">{stats.pendingPayments}</div>
              <div className="stat-label">Pending Payments</div>
            </div>
            <i className="bi bi-credit-card-fill fs-3" />
          </div>
        </div>

        <div className="col-sm-6 col-xl-2">
          <div className="stat-card stat-card-yellow rounded-3 p-3">
            <div>
              <div className="stat-number">{stats.pendingBookings}</div>
              <div className="stat-label">Pending Bookings</div>
            </div>
            <i className="bi bi-calendar-check-fill fs-3" />
          </div>
        </div>

        <div className="col-sm-6 col-xl-2">
          <div className="stat-card stat-card-green rounded-3 p-3">
            <div>
              <div className="stat-number">{stats.totalBookings}</div>
              <div className="stat-label">Total Bookings</div>
            </div>
            <i className="bi bi-calendar-event-fill fs-3" />
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* ── Pending Registrations Quick Requests Widget ── */}
        <div className="col-lg-6">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
              <span className="fw-bold text-dark">
                <i className="bi bi-person-lines-fill me-2 text-danger"></i>Pending Registration Requests
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
                          onClick={() => handleAction(req._id, req.role, 'Verified')}
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger px-3 py-1"
                          style={{ fontSize: '0.75rem', borderRadius: 16 }}
                          disabled={actingId === req._id}
                          onClick={() => handleAction(req._id, req.role, 'Rejected')}
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
          <div className="card h-100 shadow-sm border-0">
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
        <div className="col-12 mt-4">
          <AnnouncementSection />
        </div>
      </div>
    </div>
  )
}
