import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

// Wraps protected routes — redirects to /login if not authenticated
// If allowedRole is given, also checks the user's role
export default function ProtectedRoute({ children, allowedRole }) {
  const { user } = useAuth()

  if (!user || !user.token) {
    return <Navigate to="/login" replace />
  }

  if (allowedRole && user.role !== allowedRole) {
    const redirect = user.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard'
    return <Navigate to={redirect} replace />
  }

  return children
}
