import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import JSZip from 'jszip'
import useAuthStore from '../store/authStore'
import { useTokenBalance } from '../hooks/useTokenBalance'
import { imagesApi } from '../api/images'
import ImageCard from '../components/ImageCard'
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
  promptSection: {
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
  textarea: {
    width: '100%',
    minHeight: '100px',
    background: '#0A0A0B',
    border: '1px solid #2E2E36',
    borderRadius: '10px',
    padding: '16px',
    color: '#F3F4F6',
    fontSize: '15px',
    fontFamily: 'inherit',
    resize: 'vertical',
    outline: 'none',
    marginBottom: '20px',
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
  resultsSection: {
    marginTop: '40px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
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

export default function ImageGenPage() {
  const navigate = useNavigate()
  const { logout } = useAuthStore()
  const { balance, isLoading: balanceLoading, refetch: refreshBalance } = useTokenBalance()
  
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState('')
  const [zipping, setZipping] = useState(false)

  const handleDownloadAll = async () => {
    if (!results || results.length === 0) return
    setZipping(true)
    try {
      const zip = new JSZip()
      await Promise.all(
        results.map(async (url, idx) => {
          const res = await fetch(url)
          const blob = await res.blob()
          zip.file(`generated-image-${idx + 1}.png`, blob)
        })
      )
      const content = await zip.generateAsync({ type: 'blob' })
      const objectUrl = URL.createObjectURL(content)
      const link = document.createElement('a')
      link.href = objectUrl
      link.download = 'generated-images.zip'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(objectUrl)
    } catch {
      setError('Failed to download images as ZIP.')
    } finally {
      setZipping(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    setLoading(true)
    setError('')
    setResults(null)

    try {
      const response = await imagesApi.generate(prompt)
      // Normalize response urls to use the backend proxy
      const rawUrls = response.data.result_urls || []
      const proxiedUrls = rawUrls.map(url => proxify(url))
      
      setResults(proxiedUrls)
      // Refetch balance after successful generation
      refreshBalance()
    } catch (err) {
      const msg = extractErrorMsg(err, 'Failed to generate images. Please try again.')
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      {/* Navbar Reused from Dashboard */}
      <nav style={styles.nav}>
        <span style={styles.navLogo} onClick={() => navigate('/')}>UGCX</span>
        <div style={styles.navRight}>
          <span style={styles.tokenBadge}>
            {balanceLoading ? '…' : (balance ?? 0)} tokens
          </span>
          <button style={styles.logoutBtn} onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </nav>

      <div style={styles.container}>
        <div style={styles.backLink} onClick={() => navigate('/')}>
          ← Back to Dashboard
        </div>

        <div style={styles.header}>
          <h1 style={styles.title}>Generate Images</h1>
          <p style={styles.subtitle}>
            Describe what you want to create. Each generation costs 10 tokens and creates 9 images.
          </p>
        </div>

        <div style={styles.promptSection}>
          <label style={styles.label}>Prompt</label>
          <textarea
            style={styles.textarea}
            placeholder="e.g. A futuristic landscape with glowing neon plants and mountains in the style of cyberpunk."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={loading}
          />
          
          {error && <div style={styles.error}>{error}</div>}

          <button
            style={{
              ...styles.generateBtn,
              opacity: loading || !prompt.trim() ? 0.6 : 1,
              cursor: loading || !prompt.trim() ? 'not-allowed' : 'pointer'
            }}
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
          >
            {loading ? 'Generating 9 images... (estimated 10s)' : 'Generate Images'}
          </button>
        </div>

        {results && (
          <div style={styles.resultsSection}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ ...styles.label, marginBottom: 0, fontSize: '18px' }}>
                Results
              </h2>
              <button
                onClick={handleDownloadAll}
                disabled={zipping}
                style={{
                  background: zipping ? '#555' : '#E8820C',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 18px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: zipping ? 'not-allowed' : 'pointer',
                  opacity: zipping ? 0.7 : 1,
                }}
              >
                {zipping ? 'Zipping...' : 'Download All (ZIP)'}
              </button>
            </div>
            <div style={styles.grid}>
              {results.map((url, idx) => (
                <ImageCard key={idx} url={url} index={idx + 1} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
