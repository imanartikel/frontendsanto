import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import { useTokenBalance } from '../hooks/useTokenBalance'
import client from '../api/client'
import { proxify } from '../utils/assets'

const S = {
  page: { minHeight: '100vh', background: '#0A0A0B', color: '#F3F4F6' },
  nav: {
    background: '#1C1C21', borderBottom: '1px solid #2E2E36', padding: '0 24px',
    height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  navLogo: { fontSize: '20px', fontWeight: '700', color: '#E8820C', cursor: 'pointer' },
  tokenBadge: {
    background: 'rgba(232,130,12,0.12)', border: '1px solid rgba(232,130,12,0.3)',
    borderRadius: '20px', padding: '4px 12px', fontSize: '13px', fontWeight: '600', color: '#E8820C',
  },
  logoutBtn: { background: 'none', border: '1px solid #2E2E36', borderRadius: '8px', padding: '6px 14px', color: '#9CA3AF', fontSize: '13px', cursor: 'pointer' },
  container: { maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' },
  twoCol: { display: 'grid', gridTemplateColumns: '360px 1fr', gap: '32px', alignItems: 'start' },
  card: { background: '#1C1C21', border: '1px solid #2E2E36', borderRadius: '16px', padding: '24px' },
  label: { fontSize: '12px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', display: 'block' },
  input: {
    width: '100%', background: '#0A0A0B', border: '1px solid #2E2E36', borderRadius: '8px',
    padding: '12px 14px', color: '#F3F4F6', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
  },
  textarea: {
    width: '100%', background: '#0A0A0B', border: '1px solid #2E2E36', borderRadius: '8px',
    padding: '12px 14px', color: '#F3F4F6', fontSize: '14px', outline: 'none', resize: 'vertical',
    minHeight: '80px', fontFamily: 'inherit', boxSizing: 'border-box',
  },
  pill: (active) => ({
    padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
    background: active ? 'rgba(232,130,12,0.15)' : '#0A0A0B',
    color: active ? '#E8820C' : '#9CA3AF',
    border: `1px solid ${active ? '#E8820C' : '#2E2E36'}`,
  }),
  generateBtn: {
    width: '100%', padding: '14px', background: '#E8820C', borderRadius: '10px',
    border: 'none', color: '#FFF', fontSize: '15px', fontWeight: '700', cursor: 'pointer', marginTop: '24px',
  },
  sceneCard: { background: '#0A0A0B', border: '1px solid #2E2E36', borderRadius: '10px', padding: '14px', marginBottom: '10px' },
  imageCard: { background: '#0A0A0B', border: '1px solid #2E2E36', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px' },
  copyBtn: { background: 'rgba(232,130,12,0.1)', color: '#E8820C', border: '1px solid rgba(232,130,12,0.3)', padding: '5px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: '600', whiteSpace: 'nowrap' },
  error: { color: '#EF4444', background: 'rgba(239,68,68,0.1)', padding: '12px', borderRadius: '8px', fontSize: '14px', border: '1px solid rgba(239,68,68,0.2)', marginTop: '16px' },
}

const SCENE_COLORS = ['#E8820C', '#8B5CF6', '#10B981', '#3B82F6', '#EF4444', '#F59E0B']
const AI_MODEL_OPTIONS = [
  { id: 'female', label: 'Model Wanita' },
  { id: 'male', label: 'Model Pria' },
  { id: 'none', label: 'No Model' },
]

export default function VideoPrompterPage() {
  const navigate = useNavigate()
  const { logout } = useAuthStore()
  const { balance, isLoading: balanceLoading, refetch } = useTokenBalance()

  const [shopeeUrl, setShopeeUrl] = useState('')
  const [angleNotes, setAngleNotes] = useState('')
  const [aiModel, setAiModel] = useState('female')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState({})

  const handleGenerate = async () => {
    if (!shopeeUrl.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const resp = await client.post('/api/v1/prompts/generate-shopee-sequence', {
        shopee_url: shopeeUrl.trim(),
        angle_notes: angleNotes.trim(),
        ai_model: aiModel,
      })
      setResult(resp.data)
      refetch()
    } catch (err) {
      setError(err.response?.data?.detail || 'Generation failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text)
    setCopied(prev => ({ ...prev, [key]: true }))
    setTimeout(() => setCopied(prev => ({ ...prev, [key]: false })), 2000)
  }

  return (
    <div style={S.page}>
      <nav style={S.nav}>
        <span style={S.navLogo} onClick={() => navigate('/')}>UGCX</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={S.tokenBadge}>{balanceLoading ? '…' : (balance ?? 0)} tokens</span>
          <button style={S.logoutBtn} onClick={() => { logout(); navigate('/login') }}>Sign out</button>
        </div>
      </nav>

      <div style={S.container}>
        <div style={{ color: '#9CA3AF', cursor: 'pointer', marginBottom: '20px', fontSize: '14px' }} onClick={() => navigate('/')}>
          ← Back to Dashboard
        </div>

        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: '700', marginBottom: '8px' }}>Frame Sequence Builder</h1>
          <p style={{ color: '#9CA3AF', fontSize: '14px' }}>Paste link produk Shopee → alur video UGC + 4 gambar siap pakai.</p>
        </div>

        <div style={S.twoCol}>
          {/* LEFT: Input Panel */}
          <div style={S.card}>
            <div style={{ marginBottom: '20px' }}>
              <label style={S.label}>Link Produk Shopee</label>
              <input
                style={S.input}
                placeholder="https://shopee.co.id/Nama-Produk-i.xxx.yyy"
                value={shopeeUrl}
                onChange={e => setShopeeUrl(e.target.value)}
                disabled={loading}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={S.label}>Angle / Catatan (opsional)</label>
              <textarea
                style={S.textarea}
                placeholder={'Contoh: close up tekstur, tampak samping, dipakai model, packaging\n(kosongkan untuk default: close up, jauh, samping, belakang)'}
                value={angleNotes}
                onChange={e => setAngleNotes(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <label style={S.label}>AI Model dalam Gambar</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {AI_MODEL_OPTIONS.map(o => (
                  <div key={o.id} style={S.pill(aiModel === o.id)} onClick={() => !loading && setAiModel(o.id)}>
                    {o.label}
                  </div>
                ))}
              </div>
            </div>

            {error && <div style={S.error}>{error}</div>}

            <button
              style={{ ...S.generateBtn, opacity: loading || !shopeeUrl.trim() ? 0.6 : 1, cursor: loading || !shopeeUrl.trim() ? 'not-allowed' : 'pointer' }}
              onClick={handleGenerate}
              disabled={loading || !shopeeUrl.trim()}
            >
              {loading ? 'Generating... (est. 20-30s)' : 'Generate Sequence (10 tokens)'}
            </button>
          </div>

          {/* RIGHT: Output Panel */}
          <div>
            {result ? (
              <>
                {/* Product Header */}
                <div style={{ ...S.card, marginBottom: '24px', borderLeft: '4px solid #E8820C' }}>
                  <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>Produk Terdeteksi</div>
                  <div style={{ fontSize: '17px', fontWeight: '700', color: '#F3F4F6' }}>{result.product_title}</div>
                  {result.product_summary && (
                    <div style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '6px', lineHeight: 1.5 }}>{result.product_summary}</div>
                  )}
                </div>

                {/* Storyline */}
                <div style={{ ...S.card, marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <span style={{ fontSize: '16px', fontWeight: '700', color: '#F3F4F6' }}>Alur Video</span>
                    <button style={S.copyBtn} onClick={() => handleCopy(
                      result.storyline.map(s => `Scene ${s.scene_number} — ${s.title} (${s.duration_seconds}s)\n${s.description}`).join('\n\n'),
                      'storyline'
                    )}>
                      {copied['storyline'] ? 'Copied!' : 'Copy Semua'}
                    </button>
                  </div>

                  {/* Timeline bar */}
                  <div style={{ display: 'flex', height: '20px', borderRadius: '10px', overflow: 'hidden', marginBottom: '20px', border: '1px solid #2E2E36' }}>
                    {result.storyline.map((scene, i) => {
                      const total = result.storyline.reduce((sum, s) => sum + s.duration_seconds, 0)
                      const pct = (scene.duration_seconds / total) * 100
                      return (
                        <div key={i} style={{ height: '100%', width: `${pct}%`, background: SCENE_COLORS[i % SCENE_COLORS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '800', color: '#fff' }}
                          title={`Scene ${scene.scene_number}: ${scene.duration_seconds}s`}>
                          {pct > 10 ? `${scene.duration_seconds}s` : ''}
                        </div>
                      )
                    })}
                  </div>

                  {result.storyline.map((scene, i) => (
                    <div key={i} style={S.sceneCard}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: SCENE_COLORS[i % SCENE_COLORS.length], display: 'inline-block', flexShrink: 0 }} />
                          <span style={{ fontSize: '13px', fontWeight: '700', color: '#F3F4F6' }}>Scene {scene.scene_number} — {scene.title}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                          <span style={{ fontSize: '11px', color: '#9CA3AF', background: '#1C1C21', padding: '3px 8px', borderRadius: '4px' }}>{scene.duration_seconds}s</span>
                          <span style={{ fontSize: '11px', color: '#9CA3AF', background: '#1C1C21', padding: '3px 8px', borderRadius: '4px' }}>{scene.camera}</span>
                        </div>
                      </div>
                      <p style={{ color: '#D1D5DB', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>{scene.description}</p>
                      <div style={{ marginTop: '6px', fontSize: '11px', color: '#6B7280' }}>Transition: {scene.transition}</div>
                    </div>
                  ))}
                </div>

                {/* 4 Generated Images */}
                <div style={S.card}>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#F3F4F6', marginBottom: '20px', paddingBottom: '8px', borderBottom: '1px solid #2E2E36' }}>
                    4 Generated Images
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    {result.image_prompts.map((img, i) => {
                      const imgUrl = result.generated_image_urls?.[i]
                      const proxifiedUrl = imgUrl ? proxify(imgUrl) : null
                      return (
                        <div key={i} style={S.imageCard}>
                          {/* Image */}
                          {proxifiedUrl ? (
                            <div style={{ position: 'relative', aspectRatio: '1/1', background: '#131317' }}>
                              <img
                                src={proxifiedUrl}
                                alt={img.angle}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                              />
                              <a
                                href={proxifiedUrl}
                                download={`${img.angle.replace(/\s+/g, '-')}.png`}
                                onClick={async (e) => {
                                  e.preventDefault()
                                  try {
                                    const res = await fetch(proxifiedUrl)
                                    const blob = await res.blob()
                                    const obj = URL.createObjectURL(blob)
                                    const a = document.createElement('a')
                                    a.href = obj
                                    a.download = `${img.angle.replace(/\s+/g, '-')}.png`
                                    a.click()
                                    URL.revokeObjectURL(obj)
                                  } catch { window.open(proxifiedUrl, '_blank') }
                                }}
                                style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '6px', padding: '4px 10px', fontSize: '12px', cursor: 'pointer', textDecoration: 'none', fontWeight: '600' }}
                              >
                                ↓
                              </a>
                            </div>
                          ) : (
                            <div style={{ aspectRatio: '1/1', background: '#131317', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <span style={{ color: '#6B7280', fontSize: '13px' }}>Gagal generate</span>
                            </div>
                          )}

                          {/* Prompt info */}
                          <div style={{ padding: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                              <div>
                                <span style={{ fontSize: '13px', fontWeight: '700', color: '#E8820C' }}>{img.angle}</span>
                                <span style={{ fontSize: '11px', color: '#6B7280', marginLeft: '8px' }}>{img.shot_type}</span>
                              </div>
                              <button style={S.copyBtn} onClick={() => handleCopy(img.prompt, `img-${i}`)}>
                                {copied[`img-${i}`] ? 'Copied!' : 'Copy'}
                              </button>
                            </div>
                            <p style={{ color: '#9CA3AF', fontSize: '12px', lineHeight: 1.5, margin: 0, fontFamily: 'monospace', wordBreak: 'break-word' }}>
                              {img.prompt.length > 120 ? img.prompt.slice(0, 120) + '…' : img.prompt}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #2E2E36', borderRadius: '16px', background: '#131317' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>🛍️</div>
                  <p style={{ color: '#6B7280', fontSize: '15px' }}>Paste link Shopee di kiri untuk mulai.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
