import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import { useTokenBalance } from '../hooks/useTokenBalance'
import { podcastApi } from '../api/podcast'

const styles = {
  page: { minHeight: '100vh', background: '#0A0A0B', color: '#F3F4F6' },
  nav: {
    background: '#1C1C21', borderBottom: '1px solid #2E2E36', padding: '0 24px',
    height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  navLogo: { fontSize: '20px', fontWeight: '700', color: '#6366F1', cursor: 'pointer' },
  container: { maxWidth: '1200px', margin: '0 auto', padding: '40px 24px', display: 'flex', gap: '32px', flexWrap: 'wrap' },
  leftPanel: { flex: '1 1 350px', display: 'flex', flexDirection: 'column', gap: '24px' },
  rightPanel: { flex: '2 1 600px', display: 'flex', flexDirection: 'column' },
  card: { background: '#1C1C21', border: '1px solid #2E2E36', borderRadius: '16px', padding: '24px' },
  label: { fontSize: '13px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '8px', display: 'block' },
  input: {
    width: '100%', background: '#0A0A0B', border: '1px solid #2E2E36', borderRadius: '8px',
    padding: '12px', color: '#F3F4F6', fontSize: '14px', marginBottom: '16px', boxSizing: 'border-box'
  },
  textarea: {
    width: '100%', minHeight: '80px', background: '#0A0A0B', border: '1px solid #2E2E36',
    borderRadius: '8px', padding: '12px', color: '#F3F4F6', fontSize: '14px', resize: 'vertical', marginBottom: '16px'
  },
  button: {
    background: '#6366F1', border: 'none', borderRadius: '8px', padding: '14px',
    color: '#FFF', fontSize: '15px', fontWeight: '700', cursor: 'pointer', width: '100%'
  },
  pillGroup: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' },
  pill: (active) => ({
    padding: '6px 14px', borderRadius: '20px', fontSize: '13px', cursor: 'pointer',
    background: active ? 'rgba(99,102,241,0.15)' : '#0A0A0B',
    color: active ? '#818CF8' : '#9CA3AF',
    border: `1px solid ${active ? '#6366F1' : '#2E2E36'}`,
  }),
  scriptSection: (type) => {
    const colors = {
      topic_flow: '#3B82F6',
      natural_bridge: '#8B5CF6',
      product_mention: '#10B981',
      soft_cta: '#F59E0B'
    }
    return {
      background: 'rgba(28,28,33,0.6)', borderLeft: `4px solid ${colors[type] || '#2E2E36'}`,
      borderRadius: '8px', padding: '20px', marginBottom: '20px', backdropFilter: 'blur(10px)'
    }
  },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '12px' },
  sectionType: { fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: '#9CA3AF' },
  sectionDuration: { fontSize: '11px', background: '#0A0A0B', padding: '2px 8px', borderRadius: '4px', color: '#6B7280' },
  editArea: {
    width: '100%', minHeight: '100px', background: 'transparent', border: '1px dashed rgba(255,255,255,0.1)',
    borderRadius: '6px', padding: '10px', color: '#D1D5DB', fontSize: '15px', lineHeight: 1.6, resize: 'vertical'
  }
}

const TONES = ['casual_storytelling', 'educational', 'humorous', 'dramatic']
const DURATIONS = [1, 3, 5]

export default function PodcastPrompterPage() {
  const navigate = useNavigate()
  const { logout } = useAuthStore()
  const { balance, refetch } = useTokenBalance()

  const [topic, setTopic] = useState('')
  const [productName, setProductName] = useState('')
  const [productType, setProductType] = useState('')
  const [sellingPoints, setSellingPoints] = useState('')
  const [tone, setTone] = useState('casual_storytelling')
  const [duration, setDuration] = useState(3)

  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [copied, setCopied] = useState(false)

  const handleGenerate = async () => {
    if (!topic || !productName) return
    setLoading(true)
    try {
      const resp = await podcastApi.generate({
        podcast_topic: topic,
        product: {
          name: productName,
          type: productType,
          key_selling_points: sellingPoints.split(',').map(s => s.trim())
        },
        tone,
        segment_duration_minutes: duration
      })
      setResult(resp.data)
      refetch()
    } catch (err) {
      alert('Generation failed.')
    } finally {
      setLoading(false)
    }
  }

  const updateSectionText = (idx, newText) => {
    const newSections = [...result.script.sections]
    newSections[idx].text = newText
    setResult({ ...result, script: { ...result.script, sections: newSections } })
  }

  const handleCopyFull = () => {
    const fullText = result.script.sections.map(s => s.text).join('\n\n')
    navigator.clipboard.writeText(fullText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <span style={styles.navLogo} onClick={() => navigate('/')}>UGCX</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: '#818CF8', fontWeight: '600' }}>{balance ?? 0} tokens</span>
          <button style={styles.logoutBtn} onClick={() => { logout(); navigate('/login') }}>Sign out</button>
        </div>
      </nav>

      <div style={styles.container}>
        <div style={styles.leftPanel}>
          <div style={{ color: '#9CA3AF', cursor: 'pointer', marginBottom: '16px' }} onClick={() => navigate('/')}>← Dashboard</div>
          <h1 style={{ fontSize: '24px', marginBottom: '8px' }}>Podcast Affiliate Tool</h1>
          <p style={{ color: '#9CA3AF', fontSize: '14px', marginBottom: '24px' }}>Draft organic product mentions for your podcast segments.</p>

          <div style={styles.card}>
            <label style={styles.label}>Podcast Topic</label>
            <textarea style={styles.textarea} placeholder="E.g. Kebiasaan orang sukses..." value={topic} onChange={e => setTopic(e.target.value)} />
            
            <label style={styles.label}>Product Name</label>
            <input style={styles.input} placeholder="AG1 / Athletic Greens" value={productName} onChange={e => setProductName(e.target.value)} />

            <label style={styles.label}>Key Selling Points (comma separated)</label>
            <input style={styles.input} placeholder="praktis, sehat, nutrisi lengkap" value={sellingPoints} onChange={e => setSellingPoints(e.target.value)} />

            <label style={styles.label}>Tone</label>
            <div style={styles.pillGroup}>
              {TONES.map(t => <div key={t} style={styles.pill(tone === t)} onClick={() => setTone(t)}>{t.replace('_', ' ')}</div>)}
            </div>

            <label style={styles.label}>Duration (Minutes)</label>
            <div style={styles.pillGroup}>
              {DURATIONS.map(d => <div key={d} style={styles.pill(duration === d)} onClick={() => setDuration(d)}>{d}m</div>)}
            </div>

            <button style={{ ...styles.button, opacity: loading ? 0.6 : 1 }} onClick={handleGenerate} disabled={loading}>
              {loading ? 'Thinking...' : '🎙️ Generate Organic Script (2 Tokens)'}
            </button>
          </div>
        </div>

        <div style={styles.rightPanel}>
          {result ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '18px' }}>Segment Script</h2>
                <button 
                  onClick={handleCopyFull}
                  style={{ background: '#10B981', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: 'bold' }}>
                  {copied ? '✅ COPIED' : '📋 COPY FULL SCRIPT'}
                </button>
              </div>

              {result.script.sections.map((section, idx) => (
                <div key={idx} style={styles.scriptSection(section.type)}>
                  <div style={styles.sectionHeader}>
                    <span style={styles.sectionType}>{section.type.replace('_', ' ')}</span>
                    <span style={styles.sectionDuration}>⚡ {section.duration}</span>
                  </div>
                  <textarea 
                    style={styles.editArea} 
                    value={section.text} 
                    onChange={(e) => updateSectionText(idx, e.target.value)} 
                  />
                  <div style={{ marginTop: '12px', fontSize: '12px', color: '#6B7280', fontStyle: 'italic' }}>
                    💡 Tip: {section.notes}
                  </div>
                </div>
              ))}

              <div style={{ marginTop: '24px' }}>
                <h3 style={styles.label}>Alternative Bridges</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {result.alternative_bridges.map((b, i) => (
                    <div key={i} style={{ background: '#1C1C21', padding: '12px', borderRadius: '8px', fontSize: '13px', color: '#9CA3AF', border: '1px solid #2E2E36' }}>
                      🔗 {b}
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #2E2E36', borderRadius: '16px', background: '#131317', color: '#6B7280' }}>
              Fill out the form on the left to generate your native script segments.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
