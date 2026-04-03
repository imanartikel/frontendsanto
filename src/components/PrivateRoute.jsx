import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import { authApi } from '../api/auth'

export default function PrivateRoute({ children }) {
  const { isAuthenticated, setUser, logout } = useAuthStore()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      setChecking(false)
      return
    }
    // Validate the stored token by hitting /auth/me
    authApi.me()
      .then(({ data }) => {
        setUser({ id: data.user_id, email: data.email, fullName: data.full_name })
      })
      .catch(() => {
        // Token is invalid or expired — clear session
        logout()
      })
      .finally(() => setChecking(false))
  // Only run once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (checking) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0A0A0B' }}>
        <div style={{ color: '#9CA3AF', fontSize: 14 }}>Loading…</div>
      </div>
    )
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />
}
