import { useEffect, useState } from 'react'
import { getTeacherDashboard } from '../../services/teacherService'
import Spinner from '../Common/Spinner'
import AlertMessage from '../Common/AlertMessage'


export default function Timetable() {
  const [timetable, setTimetable] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // The backend dashboard API includes the fully generated weekly timetable
    getTeacherDashboard()
      .then((res) => setTimetable(res.data?.data?.timetable || {}))
      .catch(() => setError('Failed to load timetable.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  return (
    <div>
      <p className="page-title">Upcoming Timetable</p>
      <p className="page-subtitle">Your generated schedule based on active availability and bookings.</p>

      <AlertMessage type="danger" message={error} />

      <div className="card">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-bordered mb-0" style={{ minWidth: 800 }}>
              <thead>
                <tr>
                  <th className="bg-primary text-white text-center" style={{ width: 150 }}>Date</th>
                  <th className="bg-primary text-white">Schedule</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(timetable || {}).length === 0 ? (
                  <tr>
                    <td colSpan="2" className="text-center py-4 text-muted">No upcoming slots configured</td>
                  </tr>
                ) : (
                  Object.keys(timetable).sort().map((date) => {
                    const daySlots = timetable[date] || []
                    const dateFormatted = new Date(date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
                    return (
                      <tr key={date}>
                        <td className="text-center fw-semibold align-middle bg-light">{dateFormatted}</td>
                        <td className="p-3">
                          {daySlots.length === 0 ? (
                            <span className="text-muted small">No slots configured</span>
                          ) : (
                            <div className="d-flex flex-wrap gap-2">
                              {daySlots.map((slot, i) => (
                                <div
                                  key={i}
                                  className="p-2 rounded border"
                                  style={{
                                    background: slot.isBooked ? 'var(--primary)' : '#fff',
                                    color: slot.isBooked ? '#fff' : 'inherit',
                                    borderColor: slot.isBooked ? 'var(--primary)' : 'var(--border)',
                                    minWidth: 160,
                                  }}
                                >
                                  <div className="fw-semibold" style={{ fontSize: '0.8rem' }}>
                                    {slot.startTime} - {slot.endTime}
                                  </div>
                                  <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                                    {slot.subject} ({slot.mode})
                                  </div>
                                  {slot.isBooked ? (
                                    <div className="mt-1 badge bg-white text-primary rounded-pill" style={{ fontSize: '0.65rem' }}>
                                      <i className="bi bi-person-check-fill me-1"></i>Booked
                                    </div>
                                  ) : (
                                    <div className="mt-1 badge bg-light text-muted border rounded-pill" style={{ fontSize: '0.65rem' }}>
                                      <i className="bi bi-clock me-1"></i>Available
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
