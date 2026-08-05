import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('tms_user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  // Save login data: { token, name, email, role }
  function login(userData) {
    const normalized = {
      ...userData,
      name: userData.name || userData.fullName || '',
    }
    localStorage.setItem('tms_user', JSON.stringify(normalized))
    setUser(normalized)
  }

  function logout() {
    localStorage.removeItem('tms_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
