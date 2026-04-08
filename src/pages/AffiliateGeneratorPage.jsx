import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import { useTokenBalance } from '../hooks/useTokenBalance'
import { videosApi } from '../api/videos'
import { proxify } from '../utils/assets'

const styles = {
  page: { minHeight: '100vh', background: '#0A0A0B', color: '#F3F4F6' },
  nav: {
    background: '#1C1C21', borderBottom: '1px solid #2E2E36', padding: '0 24px',
    height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  navLogo: { fontSize: '20px', fontWeight: '700', color: '#F472B6', cursor: 'pointer' },
  container: { maxWidth: '1200px', margin: '0 auto', padding: '40px 24px', display: 'flex', gap: '32px', flexWrap: 'wrap' },
  leftPanel: { flex: '1 1 350px', display: 'flex', flexDirection: 'column', gap: '24px' },
  rightPanel: { flex: '2 1 600px', display: 'flex', flexDirection: 'column' },
  card: { background: '#1C1C21', border: '1px solid #2E2E36', borderRadius: '16px', padding: '24px' },
  label: { fontSize: '13px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '8px', display: 'block' },
  textarea: {
    width: '100%', minHeight: '100px', background: '#0A0A0B', border: '1px solid #2E2E36',
    borderRadius: '8px', padding: '16px', color: '#F3F4F6', fontSize: '14px', resize: 'vertical',
    fontFamily: 'inherit', marginBottom: '20px'
  },
  pillGroup: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' },
  pill: (active) => ({
    padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
    background: active ? 'rgba(244,114,182,0.15)' : '#0A0A0B',
    color: active ? '#F472B6' : '#9CA3AF',
    border: `1px solid ${active ? '#F472B6' : '#2E2E36'}`,
    transition: 'all 0.2s'
  }),
  button: {
    background: '#F472B6', border: 'none', borderRadius: '8px', padding: '14px',
    color: '#FFF', fontSize: '15px', fontWeight: '700', cursor: 'pointer', width: '100%'
  },
  statusBox: { background: '#131317', border: '1px solid #2E2E36', borderRadius: '12px', padding: '24px', textAlign: 'center', marginBottom: '24px' },
  videoContainer: { width: '100%', borderRadius: '12px', overflow: 'hidden', background: '#000', marginBottom: '16px', border: '1px solid #2E2E36' },
  historyGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginTop: '32px' },
  historyCard: { background: '#1C1C21', border: '1px solid #2E2E36', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer' }
}

const STYLES = ['ugc_product_demo', 'lifestyle_aesthetic', 'cinematic_unboxing']
const RATIOS = ['9:16', '16:9']

export default function AffiliateGeneratorPage() {
  const navigate = useNavigate()
  const { logout } = useAuthStore()
  const { balance, refetch } = useTokenBalance()

  const [desc, setDesc] = useState('')
  const [style, setStyle] = useState('ugc_product_demo')
  const [ratio, setRatio] = useState('9:16')
  
  const [loading, setLoading] = useState(false)
  const [jobId, setJobId] = useState(null)
  const [status, setStatus] = useState(null) // 'queued' | 'running' | 'done' | 'failed'
  const [videoUrl, setVideoUrl] = useState(null)
  const [history, setHistory] = useState([])

  // Removed duplicated proxify logic - using shared utility

  // Polling logic
  useEffect(() => {
    let interval
    if (jobId && (status === 'queued' || status === 'running' || !status)) {
      interval = setInterval(async () => {
        try {
          const resp = await videosApi.status(jobId)
          setStatus(resp.data.status)
          if (resp.data.status === 'done' || resp.data.status === 'completed') {
            setVideoUrl(resp.data.result_urls?.[0])
            setJobId(null)
            fetchHistory()
            refetch()
          }
        } catch (err) {
          console.error("Polling error", err)
        }
      }, 5000)
    }
    return () => clearInterval(interval)
  }, [jobId, status])

  const fetchHistory = async () => {
    try {
      const resp = await videosApi.history()
      setHistory(resp.data)
    } catch (err) {}
  }

  useEffect(() => { fetchHistory() }, [])

  const handleGenerate = async () => {
    if (!desc.trim() || balance < 20) return
    setLoading(true)
    setVideoUrl(null)
    setStatus(null)
    try {
      const resp = await videosApi.createAffiliate({
        product_description: desc,
        style,
        aspect_ratio: ratio,
        duration: 10
      })
      setJobId(resp.data.job_id)
      setStatus(resp.data.status)
    } catch (err) {
      alert("Submission failed.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <span style={styles.navLogo} onClick={() => navigate('/')}>UGCX</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: '#F472B6', fontWeight: '600' }}>{balance ?? 0} tokens</span>
          <button style={{ background:'none', border:'none', color:'#9CA3AF', cursor:'pointer' }} onClick={() => { logout(); navigate('/login') }}>
            Sign out
          </button>
        </div>
      </nav>

      <div style={styles.container}>
        <div style={styles.leftPanel}>
          <div style={{ color: '#9CA3AF', cursor: 'pointer', marginBottom: '16px', fontSize: '14px' }} onClick={() => navigate('/')}>← Dashboard</div>
          <h1 style={{ fontSize: '24px', marginBottom: '8px' }}>Autonomous Video Gen</h1>
          <p style={{ color: '#9CA3AF', fontSize: '14px', marginBottom: '24px' }}>AI-powered start-to-finish affiliate video production.</p>

          <div style={styles.card}>
            <label style={styles.label}>Product Description</label>
            <textarea style={styles.textarea} placeholder="E.g. Serum vitamin C dalam botol amber, tekstur kental, glowing skin..." value={desc} onChange={e => setDesc(e.target.value)} />

            <label style={styles.label}>Visual Style</label>
            <div style={styles.pillGroup}>
              {STYLES.map(s => <div key={s} style={styles.pill(style === s)} onClick={() => setStyle(s)}>{s.replace(/_/g, ' ')}</div>)}
            </div>

            <label style={styles.label}>Aspect Ratio</label>
            <div style={styles.pillGroup}>
              {RATIOS.map(r => <div key={r} style={styles.pill(ratio === r)} onClick={() => setRatio(r)}>{r}</div>)}
            </div>

            <button style={{ ...styles.button, opacity: (loading || jobId || balance < 20) ? 0.6 : 1 }} onClick={handleGenerate} disabled={loading || jobId || balance < 20}>
              {jobId ? 'Production in Progress...' : loading ? 'Starting Job...' : '🎬 Generate Video (20 Tokens)'}
            </button>
            {balance < 20 && <p style={{color:'#EF4444', fontSize:'12px', marginTop:'8px', textAlign:'center'}}>Insufficient tokens. Need 20.</p>}
          </div>
        </div>

        <div style={styles.rightPanel}>
          {jobId || status === 'queued' || status === 'running' ? (
            <div style={styles.statusBox}>
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>⚙️</div>
              <h2 style={{ fontSize: '18px', color: '#F472B6' }}>Crafting Your Video...</h2>
              <p style={{ color: '#9CA3AF', fontSize: '14px', marginTop: '8px' }}>
                Status: <span style={{ textTransform: 'uppercase', fontWeight: 'bold', color: '#FFF' }}>{status || 'Initializing'}</span>
              </p>
              <p style={{ color: '#6B7280', fontSize: '12px', marginTop: '16px' }}>Estimated time: 2-3 minutes. You can stay on this page.</p>
            </div>
          ) : videoUrl ? (
            <div>
              <div style={styles.videoContainer}>
                <video src={proxify(videoUrl)} controls autoPlay style={{ width: '100%', display: 'block' }} />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <a href={videoUrl} download style={{ ...styles.button, textDecoration: 'none', textAlign: 'center', flex: 1 }}>Download Video</a>
                <button style={{ ...styles.button, background: '#1C1C21', border: '1px solid #2E2E36', flex: 1 }} onClick={() => setVideoUrl(null)}>Create New</button>
              </div>
            </div>
          ) : (
            <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #2E2E36', borderRadius: '16px', background: '#131317', color: '#6B7280' }}>
              Your generated video will appear here.
            </div>
          )}

          <h3 style={{ ...styles.label, marginTop: '40px' }}>Previous Generations</h3>
          <div style={styles.historyGrid}>
            {history.filter(h => h.result_urls?.length > 0).map((h, i) => (
              <div key={i} style={styles.historyCard} onClick={() => { setVideoUrl(h.result_urls[0]); setStatus('completed'); window.scrollTo(0,0); }}>
                <video src={proxify(h.result_urls[0])} style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
                <div style={{ padding: '8px', fontSize: '11px', color: '#9CA3AF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {h.prompt}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
