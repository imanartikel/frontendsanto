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
  container: { maxWidth: '1200px', margin: '0 auto', padding: '40px 24px', display: 'flex', gap: '32px', flexWrap: 'wrap' },
  leftPanel: { flex: '1 1 350px', display: 'flex', flexDirection: 'column', gap: '24px' },
  rightPanel: { flex: '2 1 600px', display: 'flex', flexDirection: 'column' },
  card: { background: '#1C1C21', border: '1px solid #2E2E36', borderRadius: '16px', padding: '24px' },
  textarea: {
    width: '100%', minHeight: '100px', background: '#0A0A0B', border: '1px solid #2E2E36',
    borderRadius: '8px', padding: '16px', color: '#F3F4F6', fontSize: '14px', resize: 'vertical',
    fontFamily: 'inherit'
  },
  label: { fontSize: '13px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '8px', display: 'block' },
  pillGroup: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  pill: (active) => ({
    padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
    background: active ? 'rgba(232,130,12,0.15)' : '#0A0A0B',
    color: active ? '#E8820C' : '#9CA3AF',
    border: `1px solid ${active ? '#E8820C' : '#2E2E36'}`,
    transition: 'all 0.2s'
  }),
  button: {
    background: '#E8820C', border: 'none', borderRadius: '8px', padding: '14px',
    color: '#FFF', fontSize: '15px', fontWeight: '700', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%'
  },
  timelineBar: { display: 'flex', height: '24px', borderRadius: '12px', overflow: 'hidden', marginBottom: '24px', border: '1px solid #2E2E36', background: '#0A0A0B' },
  timelineSegment: (color, width) => ({
    height: '100%', width: `${width}%`, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '11px', fontWeight: '800', color: '#FFF', textShadow: '0 1px 2px rgba(0,0,0,0.5)', cursor: 'pointer'
  }),
  frameCard: { background: 'rgba(28,28,33,0.6)', border: '1px solid #2E2E36', borderRadius: '12px', padding: '16px', marginBottom: '16px', backdropFilter: 'blur(10px)' },
  frameHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' },
  frameTitle: { fontSize: '14px', fontWeight: '700', color: '#F3F4F6', textTransform: 'uppercase' },
  frameMeta: { fontSize: '12px', color: '#9CA3AF', background: '#0A0A0B', padding: '4px 8px', borderRadius: '4px' },
  editArea: {
    width: '100%', minHeight: '80px', background: '#0A0A0B', border: '1px solid #2E2E36',
    borderRadius: '8px', padding: '12px', color: '#D1D5DB', fontSize: '14px', resize: 'vertical'
  }
}

const DURATIONS = [10, 15, 30, 60]
const STYLES_OPT = [
  { id: 'ugc_testimonial', label: 'Testimonial' },
  { id: 'product_demo', label: 'Product Demo' },
  { id: 'unboxing', label: 'Unboxing' },
  { id: 'tutorial', label: 'Tutorial' }
]
const MODELS = ['kling', 'runway', 'pika', 'vidu']
const RATIOS = ['9:16', '16:9', '1:1']

// A minimal color palette for timeline segments
const COLORS = ['#E8820C', '#8B5CF6', '#10B981', '#3B82F6', '#EF4444', '#F59E0B', '#14B8A6', '#6366F1']

export default function VideoPrompterPage() {
  const navigate = useNavigate()
  const { logout } = useAuthStore()
  const { balance, refetch } = useTokenBalance()

  const [concept, setConcept] = useState('')
  const [duration, setDuration] = useState(15)
  const [styleMode, setStyleMode] = useState('ugc_testimonial')
  const [model, setModel] = useState('kling')
  const [ratio, setRatio] = useState('9:16')
  
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [copied, setCopied] = useState(false)

  const handleGenerate = async () => {
    if (!concept.trim()) return
    setLoading(true)
    try {
      const resp = await promptsApi.generateVideoPrompt({
        concept, duration_target: duration, style: styleMode,
        target_model: model, aspect_ratio: ratio
      })
      setResult(resp.data)
      refetch()
    } catch (err) {
      alert(err.response?.data?.detail || 'Generation failed.')
    } finally {
      setLoading(false)
    }
  }

  // Handle inline edits locally
  const updateFramePrompt = (index, newText) => {
    if (!result) return
    const newFrames = [...result.frames]
    newFrames[index].prompt = newText
    setResult({ ...result, frames: newFrames })
  }

  const handleCopyAll = () => {
    if (!result) return
    const jsonStr = JSON.stringify(result.frames, null, 2)
    navigator.clipboard.writeText(jsonStr)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
        {/* LEFT PANEL: Inputs */}
        <div style={STYLES.leftPanel}>
          <div>
            <div style={{ color: '#9CA3AF', cursor: 'pointer', marginBottom: '16px', fontSize: '14px' }} onClick={() => navigate('/')}>
              ← Back to Dashboard
            </div>
            <h1 style={{ fontSize: '24px', marginBottom: '8px' }}>Frame Sequence Builder</h1>
            <p style={{ color: '#9CA3AF', fontSize: '14px' }}>Break down video concepts into structured clip prompts.</p>
          </div>

          <div style={STYLES.card}>
            <label style={STYLES.label}>Video Concept</label>
            <textarea 
              style={STYLES.textarea}
              placeholder="e.g. unboxing paket, kaget liat isi, zoom texture serum..."
              value={concept}
              onChange={e => setConcept(e.target.value)}
            />

            <div style={{ marginTop: '20px' }}>
              <label style={STYLES.label}>Target Duration (Secs)</label>
              <div style={STYLES.pillGroup}>
                {DURATIONS.map(d => (
                  <div key={d} style={STYLES.pill(duration === d)} onClick={() => setDuration(d)}>{d}s</div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: '20px' }}>
              <label style={STYLES.label}>Video Style</label>
              <div style={STYLES.pillGroup}>
                {STYLES_OPT.map(s => (
                  <div key={s.id} style={STYLES.pill(styleMode === s.id)} onClick={() => setStyleMode(s.id)}>{s.label}</div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <div style={{ flex: 1 }}>
                <label style={STYLES.label}>Model</label>
                <select style={{...STYLES.textarea, minHeight: 'auto', padding: '10px'}} value={model} onChange={e => setModel(e.target.value)}>
                  {MODELS.map(m => <option key={m} value={m}>{m.toUpperCase()}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={STYLES.label}>Ratio</label>
                <select style={{...STYLES.textarea, minHeight: 'auto', padding: '10px'}} value={ratio} onChange={e => setRatio(e.target.value)}>
                  {RATIOS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            <button 
              style={{ ...STYLES.button, marginTop: '32px', opacity: (loading || balance < 4) ? 0.5 : 1 }}
              onClick={handleGenerate} disabled={loading || balance < 4}
            >
              {loading ? 'Structuring Sequences...' : '🎬 Build Timeline (4 Tokens)'}
            </button>
            {balance < 4 && <p style={{color:'#EF4444', fontSize:'12px', marginTop:'8px', textAlign:'center'}}>Insufficient tokens. Need 4.</p>}
          </div>
        </div>

        {/* RIGHT PANEL: Output Timeline */}
        <div style={STYLES.rightPanel}>
          {result ? (
            <>
              {/* Visual Timeline Bar */}
              <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={STYLES.label}>Timeline Overview ({result.total_duration}s)</label>
                <button onClick={handleCopyAll} style={{ background: 'rgba(232,130,12,0.1)', color: '#E8820C', border: '1px solid rgba(232,130,12,0.3)', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}>
                  {copied ? '✅ COPIED JSON' : '📋 COPY ALL AS JSON'}
                </button>
              </div>
              
              <div title="Visual pacing representation" style={STYLES.timelineBar}>
                {result.frames.map((f, i) => {
                  const widthPct = (f.duration_seconds / result.total_duration) * 100
                  const color = COLORS[i % COLORS.length]
                  return (
                    <div key={i} style={STYLES.timelineSegment(color, widthPct)} title={`Frame ${f.frame_number}: ${f.duration_seconds}s`}>
                      {widthPct > 10 ? `${f.duration_seconds}s` : ''}
                    </div>
                  )
                })}
              </div>

              {/* Frame Cards List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {result.frames.map((frame, index) => (
                  <div key={index} style={STYLES.frameCard}>
                    <div style={STYLES.frameHeader}>
                      <span style={STYLES.frameTitle}>
                        <span style={{ color: COLORS[index % COLORS.length], marginRight: '8px' }}>■</span>
                        Frame {frame.frame_number} • {frame.type}
                      </span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <span style={STYLES.frameMeta}>⏱ {frame.duration_seconds}s</span>
                        <span style={STYLES.frameMeta}>🎥 {frame.camera}</span>
                      </div>
                    </div>
                    
                    <textarea 
                      style={STYLES.editArea}
                      value={frame.prompt}
                      onChange={(e) => updateFramePrompt(index, e.target.value)}
                    />
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                      <span style={{ fontSize: '11px', color: '#6B7280' }}>Transition: {frame.transition.toUpperCase()}</span>
                      <button 
                        onClick={() => navigator.clipboard.writeText(frame.prompt)}
                        style={{ background: 'transparent', border: 'none', color: '#9CA3AF', fontSize: '12px', cursor: 'pointer' }}>
                        Copy Prompt
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #2E2E36', borderRadius: '16px', background: '#131317' }}>
              <p style={{ color: '#6B7280', fontSize: '15px' }}>Configure your concept on the left to build the timeline sequence.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
