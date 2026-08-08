import { useEffect, useState } from 'react'
import { getAllStudents, getStudentDetails } from '../../services/adminService'
import Spinner from '../Common/Spinner'
import AlertMessage from '../Common/AlertMessage'

function StudentDetailModal({ studentId, onClose }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  useEffect(() => {
    if (!studentId) return
    getStudentDetails(studentId)
      .then((res) => setData(res.data?.data))
      .catch(() => setErr('Failed to load student details'))
      .finally(() => setLoading(false))
  }, [studentId])

  return (
    <div className="modal d-block" style={{ background: 'rgba(11,23,78,0.55)', zIndex: 1060 }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 16, overflow: 'hidden' }}>
          <div className="p-4 text-white d-flex align-items-center justify-content-between" style={{ background: 'linear-gradient(135deg,#0B174E,#25233F)' }}>
            <h5 className="fw-bold mb-0"><i className="bi bi-mortarboard-fill me-2"></i>Student Details</h5>
            <button className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
            {loading ? (
              <Spinner />
            ) : err ? (
              <AlertMessage type="danger" message={err} />
            ) : data ? (
              <div>
                {/* Info Card */}
                <div className="d-flex align-items-center gap-3 p-3 mb-4 rounded-3" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                  <div className="rounded-circle bg-primary text-white fw-bold d-flex align-items-center justify-content-center" style={{ width: 60, height: 60, fontSize: '1.3rem' }}>
                    {data.student.profilePhoto ? (
                      <img src={data.student.profilePhoto} alt={data.student.name} className="w-100 h-100 rounded-circle" style={{ objectFit: 'cover' }} />
                    ) : (
                      data.student.name?.substring(0, 2).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h5 className="fw-bold mb-1">{data.student.name}</h5>
                    <div className="text-muted small">
                      {data.student.email} &bull; {data.student.phone}
                    </div>
                    <div className="mt-1">
                      <span className="badge bg-primary me-2">Class: {data.student.grade || data.student.class || 'N/A'}</span>
                      <span className="badge bg-secondary me-2">School: {data.student.school || 'N/A'}</span>
                      <span className={`badge ${data.student.status === 'Verified' ? 'bg-success' : 'bg-warning text-dark'}`}>{data.student.status}</span>
                    </div>
                  </div>
                </div>

                {/* Parent Contact */}
                <div className="mb-4">
                  <h6 className="fw-bold mb-2">Parent / Guardian Information</h6>
                  <div className="p-3 rounded-3" style={{ background: '#F1F5F9' }}>
                    <div className="row g-2 small">
                      <div className="col-6"><strong>Parent Name:</strong> {data.student.parentName || 'N/A'}</div>
                      <div className="col-6"><strong>Parent Phone:</strong> {data.student.parentPhone || 'N/A'}</div>
                    </div>
                  </div>
                </div>

                {/* Bookings History */}
                <div className="mb-4">
                  <h6 className="fw-bold mb-2">Booking History ({data.bookings?.length || 0})</h6>
                  {data.bookings?.length === 0 ? (
                    <p className="text-muted small">No bookings recorded.</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-sm table-hover align-middle small">
                        <thead>
                          <tr>
                            <th>Teacher</th>
                            <th>Subject</th>
                            <th>Date & Slot</th>
                            <th>Mode</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.bookings.map((b) => (
                            <tr key={b._id}>
                              <td>{b.teacherId?.fullName || '—'}</td>
                              <td>{b.subject}</td>
                              <td>{b.date} ({b.startTime} - {b.endTime})</td>
                              <td>{b.mode}</td>
                              <td>
                                <span className={`badge ${b.status === 'Approved' ? 'bg-success' : 'bg-warning text-dark'}`}>{b.status}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Payment History */}
                <div>
                  <h6 className="fw-bold mb-2">Payment Records ({data.payments?.length || 0})</h6>
                  {data.payments?.length === 0 ? (
                    <p className="text-muted small">No payments recorded.</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-sm table-hover align-middle small">
                        <thead>
                          <tr>
                            <th>Month / Year</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Paid At</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.payments.map((p) => (
                            <tr key={p._id}>
                              <td>{p.month} {p.year}</td>
                              <td>{p.currency || 'INR'} {p.amount}</td>
                              <td><span className={`badge ${p.status === 'Verified' ? 'bg-success' : 'bg-warning text-dark'}`}>{p.status}</span></td>
                              <td className="text-muted">{p.paidAt ? new Date(p.paidAt).toLocaleDateString() : '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
          <div className="modal-footer border-0 bg-light">
            <button className="btn btn-secondary btn-sm" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AllStudents() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedStudentId, setSelectedStudentId] = useState(null)

  const fetchStudents = async () => {
    setLoading(true)
    try {
      const res = await getAllStudents({ search: searchTerm, status: statusFilter })
      setStudents(res.data?.data || [])
    } catch {
      setError('Failed to fetch student directory.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [statusFilter])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    fetchStudents()
  }

  return (
    <div>
      <p className="page-title">All Students Directory</p>
      <p className="page-subtitle">View and manage all enrolled student accounts across the tuition system.</p>

      <AlertMessage type="danger" message={error} />

      {/* Filter / Search Bar */}
      <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 12 }}>
        <div className="card-body py-2">
          <form onSubmit={handleSearchSubmit} className="row g-2 align-items-center">
            <div className="col-md-6">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search student by name, email, phone, or school..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <select className="form-select form-select-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All Approval Statuses</option>
                <option value="Verified">Verified</option>
                <option value="Pending">Pending Approval</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div className="col-md-2">
              <button type="submit" className="btn btn-primary btn-sm w-100">
                <i className="bi bi-search me-1"></i>Search
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Directory Table */}
      {loading ? (
        <Spinner />
      ) : (
        <div className="card border-0 shadow-sm" style={{ borderRadius: 14, overflow: 'hidden' }}>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th className="px-3">Student Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Grade / Class</th>
                    <th>School</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-4 text-muted">
                        No students found.
                      </td>
                    </tr>
                  ) : (
                    students.map((s) => (
                      <tr key={s._id}>
                        <td className="px-3">
                          <div className="d-flex align-items-center gap-2">
                            <div className="rounded-circle bg-primary text-white fw-bold d-flex align-items-center justify-content-center" style={{ width: 34, height: 34, fontSize: '0.8rem' }}>
                              {s.profilePhoto ? (
                                <img src={s.profilePhoto} alt={s.name} className="w-100 h-100 rounded-circle" style={{ objectFit: 'cover' }} />
                              ) : (
                                s.name?.substring(0, 2).toUpperCase()
                              )}
                            </div>
                            <span className="fw-semibold small">{s.name}</span>
                          </div>
                        </td>
                        <td className="small text-muted">{s.email}</td>
                        <td className="small text-muted">{s.phone}</td>
                        <td className="small fw-semibold">{s.grade || s.class || '—'}</td>
                        <td className="small text-muted">{s.school || '—'}</td>
                        <td>
                          <span className={`badge ${s.status === 'Verified' ? 'bg-success' : s.status === 'Rejected' ? 'bg-danger' : 'bg-warning text-dark'}`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="small text-muted">{new Date(s.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button className="btn btn-sm btn-outline-primary" style={{ fontSize: '0.75rem', borderRadius: 16 }} onClick={() => setSelectedStudentId(s._id)}>
                            View Profile
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
      )}

      {selectedStudentId && <StudentDetailModal studentId={selectedStudentId} onClose={() => setSelectedStudentId(null)} />}
    </div>
  )
}
