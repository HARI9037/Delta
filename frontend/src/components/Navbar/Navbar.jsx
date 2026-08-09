import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Avatar from '../Common/Avatar'

export default function Navbar({ title, onMenuToggle }) {
  const { user } = useAuth()
  const profileLink = user?.role === 'admin' ? '/admin/profile' : user?.role === 'teacher' ? '/teacher/profile' : '/student/profile'

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
      <Link
        to={profileLink}
        className="d-flex align-items-center gap-2 text-decoration-none"
        title="View Profile"
      >
        <Avatar src={user?.profilePhoto} name={user?.name} size={32} />
        <span className="d-none d-md-inline text-dark small fw-medium">
          {user?.name}
        </span>
      </Link>
    </div>
  )
}

