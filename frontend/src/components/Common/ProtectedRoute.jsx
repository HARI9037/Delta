import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedRoute({ children, allowedRole }) {
  const { user } = useAuth()

  if (!user || !user.token) {
    return <Navigate to="/login" replace />
  }

  if (allowedRole) {
    const isTeacherRouteAllowed = allowedRole === 'teacher' && (user.role === 'teacher' || user.role === 'admin')
    const isDirectRoleMatch = user.role === allowedRole

    if (!isDirectRoleMatch && !isTeacherRouteAllowed) {
      let redirect = '/student/dashboard'
      if (user.role === 'admin') redirect = '/admin/dashboard'
      else if (user.role === 'teacher') redirect = '/teacher/dashboard'

      return <Navigate to={redirect} replace />
    }
  }

  return children
}
