import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const studentLinks = [
  { to: '/student/dashboard', icon: 'bi-speedometer2',        label: 'Dashboard'     },
  { to: '/student/teachers',  icon: 'bi-person-video3',        label: 'Find Teachers' },
  { to: '/student/bookings',  icon: 'bi-calendar-check',       label: 'My Bookings'   },
  { to: '/student/payments',  icon: 'bi-credit-card',          label: 'Payments'      },
  { to: '/student/inbox',     icon: 'bi-inbox',                label: 'Inbox'         },
  { to: '/student/profile',   icon: 'bi-person-circle',        label: 'Profile'       },
]

const teacherLinks = [
  { to: '/teacher/dashboard',    icon: 'bi-speedometer2',     label: 'Dashboard'    },
  { to: '/teacher/availability', icon: 'bi-calendar-week',    label: 'Availability' },
  { to: '/teacher/timetable',    icon: 'bi-table',            label: 'Timetable'    },
  { to: '/teacher/students',     icon: 'bi-people',           label: 'My Students'  },
  { to: '/teacher/profile',      icon: 'bi-person-circle',    label: 'Profile'      },
]

const adminGroups = [
  {
    header: 'Dashboard',
    links: [
      { to: '/admin/dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
    ],
  },
  {
    header: 'Management',
    links: [
      { to: '/admin/registrations',          icon: 'bi-person-plus-fill',    label: 'Approve Registrations' },
      { to: '/admin/payments',               icon: 'bi-credit-card-2-front', label: 'Payment Verification'  },
      { to: '/admin/students',               icon: 'bi-mortarboard',         label: 'All Students'          },
      { to: '/admin/teachers',               icon: 'bi-person-video3',       label: 'All Teachers'          },
      { to: '/admin/booking-confirmations', icon: 'bi-calendar-check-fill', label: 'Booking Confirmations'  },
      { to: '/admin/bookings',               icon: 'bi-calendar3',           label: 'All Bookings'          },
    ],
  },
  {
    header: 'Communication',
    links: [
      { to: '/admin/announcements', icon: 'bi-megaphone-fill', label: 'Announcements' },
    ],
  },
  {
    header: 'Teacher Portal',
    links: [
      { to: '/teacher/availability', icon: 'bi-calendar-week', label: 'My Availability' },
      { to: '/teacher/timetable',    icon: 'bi-table',         label: 'My Timetable'    },
      { to: '/teacher/students',     icon: 'bi-people',        label: 'Assigned Students'},
      { to: '/teacher/profile',      icon: 'bi-person-circle', label: 'Teacher Profile' },
    ],
  },
]

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const isAdmin = user?.role === 'admin'
  const isTeacher = user?.role === 'teacher'

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
            className="badge w-100 py-2 fw-semibold"
            style={{ background: 'rgba(238,12,3,0.18)', color: '#ff6b68', fontSize: '0.75rem' }}
          >
            {isAdmin ? '👑 Admin Portal' : isTeacher ? '👨‍🏫 Teacher Portal' : '🎓 Student Portal'}
          </span>
        </div>

        {/* Nav links */}
        <nav className="sidebar-nav">
          {isAdmin ? (
            adminGroups.map((group) => (
              <div key={group.header} className="mb-2">
                <div
                  className="px-3 pt-2 pb-1 text-uppercase fw-bold"
                  style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', letterSpacing: 1 }}
                >
                  {group.header}
                </div>
                {group.links.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) => (isActive ? 'active' : '')}
                    onClick={onClose}
                  >
                    <i className={`bi ${link.icon}`}></i>
                    {link.label}
                  </NavLink>
                ))}
              </div>
            ))
          ) : (
            (isTeacher ? teacherLinks : studentLinks).map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => (isActive ? 'active' : '')}
                onClick={onClose}
              >
                <i className={`bi ${link.icon}`}></i>
                {link.label}
              </NavLink>
            ))
          )}
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
