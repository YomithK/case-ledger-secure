import { createContext, useState, useEffect, useCallback } from 'react'
import { login as loginApi } from '@/api/auth.api'
import { LOCAL_STORAGE_TOKEN_KEY, LOCAL_STORAGE_USER_KEY } from '@/utils/constants'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // Hydrate from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY)
    const storedUser = localStorage.getItem(LOCAL_STORAGE_USER_KEY)
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (credentials) => {
    const response = await loginApi(credentials)
    const { token: newToken, user: newUser } = response.data.data
    localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, newToken)
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
    return newUser
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY)
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY)
    setToken(null)
    setUser(null)
  }, [])

  const updateUserInContext = useCallback((updatedUser) => {
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(updatedUser))
    setUser(updatedUser)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        role: user?.role || null,
        loading,
        login,
        logout,
        updateUserInContext,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
