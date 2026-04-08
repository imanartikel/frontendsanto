import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import { useTokenBalance } from '../hooks/useTokenBalance'
import { affiliateApi } from '../api/affiliate'
import { extractErrorMsg } from '../utils/errors'

const styles = {
  page: { minHeight: '100vh', background: '#0A0A0B', padding: '0', color: '#F3F4F6' },
  nav: {
    background: '#1C1C21', borderBottom: '1px solid #2E2E36', padding: '0 24px',
    height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  navLogo: { fontSize: '20px', fontWeight: '700', color: '#10B981', cursor: 'pointer' },
  navRight: { display: 'flex', alignItems: 'center', gap: '16px' },
  tokenBadge: {
    background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)',
    borderRadius: '20px', padding: '4px 12px', fontSize: '13px', fontWeight: '600', color: '#10B981',
  },
  logoutBtn: {
    background: 'none', border: '1px solid #2E2E36', borderRadius: '8px', padding: '6px 14px',
    color: '#9CA3AF', fontSize: '13px', cursor: 'pointer',
  },
  container: { maxWidth: '1000px', margin: '0 auto', padding: '40px 24px' },
  header: { marginBottom: '32px' },
  title: { fontSize: '28px', fontWeight: '700', color: '#F3F4F6', marginBottom: '8px' },
  subtitle: { color: '#9CA3AF', fontSize: '15px' },
  inputSection: {
    background: '#1C1C21', border: '1px solid #2E2E36', borderRadius: '16px', padding: '24px', marginBottom: '40px',
  },
  label: { display: 'block', fontSize: '14px', fontWeight: '700', color: '#F3F4F6', marginBottom: '12px' },
  input: {
    width: '100%', background: '#0A0A0B', border: '1px solid #2E2E36', borderRadius: '10px',
    padding: '14px 16px', color: '#F3F4F6', fontSize: '15px', outline: 'none', marginBottom: '20px', boxSizing: 'border-box',
  },
  analyzeBtn: {
    width: '100%', padding: '14px', background: '#10B981', borderRadius: '10px', border: 'none',
    color: '#FFF', fontSize: '16px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s',
  },
  resultsContainer: { background: '#1C1C21', border: '1px solid #2E2E36', borderRadius: '16px', padding: '32px', marginBottom: '40px' },
  grid3: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' },
  scoreCard: { background: '#0A0A0B', border: '1px solid #2E2E36', borderRadius: '12px', padding: '20px', textAlign: 'center' },
  scoreVal: (color) => ({ fontSize: '36px', fontWeight: '800', color: color, marginBottom: '4px' }),
  scoreLabel: { fontSize: '12px', color: '#9CA3AF', textTransform: 'uppercase', fontWeight: '600' },
  sectionTitle: { fontSize: '18px', fontWeight: '700', color: '#F3F4F6', marginTop: '32px', marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid #2E2E36' },
  card: { background: '#0A0A0B', border: '1px solid #2E2E36', borderRadius: '12px', padding: '16px', marginBottom: '12px' },
  copyBtn: { background: 'rgba(255,255,255,0.1)', color: '#D1D5DB', border: '1px solid #2E2E36', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', transition: '0.2s', float: 'right' },
  pill: { display: 'inline-block', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', marginRight: '6px', marginBottom: '6px' },
  tagGroup: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }
}

const getScoreColor = (val) => {
  if (val >= 8.0) return '#10B981'; // Green
  if (val >= 6.0) return '#F59E0B'; // Yellow
  return '#EF4444'; // Red
}

export default function AffiliatePage() {
  const navigate = useNavigate()
  const { logout } = useAuthStore()
  const { balance, isLoading: balanceLoading, refetch: refreshBalance } = useTokenBalance()
  
  const [videoUrl, setVideoUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [copiedStates, setCopiedStates] = useState({})

  const handleAnalyze = async () => {
    if (!videoUrl.trim()) return
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await affiliateApi.analyze(videoUrl)
      setResult(response.data.analysis)
      refreshBalance()
    } catch (err) {
      setError(extractErrorMsg(err, 'Failed to analyze affiliate video.'))
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopiedStates(prev => ({ ...prev, [id]: true }))
    setTimeout(() => {
      setCopiedStates(prev => ({ ...prev, [id]: false }))
    }, 2000)
  }

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <span style={styles.navLogo} onClick={() => navigate('/')}>UGCX</span>
        <div style={styles.navRight}>
          <span style={styles.tokenBadge}>
            {balanceLoading ? '…' : (balance ?? 0)} tokens
          </span>
          <button style={styles.logoutBtn} onClick={() => { logout(); navigate('/login') }}>Sign out</button>
        </div>
      </nav>

      <div style={styles.container}>
        <div style={{ color: '#9CA3AF', cursor: 'pointer', marginBottom: '20px', fontSize: '14px' }} onClick={() => navigate('/')}>
          ← Back to Dashboard
        </div>

        <div style={styles.header}>
          <h1 style={styles.title}>Affiliate Video Analyzer</h1>
          <p style={styles.subtitle}>Audit marketing metrics, hook effectiveness, and generate instant selling assets from viral affiliate videos.</p>
        </div>

        <div style={styles.inputSection}>
          <label style={styles.label}>Tiktok / Reels Affiliate URL</label>
          <input
            style={styles.input}
            placeholder="https://www.tiktok.com/@creator/video/..."
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            disabled={loading}
          />
          {error && <div style={{ color: '#EF4444', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}
          <button
            style={{ ...styles.analyzeBtn, opacity: loading || !videoUrl.trim() ? 0.6 : 1 }}
            onClick={handleAnalyze} disabled={loading || !videoUrl.trim()}
          >
            {loading ? 'Analyzing Marketing Performance...' : 'Audit & Extract Assets (5 tokens)'}
          </button>
        </div>

        {result && (
          <div style={styles.resultsContainer}>
            
            {/* SCORE GAUGE DASHBOARD */}
            <h2 style={{ fontSize: '20px', marginBottom: '20px', textAlign: 'center' }}>Performance Dashboard</h2>
            <div style={styles.grid3}>
              <div style={styles.scoreCard}>
                <div style={styles.scoreVal(getScoreColor(result.scores.hook_score))}>{result.scores.hook_score}</div>
                <div style={styles.scoreLabel}>Hook Score</div>
              </div>
              <div style={styles.scoreCard}>
                <div style={styles.scoreVal(getScoreColor(result.scores.cta_clarity))}>{result.scores.cta_clarity}</div>
                <div style={styles.scoreLabel}>CTA Clarity</div>
              </div>
              <div style={styles.scoreCard}>
                <div style={styles.scoreVal(getScoreColor(result.scores.product_visibility))}>{result.scores.product_visibility}</div>
                <div style={styles.scoreLabel}>Product Visibility</div>
              </div>
            </div>

            <div style={{ background: '#0A0A0B', borderRadius: '12px', padding: '16px', marginBottom: '32px', borderLeft: '4px solid #10B981' }}>
              <strong style={{ display: 'block', fontSize: '13px', color: '#10B981', textTransform: 'uppercase', marginBottom: '6px' }}>HOOK ANALYSIS:</strong>
              <p style={{ color: '#D1D5DB', fontSize: '14px', lineHeight: 1.5 }}>{result.scores.hook_reasoning}</p>
            </div>

            {/* DETECTED PRODUCTS */}
            <h3 style={styles.sectionTitle}>Detected Products</h3>
            {result.detected_products.map((prod, idx) => (
              <div key={idx} style={styles.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <strong style={{ color: '#F3F4F6', fontSize: '15px' }}>{prod.name}</strong>
                  <span style={{ fontSize: '12px', color: '#9CA3AF' }}>{prod.timestamp}</span>
                </div>
                <div style={{ color: '#D1D5DB', fontSize: '13px' }}>Angle: <span style={{ color: '#10B981' }}>{prod.affiliate_angle}</span></div>
              </div>
            ))}

            {/* GENERATED MARKETING ASSETS */}
            <h3 style={styles.sectionTitle}>Marketing Assets (Extraction)</h3>
            
            <div style={{ marginBottom: '24px' }}>
              <div style={{ color: '#9CA3AF', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px', textTransform: 'uppercase' }}>High-Converting CTAs</div>
              {result.generated_assets.cta_variations.map((cta, idx) => (
                <div key={idx} style={{...styles.card, padding: '12px 16px'}}>
                  <button style={styles.copyBtn} onClick={() => handleCopy(cta, `cta-${idx}`)}>
                    {copiedStates[`cta-${idx}`] ? 'Copied' : 'Copy'}
                  </button>
                  <span style={{ fontSize: '14px', color: '#E5E7EB', lineHeight: '28px' }}>{cta}</span>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ color: '#9CA3AF', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px', textTransform: 'uppercase' }}>Viral Caption Formulas</div>
              {result.generated_assets.captions.map((cap, idx) => (
                <div key={idx} style={{...styles.card, padding: '12px 16px'}}>
                  <button style={styles.copyBtn} onClick={() => handleCopy(cap, `cap-${idx}`)}>
                    {copiedStates[`cap-${idx}`] ? 'Copied' : 'Copy'}
                  </button>
                  <span style={{ fontSize: '14px', color: '#E5E7EB', lineHeight: '28px' }}>{cap}</span>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ color: '#9CA3AF', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Hashtag Strategy
                <button 
                  style={{ ...styles.copyBtn, float: 'none', background: '#10B981', color: '#fff', border: 'none' }}
                  onClick={() => {
                    const allTags = [...result.generated_assets.hashtag_strategy.primary, ...result.generated_assets.hashtag_strategy.trending, ...result.generated_assets.hashtag_strategy.niche].join(' ')
                    handleCopy(allTags, 'hashtags')
                  }}
                >
                  {copiedStates['hashtags'] ? 'Copied All!' : 'Copy All Hashtags'}
                </button>
              </div>
              <div style={styles.card}>
                <div style={{ marginBottom: '12px' }}>
                  <span style={{ fontSize: '12px', color: '#9CA3AF', display: 'block', marginBottom: '4px' }}>Primary:</span>
                  <div style={styles.tagGroup}>{result.generated_assets.hashtag_strategy.primary.map(t => <span key={t} style={{...styles.pill, background: 'rgba(16,185,129,0.1)', color: '#10B981'}}>{t}</span>)}</div>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <span style={{ fontSize: '12px', color: '#9CA3AF', display: 'block', marginBottom: '4px' }}>Trending:</span>
                  <div style={styles.tagGroup}>{result.generated_assets.hashtag_strategy.trending.map(t => <span key={t} style={{...styles.pill, background: 'rgba(245,158,11,0.1)', color: '#F59E0B'}}>{t}</span>)}</div>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: '#9CA3AF', display: 'block', marginBottom: '4px' }}>Niche:</span>
                  <div style={styles.tagGroup}>{result.generated_assets.hashtag_strategy.niche.map(t => <span key={t} style={{...styles.pill, background: 'rgba(59,130,246,0.1)', color: '#3B82F6'}}>{t}</span>)}</div>
                </div>
              </div>
            </div>

            {/* IMPROVEMENTS */}
            <h3 style={styles.sectionTitle}>Fixes & Suggestions</h3>
            <ul style={{ paddingLeft: '20px', color: '#D1D5DB', fontSize: '14px', lineHeight: 1.6 }}>
              {result.improvement_suggestions.map((s, idx) => (
                <li key={idx} style={{ marginBottom: '8px' }}>{s}</li>
              ))}
            </ul>

          </div>
        )}
      </div>
    </div>
  )
}
