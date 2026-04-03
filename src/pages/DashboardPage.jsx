import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import { useTokenBalance } from '../hooks/useTokenBalance'

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
    letterSpacing: '-0.3px',
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
  },
  content: {
    maxWidth: '960px',
    margin: '0 auto',
    padding: '40px 24px',
  },
  greeting: {
    fontSize: '26px',
    fontWeight: '700',
    color: '#F3F4F6',
    marginBottom: '6px',
  },
  greetingSub: {
    color: '#9CA3AF',
    fontSize: '15px',
    marginBottom: '40px',
  },
  sectionTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: '16px',
  },
  balanceCard: {
    background: '#1C1C21',
    border: '1px solid #2E2E36',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balanceLeft: {},
  balanceLabel: {
    fontSize: '13px',
    color: '#9CA3AF',
    marginBottom: '4px',
  },
  balanceAmount: {
    fontSize: '36px',
    fontWeight: '700',
    color: '#E8820C',
    lineHeight: 1,
  },
  balanceUnit: {
    fontSize: '14px',
    color: '#6B7280',
    marginTop: '4px',
  },
  topupBtn: {
    background: 'rgba(232,130,12,0.12)',
    border: '1px solid rgba(232,130,12,0.3)',
    borderRadius: '8px',
    padding: '10px 20px',
    color: '#E8820C',
    fontWeight: '600',
    fontSize: '14px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '16px',
  },
  card: {
    background: '#1C1C21',
    border: '1px solid #2E2E36',
    borderRadius: '12px',
    padding: '24px',
    cursor: 'pointer',
    transition: 'border-color 0.15s, background 0.15s',
  },
  cardIcon: {
    fontSize: '28px',
    marginBottom: '12px',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#F3F4F6',
    marginBottom: '6px',
  },
  cardDesc: {
    fontSize: '13px',
    color: '#9CA3AF',
    lineHeight: '1.5',
    marginBottom: '16px',
  },
  cardCost: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#E8820C',
    background: 'rgba(232,130,12,0.1)',
    borderRadius: '4px',
    padding: '2px 8px',
    display: 'inline-block',
  },
}

const NAV_ITEMS = [
  {
    icon: '🖼️',
    title: 'Image Generation',
    desc: 'Generate 9 unique images from a single prompt using Imagen AI.',
    cost: '10 tokens / 9 images',
    path: '/images',
  },
  {
    icon: '🎬',
    title: 'Video Generation',
    desc: 'Create short-form UGC videos with Veo, Seedance, or Minimax.',
    cost: '40–100 tokens / video',
    path: '/videos',
  },
  {
    icon: '📊',
    title: 'UGC Analyzer',
    desc: 'Analyze any video for hooks, tone, audience fit, and UGC score.',
    cost: '20 tokens / analysis',
    path: '/analyzer',
  },
]

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { balance, isLoading } = useTokenBalance()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const firstName = user?.fullName?.split(' ')[0] || user?.email?.split('@')[0] || 'there'

  return (
    <div style={styles.page}>
      {/* Nav */}
      <nav style={styles.nav}>
        <span style={styles.navLogo}>UGCX</span>
        <div style={styles.navRight}>
          <span style={styles.tokenBadge}>
            {isLoading ? '…' : (balance ?? 0)} tokens
          </span>
          <button style={styles.logoutBtn} onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </nav>

      <div style={styles.content}>
        {/* Greeting */}
        <div style={styles.greeting}>Hey, {firstName} 👋</div>
        <div style={styles.greetingSub}>What are we creating today?</div>

        {/* Balance */}
        <div style={styles.sectionTitle}>Token Balance</div>
        <div style={styles.balanceCard}>
          <div style={styles.balanceLeft}>
            <div style={styles.balanceLabel}>Available tokens</div>
            <div style={styles.balanceAmount}>
              {isLoading ? '—' : (balance ?? 0)}
            </div>
            <div style={styles.balanceUnit}>tokens remaining</div>
          </div>
          <button style={styles.topupBtn} onClick={() => navigate('/tokens')}>
            + Top up
          </button>
        </div>

        {/* Feature cards */}
        <div style={styles.sectionTitle}>Start Creating</div>
        <div style={styles.grid}>
          {NAV_ITEMS.map((item) => (
            <div
              key={item.path}
              style={styles.card}
              onClick={() => navigate(item.path)}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(232,130,12,0.4)'
                e.currentTarget.style.background = '#26262D'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#2E2E36'
                e.currentTarget.style.background = '#1C1C21'
              }}
            >
              <div style={styles.cardIcon}>{item.icon}</div>
              <div style={styles.cardTitle}>{item.title}</div>
              <div style={styles.cardDesc}>{item.desc}</div>
              <span style={styles.cardCost}>{item.cost}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
