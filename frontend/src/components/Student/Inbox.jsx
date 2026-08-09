import { useEffect, useState } from 'react'
import { getNotifications, markNotificationsRead } from '../../services/studentService'
import Spinner from '../Common/Spinner'
import AlertMessage from '../Common/AlertMessage'
import Avatar from '../Common/Avatar'

export default function Inbox() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getNotifications()
      .then((res) => setNotifications(res.data?.data || []))
      .catch(() => setError('Failed to load inbox.'))
      .finally(() => setLoading(false))
  }, [])

  const handleMarkAllRead = async () => {
    try {
      await markNotificationsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    } catch {
      /* ignore */
    }
  }

  if (loading) return <Spinner />

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div>
      <p className="page-title">Inbox</p>
      <p className="page-subtitle">Messages from your teachers.</p>

      <AlertMessage type="danger" message={error} />

      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <span>
            <i className="bi bi-inbox me-2 text-primary"></i>Notifications
            {unreadCount > 0 && <span className="badge bg-warning ms-2">{unreadCount} new</span>}
          </span>
          {unreadCount > 0 && (
            <button className="btn btn-outline-primary btn-sm" style={{ fontSize: '0.75rem' }} onClick={handleMarkAllRead}>
              Mark all read
            </button>
          )}
        </div>
        <div className="card-body p-0">
          {notifications.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-inbox fs-1 d-block mb-2"></i>
              Your inbox is empty.
            </div>
          ) : (
            <ul className="list-group list-group-flush">
              {notifications.map((n) => (
                <li key={n._id} className={`list-group-item d-flex justify-content-between align-items-start gap-2 p-3 ${!n.read ? 'bg-warning bg-opacity-10' : ''}`}>
                  <div className="d-flex gap-2">
                    <Avatar src={n.teacherId?.profilePhoto} name={n.teacherId?.fullName} size={36} />
                    <div>
                      <div className="fw-semibold small">{n.teacherId?.fullName || 'Teacher'}</div>
                      <div className="small">{n.message}</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                        {new Date(n.createdAt).toLocaleDateString()} · {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  {!n.read && <span className="badge bg-warning flex-shrink-0">New</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
