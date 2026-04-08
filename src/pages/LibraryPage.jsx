import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import { useTokenBalance } from '../hooks/useTokenBalance'
import { authApi } from '../api/auth'
import { proxify } from '../utils/assets'

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
    maxWidth: '1200px',
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
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
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
  filterGroup: {
    display: 'flex',
    gap: '8px',
  },
  filterBtn: {
    background: '#0A0A0B',
    border: '1px solid #2E2E36',
    borderRadius: '8px',
    padding: '6px 14px',
    color: '#9CA3AF',
    fontSize: '13px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  filterBtnActive: {
    background: 'rgba(232,130,12,0.1)',
    border: '1px solid #E8820C',
    color: '#E8820C',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '24px',
    marginTop: '40px',
  },
  card: {
    background: '#1C1C21',
    border: '1px solid #2E2E36',
    borderRadius: '16px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.2s',
    cursor: 'pointer',
  },
  cardMedia: {
    width: '100%',
    aspectRatio: '16/9',
    background: '#000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  cardTypeOverlay: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    background: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(4px)',
    padding: '4px 10px',
    borderRadius: '6px',
    color: '#FFF',
    fontSize: '10px',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  cardBody: {
    padding: '20px',
  },
  cardPrompt: {
    fontSize: '14px',
    color: '#F3F4F6',
    fontWeight: '600',
    marginBottom: '8px',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    height: '40px',
    lineHeight: '1.4',
  },
  cardMeta: {
    fontSize: '12px',
    color: '#9CA3AF',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  empty: {
    textAlign: 'center',
    padding: '80px 24px',
    color: '#6B7280',
  },
}

export default function LibraryPage() {
  const navigate = useNavigate()
  const { logout } = useAuthStore()
  const { balance, isLoading: balanceLoading } = useTokenBalance()
  
  const [generations, setGenerations] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, image, video, analysis

  // Removed duplicated proxify logic - using shared utility

  const fetchGenerations = async () => {
    try {
      const resp = await authApi.generations()
      setGenerations(resp.data)
    } catch (err) {
      console.error('Failed to fetch library:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGenerations()
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const filteredItems = generations.filter(g => 
    filter === 'all' || g.type === filter
  )

  const handleCardClick = (item) => {
    if (item.type === 'analysis') {
      navigate('/analyzer')
      // In a real app we would pass state or ID to load it
    } else if (item.type === 'image') {
      navigate('/images')
    } else {
      navigate('/videos')
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
          <div>
            <h1 style={styles.title}>My Library</h1>
            <p style={styles.subtitle}>All your generated visual assets and audits in one place.</p>
          </div>
          <div style={styles.filterGroup}>
            {['all', 'image', 'video', 'analysis'].map(f => (
              <button 
                key={f}
                style={{
                  ...styles.filterBtn,
                  ...(filter === f ? styles.filterBtnActive : {})
                }}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={styles.empty}>Loading your masterpieces...</div>
        ) : filteredItems.length === 0 ? (
          <div style={styles.empty}>
            No generations found for this category. Start creating!
          </div>
        ) : (
          <div style={styles.grid}>
            {filteredItems.map(item => (
              <div 
                key={item.id} 
                style={styles.card}
                onClick={() => handleCardClick(item)}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={styles.cardMedia}>
                  <div style={styles.cardTypeOverlay}>{item.type}</div>
                  {item.status === 'completed' && item.result_urls?.length > 0 ? (
                    item.type === 'video' ? (
                      <video muted src={proxify(item.result_urls[0])} style={styles.resultImg} />
                    ) : (
                      <img src={proxify(item.result_urls[0])} style={styles.resultImg} alt="Thumbnail" />
                    )
                  ) : (
                    <div style={{ color: '#374151' }}>{item.type === 'analysis' ? '📊 Report' : '⌛ Processing'}</div>
                  )}
                </div>
                <div style={styles.cardBody}>
                  <div style={styles.cardPrompt}>
                    {item.prompt || 'No prompt provided'}
                  </div>
                  <div style={styles.cardMeta}>
                    <span>{new Date(item.created_at).toLocaleDateString()}</span>
                    <span style={{ 
                      color: item.status === 'completed' ? '#10B981' : '#E8820C',
                      fontWeight: '700'
                    }}>
                      {item.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
