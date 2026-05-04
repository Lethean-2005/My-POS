import { useState } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'
import logo from '../assets/Fashion Brand Art Design Logo.svg'

export default function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  const [email, setEmail] = useState('admin@pos.com')
  const [password, setPassword] = useState('password')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to={from} replace />

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <img src={logo} alt="Logo" className="auth-logo" />
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-sub">Sign in to your POS account</p>

        <form className="auth-form" onSubmit={submit}>
          <label>
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
            />
          </label>
          <label>
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </label>

          {error && <div className="auth-error">{error}</div>}

          <button className="auth-submit" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className="auth-hint">
          Default account: <code>admin@pos.com</code> / <code>password</code>
        </div>
      </div>
    </div>
  )
}
