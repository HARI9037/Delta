import { useEffect, useState } from 'react'
import { getRegistrations, updateRegistrationStatus } from '../../services/adminService'
import Spinner from '../Common/Spinner'
import AlertMessage from '../Common/AlertMessage'
import Avatar from '../Common/Avatar'

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ── Registration Request Detail Modal ──
function RequestDetailModal({ request, onClose, onAction, acting }) {
  if (!request) return null
  const isStudent = request.role === 'student'

  return (
    <div className="modal d-block" style={{ background: 'rgba(11,23,78,0.55)', zIndex: 1060 }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 16, overflow: 'hidden' }}>
          {/* Header */}
          <div
            className="p-4 text-white d-flex align-items-center justify-content-between"
            style={{ background: 'linear-gradient(135deg, #0B174E 0%, #25233F 100%)' }}
          >
            <div className="d-flex align-items-center gap-3">
              <Avatar src={request.profilePhoto} name={request.name} size={56} />
              <div>
                <h5 className="fw-bold mb-0 text-white">{request.name}</h5>
                <div className="d-flex align-items-center gap-2 mt-1">
                  <span
                    className={`badge ${isStudent ? 'bg-info text-dark' : 'bg-warning text-dark'}`}
                    style={{ fontSize: '0.75rem', textTransform: 'capitalize' }}
                  >
                    {request.role}
                  </span>
                  <span className="text-white-50 small">{request.email}</span>
                </div>
              </div>
            </div>
            <button className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          {/* Body */}
          <div className="modal-body p-4">
            <div className="row g-3">
              <div className="col-md-6">
                <div className="p-3 rounded-3" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                  <span className="text-muted small d-block mb-1">Contact Details</span>
                  <div className="fw-semibold small mb-1">
                    <i className="bi bi-envelope me-2 text-primary"></i>{request.email}
                  </div>
                  <div className="fw-semibold small">
                    <i className="bi bi-telephone me-2 text-primary"></i>{request.phone || 'N/A'}
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="p-3 rounded-3" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                  <span className="text-muted small d-block mb-1">Registration Timeline</span>
                  <div className="fw-semibold small mb-1">
                    <i className="bi bi-calendar-event me-2 text-primary"></i>Requested: {formatDate(request.createdAt)}
                  </div>
                  <div className="fw-semibold small">
                    <i className="bi bi-info-circle me-2 text-primary"></i>Current Status:{' '}
                    <span className={`badge ${request.status === 'Verified' ? 'bg-success' : request.status === 'Rejected' ? 'bg-danger' : 'bg-warning text-dark'}`}>
                      {request.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Role-Specific Fields */}
              {isStudent ? (
                <>
                  <div className="col-md-6">
                    <label className="form-label text-muted small mb-1">Class / Grade</label>
                    <div className="form-control form-control-sm bg-light">{request.grade || request.class || 'N/A'}</div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted small mb-1">School</label>
                    <div className="form-control form-control-sm bg-light">{request.school || 'N/A'}</div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted small mb-1">Parent Name</label>
                    <div className="form-control form-control-sm bg-light">{request.parentName || 'N/A'}</div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted small mb-1">Parent Phone</label>
                    <div className="form-control form-control-sm bg-light">{request.parentPhone || 'N/A'}</div>
                  </div>
                  <div className="col-12">
                    <label className="form-label text-muted small mb-1">Subjects Enrolled</label>
                    <div className="d-flex flex-wrap gap-1">
                      {request.subjects && request.subjects.length > 0 ? (
                        request.subjects.map((sub, idx) => (
                          <span key={idx} className="badge bg-secondary">{sub}</span>
                        ))
                      ) : (
                        <span className="text-muted small">No subjects listed</span>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="col-md-6">
                    <label className="form-label text-muted small mb-1">Qualification</label>
                    <div className="form-control form-control-sm bg-light">{request.qualification || 'N/A'}</div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted small mb-1">Teaching Experience</label>
                    <div className="form-control form-control-sm bg-light">{request.teachingExperience || 'N/A'}</div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted small mb-1">Teaching Mode</label>
                    <div className="form-control form-control-sm bg-light">{request.teachingMode || 'N/A'}</div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted small mb-1">Subjects Taught</label>
                    <div className="d-flex flex-wrap gap-1 mt-1">
                      {request.subjects && request.subjects.length > 0 ? (
                        request.subjects.map((sub, idx) => (
                          <span key={idx} className="badge bg-secondary">{sub}</span>
                        ))
                      ) : (
                        <span className="text-muted small">No subjects listed</span>
                      )}
                    </div>
                  </div>
                  {request.bio && (
                    <div className="col-12">
                      <label className="form-label text-muted small mb-1">Bio / Profile Notes</label>
                      <div className="form-control form-control-sm bg-light" style={{ minHeight: 60 }}>{request.bio}</div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="modal-footer border-0 px-4 pb-4 bg-light d-flex justify-content-between">
            <button className="btn btn-outline-secondary btn-sm px-4" onClick={onClose}>
              Close
            </button>
            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-danger btn-sm px-4"
                disabled={acting === request._id}
                onClick={() => onAction(request._id, request.role, 'Rejected')}
              >
                {acting === request._id ? 'Processing…' : 'Reject Request'}
              </button>
              <button
                className="btn btn-success btn-sm px-4 fw-semibold"
                disabled={acting === request._id}
                onClick={() => onAction(request._id, request.role, 'Verified')}
              >
                {acting === request._id ? 'Processing…' : 'Approve Request'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main Approve Registrations Page Component ──
export default function ApproveRegistrations() {
  const [requests, setRequests] = useState([])
  const [counts, setCounts] = useState({ all: 0, students: 0, teachers: 0 })
  const [activeTab, setActiveTab] = useState('all') // 'all' | 'student' | 'teacher'
  const [statusTab, setStatusTab] = useState('Pending') // 'Pending' | 'Verified' | 'Rejected' | 'all'
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [actingId, setActingId] = useState(null)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const res = await getRegistrations({ role: activeTab, status: statusTab })
      const data = res.data?.data || {}
      setRequests(data.requests || [])
      if (data.counts) setCounts(data.counts)
    } catch {
      setError('Failed to fetch registration requests.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [activeTab, statusTab])

  const handleAction = async (id, role, status) => {
    setActingId(id)
    try {
      await updateRegistrationStatus(id, { role, status })
      setSuccess(`User registration ${status.toLowerCase()} successfully.`)
      if (selectedRequest && selectedRequest._id === id) {
        setSelectedRequest(null)
      }
      fetchRequests()
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update registration status.')
    } finally {
      setActingId(null)
    }
  }

  const filtered = requests.filter((r) => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      r.name?.toLowerCase().includes(term) ||
      r.email?.toLowerCase().includes(term) ||
      r.phone?.toLowerCase().includes(term)
    )
  })

  return (
    <div>
      <p className="page-title">Registration Requests</p>
      <p className="page-subtitle">
        Review pending registration requests from new Students and Teachers.
      </p>

      <AlertMessage type="danger" message={error} />
      <AlertMessage type="success" message={success} />

      {/* ── Social Media Header & Filter Bar ── */}
      <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 14 }}>
        <div className="card-body p-3">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            {/* Role Filter Tabs (All / Students / Teachers with badges) */}
            <div className="nav nav-pills gap-2">
              <button
                className={`nav-link btn-sm d-flex align-items-center gap-2 ${activeTab === 'all' ? 'active bg-primary' : 'bg-light text-dark'}`}
                style={{ borderRadius: 20, padding: '0.45rem 1rem', fontSize: '0.85rem', fontWeight: 600 }}
                onClick={() => setActiveTab('all')}
              >
                <i className="bi bi-people-fill"></i>All Requests
                <span className={`badge ${activeTab === 'all' ? 'bg-white text-primary' : 'bg-secondary text-white'}`} style={{ borderRadius: 10 }}>
                  {counts.all}
                </span>
              </button>

              <button
                className={`nav-link btn-sm d-flex align-items-center gap-2 ${activeTab === 'student' ? 'active bg-primary' : 'bg-light text-dark'}`}
                style={{ borderRadius: 20, padding: '0.45rem 1rem', fontSize: '0.85rem', fontWeight: 600 }}
                onClick={() => setActiveTab('student')}
              >
                <i className="bi bi-mortarboard-fill"></i>Students
                <span className={`badge ${activeTab === 'student' ? 'bg-white text-primary' : 'bg-secondary text-white'}`} style={{ borderRadius: 10 }}>
                  {counts.students}
                </span>
              </button>

              <button
                className={`nav-link btn-sm d-flex align-items-center gap-2 ${activeTab === 'teacher' ? 'active bg-primary' : 'bg-light text-dark'}`}
                style={{ borderRadius: 20, padding: '0.45rem 1rem', fontSize: '0.85rem', fontWeight: 600 }}
                onClick={() => setActiveTab('teacher')}
              >
                <i className="bi bi-person-video3"></i>Teachers
                <span className={`badge ${activeTab === 'teacher' ? 'bg-white text-primary' : 'bg-secondary text-white'}`} style={{ borderRadius: 10 }}>
                  {counts.teachers}
                </span>
              </button>
            </div>

            {/* Controls: Search & Status Filter */}
            <div className="d-flex align-items-center gap-2">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search requests..."
                style={{ borderRadius: 20, maxWidth: 220 }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select
                className="form-select form-select-sm"
                style={{ borderRadius: 20, width: 'auto' }}
                value={statusTab}
                onChange={(e) => setStatusTab(e.target.value)}
              >
                <option value="Pending">Pending Only</option>
                <option value="Verified">Approved Only</option>
                <option value="Rejected">Rejected Only</option>
                <option value="all">All Statuses</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ── Social Request Cards Container ── */}
      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <div className="card border-0 shadow-sm p-5 text-center text-muted" style={{ borderRadius: 14 }}>
          <i className="bi bi-person-check fs-1 text-success opacity-50 mb-2"></i>
          <h6 className="fw-bold mb-1">No registration requests found</h6>
          <p className="small text-muted mb-0">There are currently no registration requests matching your filter criteria.</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {filtered.map((req) => {
            const isStudent = req.role === 'student'
            const isActing = actingId === req._id

            return (
              <div
                key={req._id}
                className="card border-0 shadow-sm text-dark hover-shadow"
                style={{
                  borderRadius: 14,
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  borderLeft: `5px solid ${req.status === 'Verified' ? '#22C55E' : req.status === 'Rejected' ? '#EF4444' : '#F59E0B'}`,
                }}
              >
                <div className="card-body p-3">
                  <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3">
                    {/* Left: Avatar + Details (clickable to open modal) */}
                    <div
                      className="d-flex align-items-center gap-3 cursor-pointer flex-grow-1"
                      onClick={() => setSelectedRequest(req)}
                      title="Click to view full details"
                    >
                      <Avatar src={req.profilePhoto} name={req.name} size={52} />

                      <div>
                        <div className="d-flex align-items-center gap-2 flex-wrap">
                          <span className="fw-bold text-dark" style={{ fontSize: '0.98rem' }}>
                            {req.name}
                          </span>
                          <span
                            className={`badge ${isStudent ? 'bg-info text-dark' : 'bg-warning text-dark'}`}
                            style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 0.5 }}
                          >
                            {req.role}
                          </span>
                          <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
                            &bull; {formatDate(req.createdAt)}
                          </span>
                        </div>

                        <div className="text-secondary small mt-1 d-flex align-items-center gap-3 flex-wrap">
                          <span>
                            <i className="bi bi-envelope me-1 text-primary"></i>
                            {req.email}
                          </span>
                          {isStudent ? (
                            <span>
                              <i className="bi bi-mortarboard me-1 text-primary"></i>
                              {req.grade || req.class ? `Class: ${req.grade || req.class}` : 'Student'}
                            </span>
                          ) : (
                            <span>
                              <i className="bi bi-award me-1 text-primary"></i>
                              {req.qualification || 'Teacher'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Quick Action Buttons */}
                    <div className="d-flex align-items-center gap-2 ms-auto ms-sm-0">
                      {req.status === 'Pending' ? (
                        <>
                          <button
                            className="btn btn-success btn-sm px-3 fw-semibold d-flex align-items-center gap-1"
                            style={{ borderRadius: 20, fontSize: '0.82rem' }}
                            disabled={isActing}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAction(req._id, req.role, 'Verified')
                            }}
                          >
                            <i className="bi bi-check-lg"></i>
                            {isActing ? '...' : 'Approve'}
                          </button>
                          <button
                            className="btn btn-outline-danger btn-sm px-3 fw-semibold d-flex align-items-center gap-1"
                            style={{ borderRadius: 20, fontSize: '0.82rem' }}
                            disabled={isActing}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAction(req._id, req.role, 'Rejected')
                            }}
                          >
                            <i className="bi bi-x-lg"></i>
                            {isActing ? '...' : 'Reject'}
                          </button>
                        </>
                      ) : (
                        <div className="d-flex align-items-center gap-2">
                          <span className={`badge ${req.status === 'Verified' ? 'bg-success' : 'bg-danger'}`} style={{ borderRadius: 12, padding: '5px 12px' }}>
                            {req.status}
                          </span>
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            style={{ borderRadius: 20, fontSize: '0.75rem' }}
                            onClick={() => setSelectedRequest(req)}
                          >
                            Details
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Detail Review Modal */}
      {selectedRequest && (
        <RequestDetailModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onAction={handleAction}
          acting={actingId}
        />
      )}
    </div>
  )
}
