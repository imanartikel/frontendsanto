import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import { useTokenBalance } from '../hooks/useTokenBalance'
import { videosApi } from '../api/videos'
import { extractErrorMsg } from '../utils/errors'
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
  section: {
    background: '#1C1C21',
    border: '1px solid #2E2E36',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '40px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#F3F4F6',
    marginBottom: '12px',
  },
  modelGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '12px',
    marginBottom: '24px',
  },
  modelCard: {
    background: '#0A0A0B',
    border: '1px solid #2E2E36',
    borderRadius: '12px',
    padding: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  modelName: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#F3F4F6',
    marginBottom: '4px',
  },
  modelCost: {
    fontSize: '12px',
    color: '#E8820C',
    fontWeight: '600',
  },
  textarea: {
    width: '100%',
    minHeight: '120px',
    background: '#0A0A0B',
    border: '1px solid #2E2E36',
    borderRadius: '10px',
    padding: '16px',
    color: '#F3F4F6',
    fontSize: '15px',
    fontFamily: 'inherit',
    resize: 'vertical',
    outline: 'none',
    marginBottom: '24px',
    boxSizing: 'border-box',
  },
  generateBtn: {
    width: '100%',
    padding: '14px',
    background: '#E8820C',
    borderRadius: '10px',
    border: 'none',
    color: '#FFF',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'background 0.2s, opacity 0.2s',
  },
  statusBox: {
    marginTop: '24px',
    padding: '20px',
    borderRadius: '12px',
    background: '#0A0A0B',
    border: '1px solid #2E2E36',
    textAlign: 'center',
  },
  statusText: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#F3F4F6',
    marginBottom: '8px',
  },
  progressBar: {
    height: '6px',
    background: '#2E2E36',
    borderRadius: '3px',
    overflow: 'hidden',
    width: '200px',
    margin: '12px auto',
  },
  progressFill: {
    height: '100%',
    background: '#E8820C',
    transition: 'width 0.5s ease-in-out',
  },
  resultVideo: {
    width: '100%',
    borderRadius: '12px',
    border: '1px solid #2E2E36',
    marginTop: '24px',
    maxHeight: '500px',
    background: '#000',
  },
  error: {
    color: '#EF4444',
    background: 'rgba(239, 68, 68, 0.1)',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '20px',
    border: '1px solid rgba(239, 68, 68, 0.2)',
  },
}

const MODELS = [
  { id: 'veo', name: 'Google Veo', cost: 100, desc: 'High quality cinematic' },
  { id: 'seedance', name: 'Seedance', cost: 40, desc: 'Fast & responsive' },
  { id: 'minimax', name: 'Minimax', cost: 50, desc: 'Realistic motion' },
  { id: 'grook', name: 'Grook', cost: 40, desc: 'Stylized & fun' },
]

export default function VideoGenPage() {
  const navigate = useNavigate()
  const { logout } = useAuthStore()
  const { balance, isLoading: balanceLoading, refetch: refreshBalance } = useTokenBalance()
  
  const [model, setModel] = useState('veo')
  const [prompt, setPrompt] = useState('')
  const [jobId, setJobId] = useState(null)
  const [status, setStatus] = useState(null) // queued, running, done, failed
  const [resultUrls, setResultUrls] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Removed duplicated proxify logic - using shared utility

  const pollingRef = useRef(null)

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    setLoading(true)
    setError('')
    setStatus(null)
    setResultUrls([])
    
    try {
      const response = await videosApi.generate(prompt, model)
      const data = response.data
      setJobId(data.job_id)
      setStatus(data.status)
      refreshBalance()
    } catch (err) {
      setError(extractErrorMsg(err, 'Failed to submit job.'))
      setLoading(false)
    }
  }

  // Polling logic
  useEffect(() => {
    if (!jobId || status === 'done' || status === 'failed') {
      if (pollingRef.current) clearInterval(pollingRef.current)
      return
    }

    pollingRef.current = setInterval(async () => {
      try {
        const resp = await videosApi.status(jobId)
        const data = resp.data
        setStatus(data.status)
        if (data.status === 'done') {
          setResultUrls(data.result_urls || [])
          setLoading(false)
          clearInterval(pollingRef.current)
        } else if (data.status === 'failed') {
          setError(data.error_message || 'Video generation failed.')
          setLoading(false)
          clearInterval(pollingRef.current)
        }
      } catch (err) {
        console.error('Polling error:', err)
      }
    }, 4000)

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [jobId, status])

  const getProgressWidth = () => {
    if (status === 'queued') return '25%'
    if (status === 'running') return '60%'
    if (status === 'done') return '100%'
    return '0%'
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
          <h1 style={styles.title}>Create Video</h1>
          <p style={styles.subtitle}>Transform your text into cinematic short-form videos.</p>
        </div>

        <div style={styles.section}>
          <label style={styles.label}>Select AI Model</label>
          <div style={styles.modelGrid}>
            {MODELS.map(m => (
              <div 
                key={m.id} 
                style={{
                  ...styles.modelCard,
                  borderColor: model === m.id ? '#E8820C' : '#2E2E36',
                  background: model === m.id ? 'rgba(232,130,12,0.05)' : '#0A0A0B'
                }}
                onClick={() => !loading && setModel(m.id)}
              >
                <div style={styles.modelName}>{m.name}</div>
                <div style={styles.modelCost}>{m.cost} tokens</div>
              </div>
            ))}
          </div>

          <label style={styles.label}>Prompt</label>
          <textarea
            style={styles.textarea}
            placeholder="Describe the scene, action, and camera movement..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={loading}
          />

          {error && <div style={styles.error}>{error}</div>}

          {!loading ? (
            <button style={styles.generateBtn} onClick={handleGenerate} disabled={!prompt.trim()}>
              Generate Video
            </button>
          ) : (
            <div style={styles.statusBox}>
              <div style={styles.statusText}>
                {status === 'queued' ? 'Waiting in queue...' : 'AI is painting your video...'}
              </div>
              <div style={styles.progressBar}>
                <div style={{ ...styles.progressFill, width: getProgressWidth() }} />
              </div>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>
                This usually takes 30-60 seconds. You can stay on this page.
              </div>
            </div>
          )}

          {status === 'done' && resultUrls.length > 0 && (
            <video controls autoPlay style={styles.resultVideo}>
              <source src={proxify(resultUrls[0])} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      </div>
    </div>
  )
}
