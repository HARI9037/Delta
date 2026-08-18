import { useState, useEffect } from 'react'
import { NavLink, useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const studentLinks = [
  { to: '/student/dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
  { to: '/student/teachers', icon: 'bi-person-video3', label: 'Find Teachers' },
  { to: '/student/bookings', icon: 'bi-calendar-check', label: 'My Bookings' },
  { to: '/student/payments', icon: 'bi-credit-card', label: 'Payments' },
  { to: '/student/inbox', icon: 'bi-inbox', label: 'Inbox' },
  { to: '/student/profile', icon: 'bi-person-circle', label: 'Profile' },
]

const teacherLinks = [
  { to: '/teacher/dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
  { to: '/teacher/availability', icon: 'bi-calendar-week', label: 'Availability' },
  { to: '/teacher/timetable', icon: 'bi-table', label: 'Timetable' },
  { to: '/teacher/students', icon: 'bi-people', label: 'My Students' },
  { to: '/teacher/profile', icon: 'bi-person-circle', label: 'Profile' },
]

const adminAccordionSections = [
  {
    key: 'user-management',
    title: 'User Management',
    icon: 'bi-people-fill',
    links: [
      { to: '/admin/registrations', icon: 'bi-person-plus-fill', label: 'Approve Registrations' },
      { to: '/admin/students', icon: 'bi-mortarboard-fill', label: 'All Students' },
      { to: '/admin/teachers', icon: 'bi-person-video3', label: 'All Teachers' },
    ],
  },
  {
    key: 'bookings-payments',
    title: 'Bookings & Payments',
    icon: 'bi-credit-card-2-front',
    links: [
      { to: '/admin/bookings', icon: 'bi-calendar3', label: 'All Bookings' },
      { to: '/admin/booking-confirmations', icon: 'bi-calendar-check-fill', label: 'Booking Confirmations' },
      { to: '/admin/payments', icon: 'bi-credit-card-2-front', label: 'Payment Verification' },
    ],
  },
  {
    key: 'teacher-portal',
    title: 'Teacher Portal',
    icon: 'bi-person-badge',
    links: [
      { to: '/teacher/availability', icon: 'bi-calendar-week', label: 'My Availability' },
      { to: '/teacher/timetable', icon: 'bi-table', label: 'My Timetable' },
      { to: '/teacher/students', icon: 'bi-people', label: 'Assigned Students' },
    ],
  },
]

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const isAdmin = user?.role === 'admin'
  const isTeacher = user?.role === 'teacher'

  const [openSection, setOpenSection] = useState(null)

  useEffect(() => {
    if (!isAdmin) return
    const path = location.pathname
    if (path.startsWith('/admin/registrations') || path.startsWith('/admin/students') || path.startsWith('/admin/teachers')) {
      setOpenSection('user-management')
    } else if (path.startsWith('/admin/bookings') || path.startsWith('/admin/booking-confirmations') || path.startsWith('/admin/payments')) {
      setOpenSection('bookings-payments')
    } else if (path.startsWith('/teacher/availability') || path.startsWith('/teacher/timetable') || path.startsWith('/teacher/students')) {
      setOpenSection('teacher-portal')
    }
  }, [location.pathname, isAdmin])

  function toggleSection(key) {
    setOpenSection((prev) => (prev === key ? null : key))
  }

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
        <div className="px-3 pb-2 pt-2 sidebar-role-tag">
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
            <>
              {/* Standalone Dashboard */}
              <NavLink
                to="/admin/dashboard"
                className={({ isActive }) => (isActive ? 'active mb-1' : 'mb-1')}
                onClick={onClose}
              >
                <i className="bi bi-speedometer2"></i>
                <span>Dashboard</span>
              </NavLink>

              {/* Accordion Sections */}
              {adminAccordionSections.map((section) => {
                const isOpenSection = openSection === section.key
                const isChildActive = section.links.some((l) => location.pathname.startsWith(l.to))

                return (
                  <div key={section.key} className="mb-1">
                    <button
                      type="button"
                      className={`sidebar-accordion-header justify-content-between ${isChildActive ? 'active-header' : ''}`}
                      onClick={() => toggleSection(section.key)}
                    >
                      <div className="d-flex align-items-center gap-2">
                        <i className={`bi ${section.icon}`}></i>
                        <span>{section.title}</span>
                      </div>
                      <i className={`bi bi-chevron-${isOpenSection ? 'down' : 'right'}`} style={{ fontSize: '0.75rem' }}></i>
                    </button>

                    {isOpenSection && (
                      <div className="sidebar-submenu">
                        {section.links.map((link) => (
                          <NavLink
                            key={link.to}
                            to={link.to}
                            className={({ isActive }) => (isActive ? 'active' : '')}
                            onClick={onClose}
                          >
                            <i className={`bi ${link.icon}`}></i>
                            <span>{link.label}</span>
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Standalone Profile */}
              <NavLink
                to="/admin/profile"
                className={({ isActive }) => (isActive ? 'active mt-1' : 'mt-1')}
                onClick={onClose}
              >
                <i className="bi bi-person-circle"></i>
                <span>Profile</span>
              </NavLink>
            </>
          ) : (
            (isTeacher ? teacherLinks : studentLinks).map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => (isActive ? 'active' : '')}
                onClick={onClose}
              >
                <i className={`bi ${link.icon}`}></i>
                <span>{link.label}</span>
              </NavLink>
            ))
          )}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <Link
            to={isAdmin ? '/admin/profile' : isTeacher ? '/teacher/profile' : '/student/profile'}
            className="text-white text-decoration-none d-flex align-items-center gap-2 mb-2 px-1 py-1 rounded"
            style={{ fontSize: '0.85rem' }}
            onClick={onClose}
          >
            <i className="bi bi-person-circle fs-6" style={{ color: 'rgba(255,255,255,0.7)' }}></i>
            <span className="text-truncate" style={{ fontWeight: 500 }}>{user?.name || 'User'}</span>
          </Link>
          <button
            className="btn btn-sm w-100 text-white d-flex align-items-center justify-content-center gap-2"
            style={{ background: 'rgba(238,12,3,0.25)', border: 'none', fontSize: '0.82rem', padding: '0.45rem' }}
            onClick={handleLogout}
          >
            <i className="bi bi-box-arrow-left"></i>Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}
