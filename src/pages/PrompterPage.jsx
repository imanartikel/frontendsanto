import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import { useTokenBalance } from '../hooks/useTokenBalance'
import { promptsApi } from '../api/prompts'

const STYLES = {
  page: { minHeight: '100vh', background: '#0A0A0B', color: '#F3F4F6' },
  nav: {
    background: '#1C1C21', borderBottom: '1px solid #2E2E36', padding: '0 24px',
    height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  navLogo: { fontSize: '20px', fontWeight: '700', color: '#E8820C', cursor: 'pointer' },
  container: { maxWidth: '1000px', margin: '0 auto', padding: '40px 24px', display: 'flex', gap: '32px', flexWrap: 'wrap' },
  leftPanel: { flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: '24px' },
  rightPanel: { flex: '1 1 400px', display: 'flex', flexDirection: 'column' },
  card: {
    background: '#1C1C21', border: '1px solid #2E2E36', borderRadius: '16px', padding: '24px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
  },
  outputCard: {
    background: 'rgba(28,28,33,0.7)', backdropFilter: 'blur(12px)',
    border: '1px solid rgba(232,130,12,0.3)', borderRadius: '16px', padding: '24px',
    boxShadow: '0 0 40px rgba(232,130,12,0.1)', height: '100%', display: 'flex', flexDirection: 'column'
  },
  textarea: {
    width: '100%', minHeight: '120px', background: '#0A0A0B', border: '1px solid #2E2E36',
    borderRadius: '8px', padding: '16px', color: '#F3F4F6', fontSize: '15px', resize: 'vertical',
    fontFamily: 'inherit'
  },
  label: { fontSize: '13px', fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '8px', display: 'block' },
  button: {
    background: '#E8820C', border: 'none', borderRadius: '8px', padding: '14px',
    color: '#FFF', fontSize: '15px', fontWeight: '700', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'
  },
  pillGroup: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  pill: (active) => ({
    padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
    background: active ? '#E8820C' : '#0A0A0B',
    color: active ? '#FFF' : '#9CA3AF',
    border: `1px solid ${active ? '#E8820C' : '#2E2E36'}`
  }),
  select: {
    width: '100%', background: '#0A0A0B', border: '1px solid #2E2E36', borderRadius: '8px',
    padding: '12px', color: '#F3F4F6', fontSize: '14px', outline: 'none'
  },
  resultArea: {
    background: '#0A0A0B', border: '1px solid #2E2E36', borderRadius: '8px', padding: '16px',
    color: '#D1D5DB', fontSize: '15px', lineHeight: '1.6', flexGrow: 1, whiteSpace: 'pre-wrap',
    overflowY: 'auto'
  },
  copyBtn: {
    background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '6px', padding: '6px 12px',
    color: '#FFF', fontSize: '12px', cursor: 'pointer', alignSelf: 'flex-end', marginTop: '12px'
  }
}

const PRESETS = [
  { id: 'ugc_selfie', label: 'UGC Selfie' },
  { id: 'product_shot', label: 'Product Shot' },
  { id: 'lifestyle', label: 'Lifestyle' },
  { id: 'cinematic', label: 'Cinematic' },
  { id: 'flat_lay', label: 'Flat Lay' }
]

const MODELS = [
  { id: 'midjourney', label: 'Midjourney v6' },
  { id: 'flux', label: 'FLUX.1' },
  { id: 'dalle', label: 'DALL-E 3' },
  { id: 'imagen', label: 'Google Imagen 3' }
]

const RATIOS = ['1:1', '9:16', '16:9', '4:5']

export default function PrompterPage() {
  const navigate = useNavigate()
  const { logout } = useAuthStore()
  const { balance, refetch } = useTokenBalance()

  const [desc, setDesc] = useState('')
  const [style, setStyle] = useState('ugc_selfie')
  const [model, setModel] = useState('midjourney')
  const [ratio, setRatio] = useState('9:16')
  
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [copied, setCopied] = useState(false)

  const handleGenerate = async () => {
    if (!desc.trim()) return
    setLoading(true)
    setResult(null)
    setCopied(false)
    try {
      const resp = await promptsApi.generateImagePrompt({
        description: desc,
        style_preset: style,
        target_model: model,
        aspect_ratio: ratio
      })
      setResult(resp.data)
      refetch() // Update balance after mutation
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.detail || 'Failed to generate prompt.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result.prompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div style={STYLES.page}>
      <nav style={STYLES.nav}>
        <span style={STYLES.navLogo} onClick={() => navigate('/')}>UGCX</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: '#E8820C', fontWeight: '600', fontSize: '13px' }}>
            {balance ?? 0} tokens
          </span>
          <button style={{ background:'none', border:'none', color:'#9CA3AF', cursor:'pointer' }} onClick={() => { logout(); navigate('/login') }}>
            Sign out
          </button>
        </div>
      </nav>

      <div style={STYLES.container}>
        {/* Left Panel: Inputs */}
        <div style={STYLES.leftPanel}>
          <div>
            <div style={{ color: '#9CA3AF', cursor: 'pointer', marginBottom: '20px', fontSize: '14px' }} onClick={() => navigate('/')}>
              ← Back to Dashboard
            </div>
            <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Prompt Architect</h1>
            <p style={{ color: '#9CA3AF', fontSize: '15px' }}>Expand simple ideas into professional AI prompts.</p>
          </div>

          <div style={STYLES.card}>
            <label style={STYLES.label}>Describe your idea</label>
            <textarea 
              style={STYLES.textarea}
              placeholder="e.g. cewek hijab pegang skincare di dapur..."
              value={desc}
              onChange={e => setDesc(e.target.value)}
            />

            <div style={{ marginTop: '24px' }}>
              <label style={STYLES.label}>Style Preset</label>
              <div style={STYLES.pillGroup}>
                {PRESETS.map(p => (
                  <div key={p.id} style={STYLES.pill(style === p.id)} onClick={() => setStyle(p.id)}>
                    {p.label}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
              <div style={{ flex: 1 }}>
                <label style={STYLES.label}>Target Model</label>
                <select style={STYLES.select} value={model} onChange={e => setModel(e.target.value)}>
                  {MODELS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={STYLES.label}>Aspect Ratio</label>
                <select style={STYLES.select} value={ratio} onChange={e => setRatio(e.target.value)}>
                  {RATIOS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            <button 
              style={{ ...STYLES.button, marginTop: '32px', opacity: (loading || balance < 2) ? 0.5 : 1 }}
              onClick={handleGenerate}
              disabled={loading || balance < 2}
            >
              {loading ? 'Crafting Prompt...' : '✨ Generate Prompt (2 Tokens)'}
            </button>
            {balance < 2 && <p style={{color:'#EF4444', fontSize:'12px', marginTop:'8px', textAlign:'center'}}>Insufficient tokens. Please top up.</p>}
          </div>
        </div>

        {/* Right Panel: Output */}
        <div style={STYLES.rightPanel}>
          <div style={STYLES.outputCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '16px', color: '#E8820C' }}>Output Prompt</h2>
              {result && (
                <span style={{ fontSize: '12px', color: '#9CA3AF' }}>Model: {result.metadata.target_model}</span>
              )}
            </div>
            
            <div style={STYLES.resultArea}>
              {result ? result.prompt : (
                <span style={{ color: '#6B7280' }}>Your highly detailed prompt will appear here...</span>
              )}
            </div>

            {result && result.metadata.negative_prompt && (
              <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(239,68,68,0.1)', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)' }}>
                <strong style={{ display: 'block', fontSize: '12px', color: '#EF4444', marginBottom: '4px' }}>Negative Prompt:</strong>
                <span style={{ fontSize: '13px', color: '#FCA5A5' }}>{result.metadata.negative_prompt}</span>
              </div>
            )}

            {result && (
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button style={{...STYLES.copyBtn, flex: 1}} onClick={handleGenerate}>
                  🔄 Regenerate
                </button>
                <button style={{...STYLES.copyBtn, flex: 2, background: '#E8820C'}} onClick={handleCopy}>
                  {copied ? '✅ Copied!' : '📋 Copy Text'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
