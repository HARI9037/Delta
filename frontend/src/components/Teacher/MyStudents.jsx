import { useEffect, useState } from 'react'
import { getAssignedStudents } from '../../services/teacherService'
import Spinner from '../Common/Spinner'
import AlertMessage from '../Common/AlertMessage'

export default function MyStudents() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-4 text-muted">
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
                      <td className="small">{st.grade || 'N/A'}</td>
                      <td>
                        <div className="small">{st.email}</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>{st.phone}</div>
                      </td>
                      <td><span className="badge bg-success bg-opacity-10 text-success">Active</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
