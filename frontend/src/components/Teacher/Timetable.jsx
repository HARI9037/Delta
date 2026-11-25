import { useEffect, useState } from 'react'
import { getTeacherDashboard } from '../../services/teacherService'
import { formatLocalDate } from '../../utils/dateUtils'
import Spinner from '../Common/Spinner'
import AlertMessage from '../Common/AlertMessage'

export default function Timetable() {
  const [timetable, setTimetable] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getTeacherDashboard()
      .then((res) => setTimetable(res.data?.data?.timetable || {}))
      .catch(() => setError('Failed to load timetable.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  return (
    <div>
      <p className="page-title">Teaching Timetable</p>
      <p className="page-subtitle">Your schedule based on active availability slots and confirmed student bookings.</p>

      <AlertMessage type="danger" message={error} />

      <div className="card shadow-sm border-0" style={{ borderRadius: 14, overflow: 'hidden' }}>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-bordered mb-0" style={{ minWidth: 800 }}>
              <thead>
                <tr>
                  <th className="bg-primary text-white text-center" style={{ width: 170 }}>Date</th>
                  <th className="bg-primary text-white">Daily Schedule & Booked Sessions</th>
                </tr>
              </thead>
              <tbody>
                {!timetable || Object.keys(timetable).length === 0 ? (
                  <tr>
                    <td colSpan="2" className="text-center py-5 text-muted">
                      <i className="bi bi-calendar-x fs-2 d-block mb-2 text-muted opacity-50"></i>
                      No upcoming slots configured. Add your availability in the Availability section.
                    </td>
                  </tr>
                ) : (
                  Object.keys(timetable).sort().map((date) => {
                    const daySlots = timetable[date] || []
                    const dateFormatted = formatLocalDate(date)
                    return (
                      <tr key={date}>
                        <td className="text-center fw-semibold align-middle bg-light">{dateFormatted}</td>
                        <td className="p-3">
                          {daySlots.length === 0 ? (
                            <span className="text-muted small">No slots configured for this day</span>
                          ) : (
                            <div className="d-flex flex-wrap gap-2">
                              {daySlots.map((slot, i) => {
                                const bookedStudents = (slot.bookings || [])
                                  .map((b) => b.studentId?.name)
                                  .filter(Boolean)
                                  .join(', ')

                                return (
                                  <div
                                    key={i}
                                    className="p-2 rounded border"
                                    style={{
                                      background: slot.isBooked ? 'var(--primary)' : '#fff',
                                      color: slot.isBooked ? '#fff' : 'inherit',
                                      borderColor: slot.isBooked ? 'var(--primary)' : 'var(--border)',
                                      minWidth: 180,
                                    }}
                                  >
                                    <div className="fw-semibold" style={{ fontSize: '0.82rem' }}>
                                      {slot.startTime} - {slot.endTime}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                                      {slot.subject} ({slot.mode})
                                    </div>
                                    {slot.isBooked ? (
                                      <div className="mt-1">
                                        <span className="badge bg-white text-primary rounded-pill me-1" style={{ fontSize: '0.65rem' }}>
                                          <i className="bi bi-person-check-fill me-1"></i>Booked
                                        </span>
                                        {bookedStudents && (
                                          <div className="small text-white-50 mt-1" style={{ fontSize: '0.7rem' }}>
                                            Student: {bookedStudents}
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <div className="mt-1 badge bg-light text-muted border rounded-pill" style={{ fontSize: '0.65rem' }}>
                                        <i className="bi bi-clock me-1"></i>{slot.enabled ? 'Available' : 'Closed'}
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
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
