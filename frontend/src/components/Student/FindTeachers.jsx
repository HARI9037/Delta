import { useState, useEffect } from 'react'
import { getAllTeachers, bookSlot } from '../../services/studentService'
import Spinner from '../Common/Spinner'
import AlertMessage from '../Common/AlertMessage'

const MODES = ['Any', 'Online', 'Offline']

function BookingModal({ teacher, onClose, onBookSuccess }) {
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [reqs, setReqs] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const slots = (teacher.availability || []).filter((s) => s.enabled !== false)

  async function handleBook() {
    if (!selectedSlot) return setError('Please select a time slot')
    setError('')
    setLoading(true)

    try {
      await bookSlot({
        teacherId: teacher._id,
        availabilityId: selectedSlot._id,
        subject: selectedSlot.subject,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        mode: selectedSlot.mode,
        requirement: reqs,
      })
      onBookSuccess()
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0" style={{ borderRadius: 12 }}>
          <div className="modal-header bg-primary text-white" style={{ borderRadius: '12px 12px 0 0' }}>
            <h6 className="modal-title m-0"><i className="bi bi-calendar-plus me-2"></i>Book Session</h6>
            <button className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          <div className="modal-body p-4">
            <div className="d-flex align-items-center gap-3 mb-4 bg-light p-3 rounded">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                style={{ width: 44, height: 44, background: 'var(--primary)', color: '#fff' }}
              >
                <i className="bi bi-person-fill"></i>
              </div>
              <div>
                <div className="fw-semibold">{teacher.name}</div>
                <div className="text-muted small">{(teacher.subjects || []).join(', ')}</div>
              </div>
            </div>

            <AlertMessage type="danger" message={error} />

            {slots.length === 0 ? (
              <div className="text-center py-4 text-muted small">No available slots for this teacher.</div>
            ) : (
              <>
                <label className="form-label small fw-semibold">Select Time Slot</label>
                <div className="row g-2 mb-3 max-h-200 overflow-auto">
                  {slots.map((slot) => (
                    <div className="col-12" key={slot._id}>
                      <div
                        className="p-2 rounded d-flex justify-content-between align-items-center"
                        style={{
                          border: `2px solid ${selectedSlot?._id === slot._id ? 'var(--primary)' : 'var(--border)'}`,
                          background: selectedSlot?._id === slot._id ? 'rgba(11,23,78,0.05)' : '#fff',
                          cursor: 'pointer'
                        }}
                        onClick={() => setSelectedSlot(slot)}
                      >
                        <div>
                          <div className="fw-semibold" style={{ fontSize: '0.85rem' }}>{slot.subject}</div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>{new Date(slot.date).toLocaleDateString()} · {slot.startTime} – {slot.endTime}</div>
                        </div>
                        <span className={`badge ${slot.mode === 'Online' ? 'bg-success' : 'bg-warning'}`}>
                          {slot.mode}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>



                <div className="mb-2">
                  <label className="form-label small fw-semibold">Requirements (Optional)</label>
                  <textarea
                    className="form-control form-control-sm"
                    rows="2"
                    value={reqs}
                    onChange={(e) => setReqs(e.target.value)}
                  ></textarea>
                </div>
              </>
            )}
          </div>
          <div className="modal-footer border-0 pb-4 pe-4">
            <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary btn-sm px-4" onClick={handleBook} disabled={loading || slots.length === 0}>
              {loading ? 'Booking...' : 'Confirm'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function FindTeachers() {
  const [teachers, setTeachers] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [mode, setMode] = useState('Any')

  const [selectedTeacher, setSelectedTeacher] = useState(null)
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    getAllTeachers()
      .then((res) => {
        setTeachers(res.data?.data || [])
        setFiltered(res.data?.data || [])
      })
      .catch(() => setError('Failed to fetch teachers.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    let list = teachers
    if (search) {
      const q = search.toLowerCase()
      list = list.filter((t) => t.name.toLowerCase().includes(q) || (t.subjects || []).some(s => s.toLowerCase().includes(q)))
    }
    if (mode !== 'Any') {
      list = list.filter((t) => (t.availability || []).some((a) => a.mode === mode && a.enabled !== false))
    }
    setFiltered(list)
  }, [search, mode, teachers])

  if (loading) return <Spinner />

  return (
    <div>
      <p className="page-title">Find Teachers</p>
      <p className="page-subtitle">Search for expert tutors and book your classes.</p>

      <AlertMessage type="danger" message={error} />
      <AlertMessage type="success" message={successMsg} />

      {/* Filter Bar */}
      <div className="card mb-4">
        <div className="card-body p-3">
          <div className="row g-2">
            <div className="col-md-6">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search by name or subject..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <select className="form-select form-select-sm" value={mode} onChange={(e) => setMode(e.target.value)}>
                {MODES.map((m) => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div className="col-md-3">
              <button className="btn btn-outline-secondary btn-sm w-100" onClick={() => { setSearch(''); setMode('Any') }}>
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Teachers List */}
      <div className="row g-3">
        {filtered.length === 0 && !loading && (
          <div className="text-center text-muted py-5 w-100">No teachers found matching your criteria.</div>
        )}
        {filtered.map((teacher) => (
          <div className="col-md-6 col-xl-4" key={teacher._id}>
            <div className="card h-100">
              <div className="card-body">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 48, height: 48, fontSize: '1.2rem' }}>
                    <i className="bi bi-person-fill"></i>
                  </div>
                  <div className="overflow-hidden">
                    <div className="fw-semibold text-truncate">{teacher.name}</div>
                  </div>
                </div>
                <div className="mb-2">
                  {(teacher.subjects || []).map((sub) => (
                    <span key={sub} className="badge bg-light text-primary border me-1 mb-1">{sub}</span>
                  ))}
                </div>
                <p className="small text-muted mb-4 line-clamp-2" style={{ minHeight: 40 }}>
                  {teacher.bio || 'No bio provided.'}
                </p>
                <button
                  className="btn btn-primary btn-sm w-100"
                  onClick={() => setSelectedTeacher(teacher)}
                >
                  View Schedule & Book
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedTeacher && (
        <BookingModal
          teacher={selectedTeacher}
          onClose={() => setSelectedTeacher(null)}
          onBookSuccess={() => {
            setSelectedTeacher(null)
            setSuccessMsg('Booking successful! The class is now scheduled.')
            setTimeout(() => setSuccessMsg(''), 5000)
          }}
        />
      )}
    </div>
  )
}
