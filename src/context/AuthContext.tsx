import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import api from '../services/api'

export interface UserInfo {
  id: number
  username: string
  email: string
  role: 'Administrador' | 'Analista' | 'Consulta' | string
}

interface AuthContextType {
  token: string | null
  user: UserInfo | null
  isAuthenticated: boolean
  loading: boolean
  login: (token: string, user?: UserInfo) => void
  logout: () => void
  hasRole: (allowedRoles: string[]) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('matrixflow_token'))
  const [user, setUser] = useState<UserInfo | null>(() => {
    const storedUser = localStorage.getItem('matrixflow_user')
    if (storedUser) {
      try {
        return JSON.parse(storedUser)
      } catch {
        return null
      }
    }
    return null
  })
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const verifyAuth = async () => {
      const storedToken = localStorage.getItem('matrixflow_token')
      if (!storedToken) {
        setLoading(false)
        return
      }

      try {
        // Fetch current user from backend /me
        const response = await api.get<UserInfo>('/api/v1/auth/me')
        setUser(response.data)
        localStorage.setItem('matrixflow_user', JSON.stringify(response.data))
      } catch (error) {
        console.warn('Sesión no válida o expirada:', error)
        // If error is 401, clear credentials
        logout()
      } finally {
        setLoading(false)
      }
    }

    verifyAuth()
  }, [])

  const login = (newToken: string, newUser?: UserInfo) => {
    setToken(newToken)
    localStorage.setItem('matrixflow_token', newToken)

    if (newUser) {
      setUser(newUser)
      localStorage.setItem('matrixflow_user', JSON.stringify(newUser))
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('matrixflow_token')
    localStorage.removeItem('matrixflow_user')
  }

  const hasRole = (allowedRoles: string[]) => {
    if (!user) return false
    return allowedRoles.includes(user.role)
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!token,
        loading,
        login,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider')
  }
  return context
}

