import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Navbar({ title, onMenuToggle }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

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

      {/* User info + logout */}
      <div className="d-flex align-items-center gap-2">
        <span className="d-none d-md-inline text-muted small">
          {user?.name}
        </span>
        <button
          className="btn btn-sm btn-outline-primary"
          style={{ fontSize: '0.8rem' }}
          onClick={handleLogout}
        >
          <i className="bi bi-box-arrow-left me-1"></i>Logout
        </button>
      </div>
    </div>
  )
}
