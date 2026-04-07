import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import { useTokenBalance } from '../hooks/useTokenBalance'
import { tokensApi } from '../api/tokens'

const styles = {
  page: {
    minHeight: '100vh',
    background: '#0A0A0B',
    padding: '0',
  },
  nav: {
    background: '#1C1C21',
    borderBottom: '1px solid #2E2E36',
    padding: '0 24px',
    height: '56px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navLogo: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#E8820C',
    cursor: 'pointer',
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  tokenBadge: {
    background: 'rgba(232,130,12,0.12)',
    border: '1px solid rgba(232,130,12,0.3)',
    borderRadius: '20px',
    padding: '4px 12px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#E8820C',
  },
  logoutBtn: {
    background: 'none',
    border: '1px solid #2E2E36',
    borderRadius: '8px',
    padding: '6px 14px',
    color: '#9CA3AF',
    fontSize: '13px',
    cursor: 'pointer',
  },
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '40px 24px',
  },
  backLink: {
    color: '#9CA3AF',
    fontSize: '14px',
    cursor: 'pointer',
    marginBottom: '20px',
    display: 'inline-block',
    textDecoration: 'none',
  },
  header: {
    marginBottom: '32px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#F3F4F6',
    marginBottom: '8px',
  },
  subtitle: {
    color: '#9CA3AF',
    fontSize: '15px',
  },
  packageGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '20px',
    marginBottom: '60px',
  },
  packageCard: {
    background: '#1C1C21',
    border: '1px solid #2E2E36',
    borderRadius: '16px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    transition: 'transform 0.2s, border-color 0.2s',
  },
  packageName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '12px',
  },
  packageTokens: {
    fontSize: '32px',
    fontWeight: '800',
    color: '#F3F4F6',
    marginBottom: '4px',
  },
  packagePrice: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#E8820C',
    marginBottom: '24px',
  },
  buyBtn: {
    width: '100%',
    padding: '12px',
    background: '#E8820C',
    borderRadius: '8px',
    border: 'none',
    color: '#FFF',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  historySection: {
    marginTop: '40px',
  },
  historyTable: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px',
  },
  th: {
    textAlign: 'left',
    padding: '12px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    borderBottom: '1px solid #2E2E36',
  },
  td: {
    padding: '16px 12px',
    fontSize: '14px',
    color: '#D1D5DB',
    borderBottom: '1px solid #1C1C21',
  },
  amountPos: {
    color: '#10B981',
    fontWeight: '700',
  },
  amountNeg: {
    color: '#EF4444',
    fontWeight: '700',
  },
}

const PACKAGES = [
  { id: 'starter', name: 'Starter', tokens: 100, price: 'Rp 15.000' },
  { id: 'basic',   name: 'Basic',   tokens: 500, price: 'Rp 60.000' },
  { id: 'pro',     name: 'Pro',     tokens: 1500, price: 'Rp 150.000' },
  { id: 'ultra',   name: 'Ultra',   tokens: 5000, price: 'Rp 450.000' },
]

export default function TokensPage() {
  const navigate = useNavigate()
  const { logout } = useAuthStore()
  const { balance, isLoading: balanceLoading, refetch: refreshBalance } = useTokenBalance()
  
  const [history, setHistory] = useState([])
  const [isBuying, setIsBuying] = useState(null) // package id

  const fetchHistory = async () => {
    try {
      const resp = await tokensApi.transactions()
      setHistory(resp.data)
    } catch (err) {
      console.error('Failed to fetch transactions:', err)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const handleTopup = async (packageId) => {
    setIsBuying(packageId)
    try {
      const resp = await paymentsApi.createCheckout(packageId)
      const { checkout_url } = resp.data
      
      // Redirect to Xendit Checkout
      window.location.href = checkout_url
    } catch (err) {
      console.error('Checkout failed:', err)
      alert('Failed to initiate checkout. Please try again.')
      setIsBuying(null)
    }
  }

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <span style={styles.navLogo} onClick={() => navigate('/')}>UGCX</span>
        <div style={styles.navRight}>
          <span style={styles.tokenBadge}>
            {balanceLoading ? '…' : (balance ?? 0)} tokens
          </span>
          <button style={styles.logoutBtn} onClick={handleLogout}>Sign out</button>
        </div>
      </nav>

      <div style={styles.container}>
        <div style={styles.backLink} onClick={() => navigate('/')}>← Back to Dashboard</div>

        <div style={styles.header}>
          <h1 style={styles.title}>Refill Tokens</h1>
          <p style={styles.subtitle}>Choose a package to continue creating cinematic UGC content.</p>
        </div>

        <div style={styles.packageGrid}>
          {PACKAGES.map(pkg => (
            <div 
              key={pkg.id} 
              style={styles.packageCard}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#E8820C'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#2E2E36'}
            >
              <div style={styles.packageName}>{pkg.name}</div>
              <div style={styles.packageTokens}>{pkg.tokens}</div>
              <div style={styles.packagePrice}>{pkg.price}</div>
              <button 
                style={{
                  ...styles.buyBtn,
                  opacity: isBuying ? 0.6 : 1,
                  cursor: isBuying ? 'not-allowed' : 'pointer'
                }}
                disabled={!!isBuying}
                onClick={() => handleTopup(pkg.id)}
              >
                {isBuying === pkg.id ? 'Processing...' : 'Purchase'}
              </button>
            </div>
          ))}
        </div>

        <div style={styles.historySection}>
          <h2 style={{ color: '#F3F4F6', fontSize: '20px', marginBottom: '8px' }}>Transaction History</h2>
          <p style={{ color: '#9CA3AF', fontSize: '14px' }}>Your recent top-ups and content creation costs.</p>
          
          <table style={styles.historyTable}>
            <thead>
              <tr>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Description</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {history.map(tx => (
                <tr key={tx.id}>
                  <td style={styles.td}>{new Date(tx.created_at).toLocaleDateString()}</td>
                  <td style={styles.td}>{tx.description}</td>
                  <td style={styles.td}>
                    <span style={{ 
                      fontSize: '11px', 
                      textTransform: 'uppercase', 
                      background: tx.type === 'topup' ? 'rgba(16,185,129,0.1)' : 'rgba(107,114,128,0.1)',
                      color: tx.type === 'topup' ? '#10B981' : '#9CA3AF',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontWeight: '700'
                    }}>
                      {tx.type}
                    </span>
                  </td>
                  <td style={{ ...styles.td, ...(tx.amount > 0 ? styles.amountPos : styles.amountNeg) }}>
                    {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                  </td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ ...styles.td, textAlign: 'center', padding: '40px', color: '#6B7280' }}>
                    No transactions yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
