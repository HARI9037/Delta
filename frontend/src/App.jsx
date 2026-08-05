import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/Common/ProtectedRoute'
import DashboardLayout from './components/Dashboard/DashboardLayout'

// Public
import Landing from './components/Landing/Landing'
import RoleSelect from './components/Landing/RoleSelect'
import Login from './components/Landing/Login'
import Register from './components/Landing/Register'

// Student
import StudentDashboard from './components/Student/StudentDashboard'
import FindTeachers from './components/Student/FindTeachers'
import MyBookings from './components/Student/MyBookings'
import Payments from './components/Student/Payments'
import StudentProfile from './components/Student/StudentProfile'

// Teacher
import TeacherDashboard from './components/Teacher/TeacherDashboard'
import Availability from './components/Teacher/Availability'
import Timetable from './components/Teacher/Timetable'
import MyStudents from './components/Teacher/MyStudents'
import PaymentAdmin from './components/Teacher/PaymentAdmin'
import TeacherProfile from './components/Teacher/TeacherProfile'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/select-role" element={<RoleSelect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Student Routes */}
        <Route path="/student" element={<ProtectedRoute allowedRole="student"><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="teachers" element={<FindTeachers />} />
          <Route path="bookings" element={<MyBookings />} />
          <Route path="payments" element={<Payments />} />
          <Route path="profile" element={<StudentProfile />} />
        </Route>

        {/* Teacher Routes */}
        <Route path="/teacher" element={<ProtectedRoute allowedRole="teacher"><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<TeacherDashboard />} />
          <Route path="availability" element={<Availability />} />
          <Route path="timetable" element={<Timetable />} />
          <Route path="students" element={<MyStudents />} />
          <Route path="payments" element={<PaymentAdmin />} />
          <Route path="profile" element={<TeacherProfile />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
