import { useEffect, useState } from 'react'
import { getAssignedStudents, notifyStudent } from '../../services/teacherService'
import Spinner from '../Common/Spinner'
import AlertMessage from '../Common/AlertMessage'

const DEFAULT_MESSAGE = 'Please add your correct class or grade in your profile so we can match you with the right teacher.'

function ReportGradeModal({ student, onClose, onSent }) {
  const [message, setMessage] = useState(DEFAULT_MESSAGE)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  async function handleSend() {
    if (!message.trim()) {
      setError('Please enter a message for the student.')
      return
    }
    setError('')
    setSending(true)
    try {
      await notifyStudent(student._id, message.trim())
      onSent()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send notification.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0" style={{ borderRadius: 12 }}>
          <div className="modal-header bg-danger text-white" style={{ borderRadius: '12px 12px 0 0' }}>
            <h6 className="modal-title m-0"><i className="bi bi-exclamation-triangle me-2"></i>Report Missing Grade</h6>
            <button className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          <div className="modal-body p-4">
            <AlertMessage type="danger" message={error} />
            <label className="form-label small fw-semibold">Message to student <span className="text-danger">*</span></label>
            <textarea
              className="form-control form-control-sm"
              rows="3"
              placeholder="Type a message asking them to add their class or grade"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            ></textarea>
          </div>
          <div className="modal-footer border-0 pb-4 pe-4">
            <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>Cancel</button>
            <button className="btn btn-warning btn-sm px-4" onClick={handleSend} disabled={sending || !message.trim()}>
              {sending ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MyStudents() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [reportStudent, setReportStudent] = useState(null)

  useEffect(() => {
    getAssignedStudents()
      .then((res) => setStudents(res.data?.data || []))
      .catch(() => setError('Failed to load students.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  return (
    <div>
      <p className="page-title">My Students</p>
      <p className="page-subtitle">List of students currently assigned to your classes.</p>

      <AlertMessage type="danger" message={error} />
      <AlertMessage type="success" message={success} />

      <div className="card">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th className="px-3">Student Name</th>
                  <th>Grade / Class</th>
                  <th>Contact Info</th>
                  <th>Status</th>
                  <th className="text-end pe-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-muted">
                      No students assigned yet.
                    </td>
                  </tr>
                ) : (
                  students.map((st) => (
                    <tr key={st._id}>
                      <td className="px-3 py-3">
                        <div className="d-flex align-items-center gap-3">
                          {st.profilePhoto ? (
                            <img src={st.profilePhoto} alt={st.name} className="rounded-circle object-fit-cover flex-shrink-0" style={{ width: 40, height: 40 }} />
                          ) : (
                            <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 40, height: 40 }}>
                              <i className="bi bi-person"></i>
                            </div>
                          )}
                          <div className="fw-semibold small">{st.name}</div>
                        </div>
                      </td>
                      <td className="small">
                        {st.grade ? (
                          st.grade
                        ) : (
                          <span className="badge bg-danger bg-opacity-10 text-danger">No Grade</span>
                        )}
                      </td>
                      <td>
                        <div className="small">{st.email}</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>{st.phone}</div>
                      </td>
                      <td><span className="badge bg-success bg-opacity-10 text-success">Active</span></td>
                      <td className="text-end pe-3">
                        {!st.grade && (
                          <button className="btn btn-outline-danger btn-sm" onClick={() => setReportStudent(st)}>
                            <i className="bi bi-exclamation-triangle me-1"></i>Report Grade
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {reportStudent && (
        <ReportGradeModal
          student={reportStudent}
          onClose={() => setReportStudent(null)}
          onSent={() => {
            const name = reportStudent.name
            setReportStudent(null)
            setSuccess(`Notification sent to ${name}.`)
            setTimeout(() => setSuccess(''), 5000)
          }}
        />
      )}
    </div>
  )
}
