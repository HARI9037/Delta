import { useEffect, useState } from 'react'
import { getActiveAnnouncements } from '../../services/announcementService'
import Spinner from './Spinner'

function PriorityBadge({ priority }) {
  const map = {
    Urgent: { bg: '#FEE2E2', color: '#991B1B', border: '#FCA5A5' },
    High:   { bg: '#FEF3C7', color: '#92400E', border: '#FCD34D' },
    Medium: { bg: '#DBEAFE', color: '#1E40AF', border: '#93C5FD' },
    Low:    { bg: '#F3F4F6', color: '#4B5563', border: '#E5E7EB' },
  }
  const p = map[priority] || map.Medium
  return (
    <span
      style={{
        background: p.bg,
        color: p.color,
        border: `1px solid ${p.border}`,
        borderRadius: 12,
        padding: '2px 9px',
        fontSize: '0.7rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
      }}
    >
      {priority || 'Medium'}
    </span>
  )
}

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function AnnouncementSection() {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    getActiveAnnouncements()
      .then((res) => {
        if (isMounted) setAnnouncements(res.data?.data || [])
      })
      .catch(() => {
        if (isMounted) setAnnouncements([])
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="card mb-4" style={{ borderRadius: 14, overflow: 'hidden' }}>
      <div
        className="card-header border-0 d-flex justify-content-between align-items-center"
        style={{
          background: 'linear-gradient(135deg, #0B174E 0%, #25233F 100%)',
          color: '#fff',
          padding: '1rem 1.25rem',
        }}
      >
        <div className="d-flex align-items-center gap-2">
          <i className="bi bi-megaphone-fill text-warning fs-5"></i>
          <span className="fw-bold" style={{ fontSize: '1rem' }}>
            Announcements & Updates
          </span>
        </div>
        {announcements.length > 0 && (
          <span className="badge bg-warning text-dark fw-bold rounded-pill px-2 py-1" style={{ fontSize: '0.72rem' }}>
            {announcements.length} New
          </span>
        )}
      </div>

      <div className="card-body p-3">
        {loading ? (
          <div className="text-center py-3">
            <Spinner />
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-4 text-muted">
            <i className="bi bi-bell-slash fs-3 d-block mb-2 text-secondary opacity-50"></i>
            <p className="mb-0 small fw-semibold">No announcements at this time.</p>
            <p className="text-muted small mb-0" style={{ fontSize: '0.78rem' }}>
              Check back later for updates from administration.
            </p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {announcements.map((item) => (
              <div
                key={item._id}
                className="p-3 rounded-3"
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                }}
              >
                <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                  <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '0.92rem' }}>
                    {item.title}
                  </h6>
                  <div className="d-flex align-items-center gap-2">
                    <PriorityBadge priority={item.priority} />
                    <span className="text-muted small" style={{ fontSize: '0.74rem' }}>
                      {formatDate(item.createdAt)}
                    </span>
                  </div>
                </div>

                <p
                  className="mb-0 text-secondary"
                  style={{ fontSize: '0.85rem', lineHeight: '1.5', whiteSpace: 'pre-line' }}
                >
                  {item.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
