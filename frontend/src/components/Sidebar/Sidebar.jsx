import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

// Navigation links for each role
const studentLinks = [
  { to: '/student/dashboard', icon: 'bi-speedometer2',        label: 'Dashboard'     },
  { to: '/student/teachers',  icon: 'bi-person-video3',        label: 'Find Teachers' },
  { to: '/student/bookings',  icon: 'bi-calendar-check',       label: 'My Bookings'   },
  { to: '/student/payments',  icon: 'bi-credit-card',          label: 'Payments'      },
  { to: '/student/profile',   icon: 'bi-person-circle',        label: 'Profile'       },
]

const teacherLinks = [
  { to: '/teacher/dashboard',    icon: 'bi-speedometer2',     label: 'Dashboard'    },
  { to: '/teacher/availability', icon: 'bi-calendar-week',    label: 'Availability' },
  { to: '/teacher/timetable',    icon: 'bi-table',            label: 'Timetable'    },
  { to: '/teacher/students',     icon: 'bi-people',           label: 'My Students'  },
  { to: '/teacher/profile',      icon: 'bi-person-circle',    label: 'Profile'      },
]

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const links = user?.role === 'teacher' ? teacherLinks : studentLinks

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="d-lg-none position-fixed top-0 start-0 w-100 h-100"
          style={{ background: 'rgba(0,0,0,0.45)', zIndex: 199 }}
          onClick={onClose}
        />
      )}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Brand */}
        <div className="sidebar-brand d-flex justify-content-between align-items-center">
          <h5>
            DEL<span>TA</span>
          </h5>
          <button
            className="btn btn-sm d-lg-none text-white"
            onClick={onClose}
            style={{ lineHeight: 1 }}
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {/* Role tag */}
        <div className="px-3 pb-2 pt-2">
          <span
            className="badge w-100 py-2"
            style={{ background: 'rgba(238,12,3,0.18)', color: '#ff6b68', fontSize: '0.75rem' }}
          >
            {user?.role === 'teacher' ? '👨‍🏫 Teacher Portal' : '🎓 Student Portal'}
          </span>
        </div>

        {/* Nav links */}
        <nav className="sidebar-nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => isActive ? 'active' : ''}
              onClick={onClose}
            >
              <i className={`bi ${link.icon}`}></i>
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="text-white mb-2" style={{ fontSize: '0.82rem' }}>
            <i className="bi bi-person me-2" style={{ color: 'rgba(255,255,255,0.5)' }}></i>
            <span>{user?.name || 'User'}</span>
          </div>
          <button
            className="btn btn-sm w-100 text-white"
            style={{ background: 'rgba(238,12,3,0.25)', border: 'none', fontSize: '0.82rem' }}
            onClick={handleLogout}
          >
            <i className="bi bi-box-arrow-left me-2"></i>Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}
