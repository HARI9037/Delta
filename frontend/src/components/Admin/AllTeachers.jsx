import { useEffect, useState } from 'react'
import { getAllTeachers, getTeacherDetails } from '../../services/adminService'
import Spinner from '../Common/Spinner'
import AlertMessage from '../Common/AlertMessage'
import Avatar from '../Common/Avatar'

function TeacherDetailModal({ teacherId, onClose }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  useEffect(() => {
    if (!teacherId) return
    getTeacherDetails(teacherId)
      .then((res) => setData(res.data?.data))
      .catch(() => setErr('Failed to load teacher details'))
      .finally(() => setLoading(false))
  }, [teacherId])

  return (
    <div className="modal d-block" style={{ background: 'rgba(11,23,78,0.55)', zIndex: 1060 }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 16, overflow: 'hidden' }}>
          <div className="p-4 text-white d-flex align-items-center justify-content-between" style={{ background: 'linear-gradient(135deg,#0B174E,#25233F)' }}>
            <h5 className="fw-bold mb-0"><i className="bi bi-person-video3 me-2"></i>Teacher Profile Details</h5>
            <button className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
            {loading ? (
              <Spinner />
            ) : err ? (
              <AlertMessage type="danger" message={err} />
            ) : data ? (
              <div>
                {/* Header Card */}
                <div className="d-flex align-items-center gap-3 p-3 mb-4 rounded-3" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                  <Avatar src={data.teacher.profilePhoto} name={data.teacher.name} size={60} />
                  <div>
                    <h5 className="fw-bold mb-1">{data.teacher.name}</h5>
                    <div className="text-muted small">
                      {data.teacher.email} &bull; {data.teacher.phone}
                    </div>
                    <div className="mt-1">
                      <span className="badge bg-primary me-2">{data.teacher.qualification || 'Teacher'}</span>
                      <span className="badge bg-info text-dark me-2">Mode: {data.teacher.teachingMode}</span>
                      <span className={`badge ${data.teacher.status === 'Verified' ? 'bg-success' : 'bg-warning text-dark'}`}>{data.teacher.status}</span>
                    </div>
                  </div>
                </div>

                {/* Professional Info */}
                <div className="mb-4">
                  <h6 className="fw-bold mb-2">Professional Info & Subjects</h6>
                  <div className="p-3 rounded-3" style={{ background: '#F1F5F9' }}>
                    <div className="row g-2 small mb-2">
                      <div className="col-6"><strong>Teaching Experience:</strong> {data.teacher.teachingExperience || 'N/A'}</div>
                      <div className="col-6"><strong>Role:</strong> {data.teacher.role || 'teacher'}</div>
                    </div>
                    <div className="small">
                      <strong>Subjects Taught:</strong>{' '}
                      {data.teacher.subjects && data.teacher.subjects.length > 0 ? (
                        data.teacher.subjects.map((sub, i) => (
                          <span key={i} className="badge bg-secondary me-1">{sub}</span>
                        ))
                      ) : (
                        'None listed'
                      )}
                    </div>
                    {data.teacher.bio && (
                      <div className="small mt-2">
                        <strong>Bio:</strong> {data.teacher.bio}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bookings & Conducted Classes */}
                <div>
                  <h6 className="fw-bold mb-2">Assigned Classes & Bookings ({data.bookings?.length || 0})</h6>
                  {data.bookings?.length === 0 ? (
                    <p className="text-muted small">No class bookings found for this teacher.</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-sm table-hover align-middle small">
                        <thead>
                          <tr>
                            <th>Student</th>
                            <th>Subject</th>
                            <th>Date & Time</th>
                            <th>Mode</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.bookings.map((b) => (
                            <tr key={b._id}>
                              <td>{b.studentId?.name || '—'} ({b.studentId?.email})</td>
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

export default function AllTeachers() {
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [modeFilter, setModeFilter] = useState('all')
  const [selectedTeacherId, setSelectedTeacherId] = useState(null)

  const fetchTeachers = async () => {
    setLoading(true)
    try {
      const res = await getAllTeachers({ search: searchTerm, status: statusFilter, teachingMode: modeFilter })
      setTeachers(res.data?.data || [])
    } catch {
      setError('Failed to fetch teacher directory.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTeachers()
  }, [statusFilter, modeFilter])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    fetchTeachers()
  }

  return (
    <div>
      <p className="page-title">All Teachers Directory</p>
      <p className="page-subtitle">View and manage all registered teacher profiles across the tuition system.</p>

      <AlertMessage type="danger" message={error} />

      {/* Filter / Search Bar */}
      <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 12 }}>
        <div className="card-body py-2">
          <form onSubmit={handleSearchSubmit} className="row g-2 align-items-center">
            <div className="col-md-5">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search teacher by name, email, phone, or qualification..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <select className="form-select form-select-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All Approval Statuses</option>
                <option value="Verified">Verified</option>
                <option value="Pending">Pending Approval</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div className="col-md-2">
              <select className="form-select form-select-sm" value={modeFilter} onChange={(e) => setModeFilter(e.target.value)}>
                <option value="all">All Modes</option>
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
                <option value="Both">Both</option>
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
                    <th className="px-3">Teacher Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Qualification</th>
                    <th>Teaching Mode</th>
                    <th>Subjects</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teachers.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-4 text-muted">
                        No teachers found.
                      </td>
                    </tr>
                  ) : (
                    teachers.map((t) => (
                      <tr key={t._id}>
                        <td className="px-3" style={{ maxWidth: 220 }}>
                          <div className="d-flex align-items-center gap-2 overflow-hidden">
                            <Avatar src={t.profilePhoto} name={t.name} size={34} />
                            <span className="fw-semibold small text-truncate" title={t.name}>{t.name}</span>
                          </div>
                        </td>
                        <td className="small text-muted">{t.email}</td>
                        <td className="small text-muted">{t.phone}</td>
                        <td className="small fw-semibold">{t.qualification || '—'}</td>
                        <td className="small">{t.teachingMode}</td>
                        <td className="small">
                          {t.subjects && t.subjects.length > 0 ? (
                            t.subjects.map((sub, i) => (
                              <span key={i} className="badge bg-light text-dark border me-1">{sub}</span>
                            ))
                          ) : (
                            '—'
                          )}
                        </td>
                        <td>
                          <span className={`badge ${t.status === 'Verified' ? 'bg-success' : t.status === 'Rejected' ? 'bg-danger' : 'bg-warning text-dark'}`}>
                            {t.status}
                          </span>
                        </td>
                        <td>
                          <button className="btn btn-sm btn-outline-primary" style={{ fontSize: '0.75rem', borderRadius: 16 }} onClick={() => setSelectedTeacherId(t._id)}>
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

      {selectedTeacherId && <TeacherDetailModal teacherId={selectedTeacherId} onClose={() => setSelectedTeacherId(null)} />}
    </div>
  )
}
