import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../Sidebar/Sidebar'
import Navbar from '../Navbar/Navbar'
import PaymentGate from '../Payment/PaymentGate'
import { useAuth } from '../../context/AuthContext'

const titles = {
  '/student/dashboard':          'Dashboard',
  '/student/teachers':           'Find Teachers',
  '/student/bookings':           'My Bookings',
  '/student/payments':           'Payments',
  '/student/profile':            'My Profile',
  '/teacher/dashboard':          'Dashboard',
  '/teacher/availability':       'Availability',
  '/teacher/timetable':          'Timetable',
  '/teacher/students':           'My Students',
  '/teacher/profile':            'My Profile',
  '/admin/dashboard':            'Admin Dashboard',
  '/admin/registrations':        'Approve Registrations',
  '/admin/payments':             'Payment Verification',
  '/admin/students':             'All Students',
  '/admin/teachers':             'All Teachers',
  '/admin/booking-confirmations':'Booking Confirmations',
  '/admin/bookings':             'All Bookings',
  '/admin/announcements':        'Announcements',
}

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const { user } = useAuth()
  const title = titles[location.pathname] || 'Dashboard'
  const isStudent = user?.role === 'student'

  return (
    <div>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-area">
        <Navbar title={title} onMenuToggle={() => setSidebarOpen(true)} />
        <div className="page-content">
          {isStudent ? (
            <PaymentGate>
              <Outlet />
            </PaymentGate>
          ) : (
            <Outlet />
          )}
        </div>
      </div>
    </div>
  )
}
