import { useAuth } from '../../context/AuthContext'

export default function Navbar({ title, onMenuToggle }) {
  const { user } = useAuth()

  return (
    <div className="top-navbar">
      {/* Hamburger for mobile */}
      <button
        className="btn btn-sm d-lg-none me-2"
        onClick={onMenuToggle}
        style={{ color: 'var(--primary)' }}
      >
        <i className="bi bi-list fs-5"></i>
      </button>

      {/* Page title */}
      <span className="fw-semibold" style={{ color: 'var(--primary)', flex: 1 }}>
        {title}
      </span>

      {/* User info */}
      <div className="d-flex align-items-center gap-2">
        <span className="d-none d-md-inline text-muted small">
          {user?.name}
        </span>
      </div>
    </div>
  )
}
