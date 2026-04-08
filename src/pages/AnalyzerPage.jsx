import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import { useTokenBalance } from '../hooks/useTokenBalance'
import { analyzerApi } from '../api/analyzer'
import { extractErrorMsg } from '../utils/errors'

const styles = {
  page: { minHeight: '100vh', background: '#0A0A0B', padding: '0', color: '#F3F4F6' },
  nav: {
    background: '#1C1C21', borderBottom: '1px solid #2E2E36', padding: '0 24px',
    height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  navLogo: { fontSize: '20px', fontWeight: '700', color: '#E8820C', cursor: 'pointer' },
  navRight: { display: 'flex', alignItems: 'center', gap: '16px' },
  tokenBadge: {
    background: 'rgba(232,130,12,0.12)', border: '1px solid rgba(232,130,12,0.3)',
    borderRadius: '20px', padding: '4px 12px', fontSize: '13px', fontWeight: '600', color: '#E8820C',
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
    width: '100%', padding: '14px', background: '#E8820C', borderRadius: '10px', border: 'none',
    color: '#FFF', fontSize: '16px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s',
  },
  resultsContainer: { background: '#1C1C21', border: '1px solid #2E2E36', borderRadius: '16px', padding: '32px', marginBottom: '40px' },
  tabBar: { display: 'flex', gap: '16px', borderBottom: '1px solid #2E2E36', marginBottom: '24px' },
  tab: (active) => ({
    padding: '12px 24px', cursor: 'pointer', fontWeight: '600', fontSize: '15px',
    borderBottom: active ? '2px solid #E8820C' : '2px solid transparent',
    color: active ? '#E8820C' : '#9CA3AF', transition: 'all 0.2s'
  }),
  tag: {
    display: 'inline-block', background: 'rgba(232,130,12,0.1)', color: '#E8820C',
    padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', marginRight: '8px', marginBottom: '8px',
    border: '1px solid rgba(232,130,12,0.3)'
  },
  sceneRow: {
    display: 'flex', gap: '16px', background: '#0A0A0B', border: '1px solid #2E2E36',
    borderRadius: '12px', padding: '16px', marginBottom: '16px'
  },
  sceneTimeBlock: { minWidth: '120px', borderRight: '1px solid #2E2E36', paddingRight: '16px' },
  timeTxt: { fontSize: '14px', fontWeight: '700', color: '#E8820C', display: 'block' },
  typeTxt: { fontSize: '12px', textTransform: 'uppercase', color: '#6B7280', fontWeight: '600', marginTop: '4px', display: 'block' },
  sceneContent: { flex: 1 },
  sceneTitle: { fontSize: '12px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '4px' },
  promptCard: { background: '#0A0A0B', border: '1px solid #2E2E36', borderRadius: '12px', padding: '16px', marginBottom: '16px' },
  copyBtn: { background: '#E8820C', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', fontWeight: 'bold' }
}

export default function AnalyzerPage() {
  const navigate = useNavigate()
  const { logout } = useAuthStore()
  const { balance, isLoading: balanceLoading, refetch: refreshBalance } = useTokenBalance()
  
  const [videoUrl, setVideoUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  
  const [activeTab, setActiveTab] = useState('timeline') // 'timeline' | 'prompts'
  const [copiedObj, setCopiedObj] = useState({})

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const handleAnalyze = async () => {
    if (!videoUrl.trim()) return
    if (balance < 15) {
      setError('Insufficient tokens. Analysis requires 15 tokens.')
      return
    }
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await analyzerApi.analyze(videoUrl)
      // Note: Response.analysis now matches the Blueprint Analysis schema
      setResult(response.data.analysis)
      refreshBalance()
    } catch (err) {
      setError(extractErrorMsg(err, 'Failed to analyze video. Please check the URL.'))
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopiedObj({ ...copiedObj, [id]: true })
    setTimeout(() => setCopiedObj({ ...copiedObj, [id]: false }), 2000)
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
        <div style={{ color: '#9CA3AF', cursor: 'pointer', marginBottom: '20px', fontSize: '14px' }} onClick={() => navigate('/')}>
          ← Back to Dashboard
        </div>

        <div style={styles.header}>
          <h1 style={styles.title}>Blueprint Deconstructor</h1>
          <p style={styles.subtitle}>Reverse engineer viral TikToks/Reels into an AI-ready frame timeline and prompt replicas.</p>
        </div>

        <div style={styles.inputSection}>
          <label style={styles.label}>Paste Video URL</label>
          <input
            style={styles.input}
            placeholder="https://www.tiktok.com/@user/video/..."
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            disabled={loading}
          />
          
          {error && <div style={{ color: '#EF4444', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}

          <button
            style={{ ...styles.analyzeBtn, opacity: loading || !videoUrl.trim() ? 0.6 : 1 }}
            onClick={handleAnalyze}
            disabled={loading || !videoUrl.trim()}
          >
            {loading ? 'Deconstructing Video...' : 'Deconstruct Video (15 tokens)'}
          </button>
        </div>

        {result && (
          <div style={styles.resultsContainer}>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '13px', color: '#9CA3AF', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px' }}>Virality Factors Identified</div>
              <div>
                {result.virality_factors?.map((factor, idx) => (
                  <span key={idx} style={styles.tag}>⚡ {factor}</span>
                ))}
              </div>
            </div>

            <div style={styles.tabBar}>
              <div style={styles.tab(activeTab === 'timeline')} onClick={() => setActiveTab('timeline')}>Timeline Breakdown</div>
              <div style={styles.tab(activeTab === 'prompts')} onClick={() => setActiveTab('prompts')}>AI Prompts Replica</div>
            </div>

            {activeTab === 'timeline' && (
              <div>
                <p style={{ color: '#9CA3AF', fontSize: '14px', marginBottom: '20px' }}>Total Duration: {result.total_duration}s • Primary Hook: {result.hook_type}</p>
                {result.scene_breakdown?.map((scene, idx) => (
                  <div key={idx} style={styles.sceneRow}>
                    <div style={styles.sceneTimeBlock}>
                      <span style={styles.timeTxt}>{scene.timestamp}</span>
                      <span style={styles.typeTxt}>{scene.type}</span>
                    </div>
                    <div style={styles.sceneContent}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                          <div style={styles.sceneTitle}>Visual Direction</div>
                          <div style={{ color: '#D1D5DB', fontSize: '14px', lineHeight: 1.5 }}>{scene.visual}</div>
                        </div>
                        <div>
                          <div style={styles.sceneTitle}>Audio & Voiceover</div>
                          <div style={{ color: '#D1D5DB', fontSize: '14px', lineHeight: 1.5 }}>{scene.audio}</div>
                        </div>
                      </div>
                      <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #2E2E36' }}>
                        <span style={{ ...styles.sceneTitle, display: 'inline', color: '#9CA3AF', fontSize: '12px', fontWeight: 'bold' }}>Technique Used: </span>
                        <span style={{ fontSize: '13px', color: '#F3F4F6' }}>{scene.technique}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'prompts' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <p style={{ color: '#9CA3AF', fontSize: '14px' }}>Ready-to-use prompts describing each frame of the viral video.</p>
                  <button 
                    style={styles.copyBtn}
                    onClick={() => handleCopy(JSON.stringify(result.replicable_prompts, null, 2), 'all')}
                  >
                    {copiedObj['all'] ? '✅ COPIED JSON' : '📋 COPY ALL JSON'}
                  </button>
                </div>

                {result.replicable_prompts?.map((item, idx) => (
                  <div key={idx} style={styles.promptCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ color: '#E8820C', fontWeight: 'bold', fontSize: '14px' }}>Frame #{item.frame}</span>
                      <button 
                        style={{ background: 'transparent', border: 'none', color: '#9CA3AF', fontSize: '12px', cursor: 'pointer' }}
                        onClick={() => handleCopy(item.prompt, `frame-${idx}`)}
                      >
                         {copiedObj[`frame-${idx}`] ? 'Copied!' : 'Copy Text'}
                      </button>
                    </div>
                    <div style={{ color: '#D1D5DB', fontSize: '14px', lineHeight: 1.6 }}>{item.prompt}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
