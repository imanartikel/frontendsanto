import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import useAuthStore from '../store/authStore'

const styles = {
  page: {
    minHeight: '100vh',
    background: '#0A0A0B',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  },
  card: {
    background: '#1C1C21',
    border: '1px solid #2E2E36',
    borderRadius: '12px',
    padding: '40px',
    width: '100%',
    maxWidth: '400px',
  },
  logo: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#E8820C',
    letterSpacing: '-0.5px',
    marginBottom: '8px',
  },
  subtitle: {
    color: '#9CA3AF',
    fontSize: '14px',
    marginBottom: '32px',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '500',
    color: '#9CA3AF',
    marginBottom: '6px',
  },
  input: {
    width: '100%',
    background: '#0A0A0B',
    border: '1px solid #2E2E36',
    borderRadius: '8px',
    padding: '10px 14px',
    color: '#F3F4F6',
    fontSize: '15px',
    outline: 'none',
  },
  fieldGroup: {
    marginBottom: '16px',
  },
  hint: {
    fontSize: '12px',
    color: '#6B7280',
    marginTop: '4px',
  },
  button: {
    width: '100%',
    background: '#E8820C',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '11px',
    fontWeight: '600',
    fontSize: '15px',
    marginTop: '8px',
  },
  error: {
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: '8px',
    color: '#EF4444',
    fontSize: '13px',
    padding: '10px 14px',
    marginBottom: '20px',
  },
  success: {
    background: 'rgba(34,197,94,0.1)',
    border: '1px solid rgba(34,197,94,0.3)',
    borderRadius: '8px',
    color: '#22C55E',
    fontSize: '13px',
    padding: '10px 14px',
    marginBottom: '20px',
  },
  footer: {
    textAlign: 'center',
    marginTop: '24px',
    fontSize: '14px',
    color: '#9CA3AF',
  },
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const register = useAuthStore((s) => s.register)

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      const data = await register(email, password, fullName)
      if (data.access_token) {
        navigate('/dashboard', { replace: true })
      } else {
        // Email confirmation required
        setSuccess('Account created! Check your email to confirm before logging in.')
      }
    } catch (err) {
      const detail = err.response?.data?.detail
      if (err.response?.status === 409) {
        setError('An account with this email already exists.')
      } else {
        setError(detail || 'Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>UGCX</div>
        <div style={styles.subtitle}>Create your account</div>

        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Full name <span style={{ color: '#6B7280' }}>(optional)</span></label>
            <input
              style={styles.input}
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name"
              autoFocus
            />
          </div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={8}
            />
            <div style={styles.hint}>Minimum 8 characters</div>
          </div>
          <button
            style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
            type="submit"
            disabled={loading}
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <div style={styles.footer}>
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  )
}
