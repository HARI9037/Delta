import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../Sidebar/Sidebar'
import Navbar from '../Navbar/Navbar'

// Maps URL path → page title shown in the navbar
const titles = {
  '/student/dashboard':  'Dashboard',
  '/student/teachers':   'Find Teachers',
  '/student/bookings':   'My Bookings',
  '/student/payments':   'Payments',
  '/student/profile':    'My Profile',
  '/teacher/dashboard':  'Dashboard',
  '/teacher/availability': 'Availability',
  '/teacher/timetable':  'Timetable',
  '/teacher/students':   'My Students',
  '/teacher/profile':    'My Profile',
}

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const title = titles[location.pathname] || 'Dashboard'

  return (
    <div>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-area">
        <Navbar title={title} onMenuToggle={() => setSidebarOpen(true)} />
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
