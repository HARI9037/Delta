import { useEffect, useState } from 'react'
import { getTeacherDashboard } from '../../services/teacherService'
import Spinner from '../Common/Spinner'
import AlertMessage from '../Common/AlertMessage'

export default function TeacherDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchData = () => {
    setLoading(true)
    getTeacherDashboard()
      .then((dashRes) => {
        setData(dashRes.data?.data)
      })
      .catch(() => setError('Failed to load dashboard data.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchData()
  }, [])


  if (loading) return <Spinner />
  if (error) return <AlertMessage type="danger" message={error} />

  const todaysClasses = data?.todaysClasses || []
  const upcomingClasses = data?.upcomingClasses || []
  const totalStudents = data?.totalStudents || 0
  const activeSlots = data?.activeSlots || 0

  return (
    <div>
      <p className="page-title">Dashboard</p>
      <p className="page-subtitle">Welcome back! Here is an overview of your teaching schedule.</p>

      {/* Stat cards */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-3">
          <div className="stat-card stat-card-blue rounded-3">
            <div>
              <div className="stat-number">{todaysClasses.length}</div>
              <div className="stat-label">Today's Classes</div>
            </div>
            <i className="bi bi-calendar-check-fill"></i>
          </div>
        </div>
        <div className="col-sm-6 col-xl-3">
          <div className="stat-card stat-card-red rounded-3">
            <div>
              <div className="stat-number">{upcomingClasses.length}</div>
              <div className="stat-label">Upcoming Classes</div>
            </div>
            <i className="bi bi-clock-history"></i>
          </div>
        </div>
        <div className="col-sm-6 col-xl-3">
          <div className="stat-card stat-card-green rounded-3">
            <div>
              <div className="stat-number">{totalStudents}</div>
              <div className="stat-label">Assigned Students</div>
            </div>
            <i className="bi bi-people-fill"></i>
          </div>
        </div>
        <div className="col-sm-6 col-xl-3">
          <div className="stat-card stat-card-yellow rounded-3">
            <div>
              <div className="stat-number">{activeSlots}</div>
              <div className="stat-label">Active Slots</div>
            </div>
            <i className="bi bi-calendar-week-fill"></i>
          </div>
        </div>
      </div>

      <div className="row g-3">
        {/* Today's Classes */}
        <div className="col-lg-6">
          <div className="card h-100">
            <div className="card-header">
              <i className="bi bi-calendar-day me-2 text-primary"></i>Today's Classes
            </div>
            <div className="card-body p-0">
              {todaysClasses.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <i className="bi bi-calendar-x fs-2 d-block mb-2"></i>
                  No classes scheduled for today.
                </div>
              ) : (
                <ul className="list-group list-group-flush">
                  {todaysClasses.map((c) => (
                    <li key={c._id} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <div className="fw-semibold small">{c.subject}</div>
                        <div className="text-muted" style={{ fontSize: '0.78rem' }}>
                          {c.startTime} – {c.endTime} · {c.studentId?.name}
                        </div>
                      </div>
                      <span className={`badge ${c.mode === 'Online' ? 'bg-success' : 'bg-warning'} bg-opacity-10 text-${c.mode === 'Online' ? 'success' : 'warning'}`}>
                        {c.mode}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Upcoming Classes */}
        <div className="col-lg-6">
          <div className="card h-100">
            <div className="card-header">
              <i className="bi bi-calendar-event me-2 text-primary"></i>Upcoming Classes
            </div>
            <div className="card-body p-0">
              {upcomingClasses.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <i className="bi bi-calendar2-x fs-2 d-block mb-2"></i>
                  No upcoming classes found.
                </div>
              ) : (
                <ul className="list-group list-group-flush">
                  {upcomingClasses.slice(0, 5).map((c) => (
                    <li key={c._id} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <div className="fw-semibold small">{c.subject}</div>
                        <div className="text-muted" style={{ fontSize: '0.78rem' }}>
                          {new Date(c.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} · {c.startTime} – {c.endTime}
                        </div>
                      </div>
                      <div className="text-end">
                        <div className="small">{c.studentId?.name}</div>
                        <span className={`badge badge-${c.status?.toLowerCase()} px-2 py-1`} style={{ fontSize: '0.7rem' }}>{c.status}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      </div>
  )
}
