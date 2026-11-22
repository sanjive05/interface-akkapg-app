import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LockKeyhole, ShieldCheck, Building2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (isAuthenticated) return <Navigate to="/" replace />

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(username, password)
      navigate('/', { replace: true })
    } catch (err) {
      const message = err.response?.data?.detail || err.response?.data?.message
      setError(message || 'Login failed. Check your username and password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-brand-panel">
        <div className="brand-lockup"><span className="brand-icon"><Building2 size={22} /></span><span>AKKA PG · SUBASH PG</span></div>
        <div className="brand-message">
          <span className="eyebrow">PG MANAGEMENT, MADE SIMPLE</span>
          <h1>Your property.<br />Under control.</h1>
          <p>Manage residents, rooms, monthly billing and payments from one calm, clear workspace.</p>
          <div className="brand-points">
            <span><ShieldCheck size={17} /> Private admin access</span>
            <span><LockKeyhole size={17} /> Your data stays on this PC</span>
          </div>
        </div>
        <div className="brand-footer">A simpler way to run your PG.</div>
      </section>

      <section className="login-form-panel">
        <div className="login-form-wrap">
          <div className="mobile-brand"><span className="brand-icon"><Building2 size={20} /></span> AKKA PG · SUBASH PG</div>
          <div className="form-heading">
            <span className="eyebrow">ADMIN WORKSPACE</span>
            <h2>Welcome back</h2>
            <p>Sign in to continue to your PG dashboard.</p>
          </div>
          <form onSubmit={handleSubmit} className="login-form">
            <label htmlFor="username">Username</label>
            <input id="username" value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" required />
            <label htmlFor="password">Password</label>
            <div className="password-wrap">
              <input id="password" type={showPassword ? 'text' : 'password'} value={password}
                onChange={e => setPassword(e.target.value)} autoComplete="current-password" required />
              <button type="button" className="password-toggle" onClick={() => setShowPassword(v => !v)} aria-label="Toggle password visibility">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {error && <div className="form-error" role="alert">{error}</div>}
            <button className="primary-button login-button" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Sign in'}
            </button>
          </form>
          <p className="security-note"><LockKeyhole size={14} /> Secure access for PG administrators</p>
        </div>
      </section>
    </main>
  )
}
