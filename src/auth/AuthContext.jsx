import { createContext, useContext, useEffect, useState } from 'react'
import { api, tokenStore } from '../api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!tokenStore.get()) { setLoading(false); return }
    api.me()
      .then(setUser)
      .catch(() => { tokenStore.clear(); setUser(null) })
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    const { token, user } = await api.login(email, password)
    tokenStore.set(token)
    setUser(user)
    return user
  }

  const logout = async () => {
    try { await api.logout() } catch { /* token may already be invalid */ }
    tokenStore.clear()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
