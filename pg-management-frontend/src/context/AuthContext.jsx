import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => sessionStorage.getItem('pg_access_token'))
  const [username, setUsername] = useState(() => sessionStorage.getItem('pg_username'))
  const [checking, setChecking] = useState(Boolean(token))

  useEffect(() => {
    const onUnauthorized = () => {
      setToken(null)
      setUsername(null)
      setChecking(false)
    }
    window.addEventListener('pg:unauthorized', onUnauthorized)
    return () => window.removeEventListener('pg:unauthorized', onUnauthorized)
  }, [])

  useEffect(() => {
    let active = true
    async function validate() {
      if (!token) { setChecking(false); return }
      try {
        const response = await api.get('/auth/me')
        if (active) setUsername(response.data.username)
      } catch {
        sessionStorage.removeItem('pg_access_token')
        sessionStorage.removeItem('pg_username')
        if (active) { setToken(null); setUsername(null) }
      } finally {
        if (active) setChecking(false)
      }
    }
    validate()
    return () => { active = false }
  }, [])

  async function login(usernameInput, password) {
    const response = await api.post('/auth/login', { username: usernameInput, password })
    sessionStorage.setItem('pg_access_token', response.data.accessToken)
    sessionStorage.setItem('pg_username', response.data.username)
    setToken(response.data.accessToken)
    setUsername(response.data.username)
  }

  function logout() {
    sessionStorage.removeItem('pg_access_token')
    sessionStorage.removeItem('pg_username')
    setToken(null)
    setUsername(null)
  }

  const value = useMemo(() => ({
    token, username, checking, isAuthenticated: Boolean(token), login, logout
  }), [token, username, checking])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
