import { useState, useEffect, useRef, useCallback, type ReactNode, type FormEvent } from 'react'
import emailjs from '@emailjs/browser'
import profileImg from '@/imports/a0f956c7fd48ca23875d998a25f0b9a3.jpg'
import { BUILT_IN_PROJECTS, BUILT_IN_IDS, type Project } from '@/data/projects'

// ── Admin credentials (change these in the codebase) ─────────────────────────
const ADMIN_EMAIL    = 'amanthanirmal2002@gmail.com'
const ADMIN_PASSWORD = 'Admin@2026'

// ── Project persistence ───────────────────────────────────────────────────────
const PROJECTS_KEY = 'amantha_projects'

function initProjectList(): Project[] {
  try {
    const saved = localStorage.getItem(PROJECTS_KEY)
    if (saved) return JSON.parse(saved) as Project[]
  } catch {}
  return [...BUILT_IN_PROJECTS]
}

function persistProjects(list: Project[]) {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(list))
}

function readRawBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload  = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function readFileAsBase64(file: File, maxPx = 2400, quality = 0.88): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = () => {
      const img = new Image()
      img.onerror = reject
      img.onload = () => {
        let { width, height } = img
        if (width > maxPx || height > maxPx) {
          if (width > height) { height = Math.round(height * maxPx / width); width = maxPx }
          else                { width  = Math.round(width  * maxPx / height); height = maxPx }
        }
        const canvas = document.createElement('canvas')
        canvas.width = width; canvas.height = height
        canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
}

const EMAILJS_SERVICE_ID  = 'service_1kfu5gh'
const EMAILJS_TEMPLATE_ID = 'template_0onb4js'
const EMAILJS_PUBLIC_KEY  = 'nWDiJ3YL4zwzXp-gZ'

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  bg: '#070a10',
  surface: '#0c111d',
  card: '#111827',
  accent: '#00c8ff',
  text: '#e8edf5',
  muted: '#8892a4',
  border: 'rgba(255,255,255,0.06)',
  borderAccent: 'rgba(0,200,255,0.22)',
}

// ── Data ──────────────────────────────────────────────────────────────────────

const services = [
  { icon: '◈', title: 'UI/UX Design',     desc: 'User-centered digital experiences from initial concepts to polished interfaces.' },
  { icon: '⬡', title: 'Website Design',   desc: 'Modern, responsive websites focused on usability, aesthetics and conversion.' },
  { icon: '▭', title: 'Mobile App Design', desc: 'Intuitive mobile experiences with clear navigation and scalable components.' },
  { icon: '◇', title: 'Prototyping',       desc: 'Interactive high-fidelity prototypes for testing ideas and communicating product behavior.' },
  { icon: '⬢', title: 'Design Systems',    desc: 'Reusable components, tokens, libraries and scalable design foundations.' },
  { icon: '◉', title: 'Usability Testing', desc: 'Testing interfaces to identify friction points and improve user experience.' },
  { icon: '▷', title: 'Video Editing',     desc: 'Short-form and digital video content with strong visual storytelling.' },
]

const skillGroups = [
  {
    name: 'UI/UX',
    skills: ['Wireframing', 'User Research', 'UI Design', 'Prototyping', 'Figma Tokens', 'Figma Libraries', 'Figma Components', 'UI Testing', 'Usability Testing', 'User Experience'],
  },
  {
    name: 'Tools',
    skills: ['Figma', 'FigJam', 'Adobe Suite', 'Canva', 'CapCut', 'Claude', 'Google Stitch', 'Gemini AI'],
  },
  {
    name: 'Development',
    skills: ['HTML5', 'CSS3', 'React', 'Next.js', 'Flutter', 'MySQL'],
  },
  {
    name: 'Soft Skills',
    skills: ['Communication', 'Problem Solving', 'Creative Thinking', 'Adaptability', 'Open to Feedback'],
  },
]

export interface TimelineEntry {
  period: string
  role: string
  org: string
  type: 'work' | 'edu'
  points: string[]
}

const TIMELINE_KEY = 'amantha_timeline'
const HERO_IMG_KEY = 'amantha_hero_img'

const DEFAULT_TIMELINE: TimelineEntry[] = [
  {
    period: 'Dec 2025 — Apr 2026',
    role: 'Associate UI/UX Designer',
    org: 'UEXPLUS',
    type: 'work',
    points: ['Sole in-house designer', 'Developer collaboration & handoff', 'End-to-end product design', 'Iteration on stakeholder feedback'],
  },
  {
    period: '2025',
    role: 'Intern UI/UX Designer',
    org: 'UEXPLUS',
    type: 'work',
    points: ['Wireframes & user flows', 'High-fidelity prototypes', 'User research & competitor analysis', 'Responsive UI design'],
  },
  {
    period: '2026',
    role: 'BSc (Hons.) Information Technology',
    org: 'General Sir John Kotelawela Defence University',
    type: 'edu',
    points: ['Software Engineering · UI/UX · Quality Assurance', 'Cybersecurity · Networking', 'Ecole Internationale, Kandy (school)'],
  },
]

function initTimeline(): TimelineEntry[] {
  try {
    const raw = localStorage.getItem(TIMELINE_KEY)
    if (raw) return JSON.parse(raw) as TimelineEntry[]
  } catch { /* ignore */ }
  return DEFAULT_TIMELINE
}
function persistTimeline(list: TimelineEntry[]) { localStorage.setItem(TIMELINE_KEY, JSON.stringify(list)) }

function initHeroImg(): string | null {
  try { return localStorage.getItem(HERO_IMG_KEY) } catch { return null }
}
function persistHeroImg(url: string | null) {
  if (url) localStorage.setItem(HERO_IMG_KEY, url)
  else localStorage.removeItem(HERO_IMG_KEY)
}

const CV_KEY      = 'amantha_cv_data'
const CV_NAME_KEY = 'amantha_cv_name'

interface CvData { base64: string; filename: string }

function initCv(): CvData | null {
  try {
    const base64 = localStorage.getItem(CV_KEY)
    const filename = localStorage.getItem(CV_NAME_KEY) || 'Amantha_Nirmal_CV.pdf'
    if (base64) return { base64, filename }
  } catch { /* ignore */ }
  return null
}
function persistCv(cv: CvData | null) {
  if (cv) { localStorage.setItem(CV_KEY, cv.base64); localStorage.setItem(CV_NAME_KEY, cv.filename) }
  else { localStorage.removeItem(CV_KEY); localStorage.removeItem(CV_NAME_KEY) }
}
function downloadCv(cv: CvData) {
  const link = document.createElement('a')
  link.href = cv.base64
  link.download = cv.filename
  link.click()
}

export interface BeyondCard { label: string; image: string }

const BEYOND_KEY = 'amantha_beyond'

const DEFAULT_BEYOND: BeyondCard[] = [
  { label: 'Video Editing',      image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=600&h=400&fit=crop&auto=format' },
  { label: 'UI Recreation',      image: 'https://images.unsplash.com/photo-1545670723-196ed0954986?w=600&h=400&fit=crop&auto=format' },
  { label: 'Motion Study',       image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=400&fit=crop&auto=format' },
  { label: 'Visual Experiment',  image: 'https://images.unsplash.com/photo-1601412436009-d964bd02edbc?w=600&h=400&fit=crop&auto=format' },
  { label: 'AI Creative',        image: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=600&h=400&fit=crop&auto=format' },
  { label: '3D Exploration',     image: 'https://images.unsplash.com/photo-1614854262318-831574f15f1f?w=600&h=400&fit=crop&auto=format' },
]

function initBeyond(): BeyondCard[] {
  try {
    const raw = localStorage.getItem(BEYOND_KEY)
    if (raw) return JSON.parse(raw) as BeyondCard[]
  } catch { /* ignore */ }
  return DEFAULT_BEYOND
}

function persistBeyond(list: BeyondCard[]) {
  localStorage.setItem(BEYOND_KEY, JSON.stringify(list))
}

// ── Modal keyframes (shared) ───────────────────────────────────────────────────

const MODAL_STYLES = `
  @keyframes fadeInLightbox {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes slideUpLightbox {
    from { opacity: 0; transform: translateY(24px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
`

function CloseBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'fixed', top: '20px', right: '24px',
        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
        color: '#e8edf5', borderRadius: '50%', width: '44px', height: '44px',
        fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.2s ease', zIndex: 1001, lineHeight: 1,
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,200,255,0.15)'; e.currentTarget.style.borderColor = 'rgba(0,200,255,0.4)'; e.currentTarget.style.color = '#00c8ff' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#e8edf5' }}
    >
      ✕
    </button>
  )
}

// ── Lightbox ──────────────────────────────────────────────────────────────────

function Lightbox({ project, onClose }: { project: Project; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [onClose])

  const imgs = project.images ?? []

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(7,10,16,0.95)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', animation: 'fadeInLightbox 0.25s ease' }}>
      <style>{MODAL_STYLES}</style>
      <CloseBtn onClick={onClose} />

      <div onClick={e => e.stopPropagation()} style={{ background: '#0c111d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', overflow: 'hidden', width: '100%', maxWidth: '900px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', animation: 'slideUpLightbox 0.3s ease', boxShadow: '0 40px 120px rgba(0,0,0,0.8), 0 0 0 1px rgba(0,200,255,0.08)' }}>

        {/* Images — always scroll through uploaded images */}
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', scrollbarWidth: 'thin', scrollbarColor: 'rgba(0,200,255,0.2) transparent' }}>
          {imgs.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {imgs.map((img, i) => (
                <img key={i} src={img} alt={`${project.title} — image ${i + 1}`} style={{ width: '100%', display: 'block', background: '#070a10', borderBottom: i < imgs.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }} />
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px', color: '#4b5563', fontFamily: "'JetBrains Mono',monospace", fontSize: '12px', letterSpacing: '0.1em' }}>
              NO IMAGES UPLOADED
            </div>
          )}
        </div>

        {/* Info bar */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', flexShrink: 0 }}>
          <div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', color: '#00c8ff', marginBottom: '2px' }}>{project.category}</div>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '18px', fontWeight: 800, color: '#e8edf5', letterSpacing: '-0.02em' }}>{project.title}</h3>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
            {project.tags.map((t, i) => (
              <span key={i} style={{ fontSize: '11px', fontWeight: 600, color: '#8892a4', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', padding: '3px 9px' }}>{t}</span>
            ))}
            <a href={project.link || 'https://www.behance.net/amanthanirmal'} target="_blank" rel="noopener noreferrer" className="btn-neon" style={{ fontSize: '12px', padding: '6px 16px' }}>
              View on Behance ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Add Project Modal ──────────────────────────────────────────────────────────

function AddProjectModal({ onAdd, onClose }: { onAdd: (p: Project) => void; onClose: () => void }) {
  const [title, setTitle]       = useState('')
  const [category, setCategory] = useState('')
  const [desc, setDesc]         = useState('')
  const [tagsRaw, setTagsRaw]   = useState('')
  const [link, setLink]         = useState('')
  const [iframeSrc, setIframeSrc] = useState('')
  const [images, setImages]     = useState<{ url: string; name: string }[]>([])
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [onClose])

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploading(true)
    const newImgs = await Promise.all(files.map(async f => ({ url: await readFileAsBase64(f), name: f.name })))
    setImages(prev => [...prev, ...newImgs])
    setUploading(false)
    e.target.value = ''
  }

  const removeImage = (i: number) => {
    setImages(prev => prev.filter((_, idx) => idx !== i))
  }

  const moveImage = (from: number, to: number) => {
    setImages(prev => {
      const arr = [...prev]
      const [item] = arr.splice(from, 1)
      arr.splice(to, 0, item)
      return arr
    })
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const fallback = 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=900&h=600&fit=crop&auto=format'
    onAdd({
      id: Date.now(),
      title,
      category,
      desc,
      tags: tagsRaw.split(',').map(t => t.trim()).filter(Boolean),
      images: images.length > 0 ? images.map(i => i.url) : [fallback],
      wide: false,
      iframeSrc: iframeSrc || undefined,
      link: link || undefined,
    })
    onClose()
  }

  const Label = ({ text, sub }: { text: string; sub?: string }) => (
    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', color: '#8892a4', marginBottom: '8px', fontFamily: "'JetBrains Mono', monospace" }}>
      {text}{sub && <span style={{ fontWeight: 400, opacity: 0.55, marginLeft: '6px' }}>{sub}</span>}
    </label>
  )

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(7,10,16,0.94)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', animation: 'fadeInLightbox 0.25s ease', overflowY: 'auto' }}>
      <style>{MODAL_STYLES}</style>
      <CloseBtn onClick={onClose} />

      <div onClick={e => e.stopPropagation()} style={{ background: '#0c111d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', overflow: 'hidden', width: '100%', maxWidth: '740px', animation: 'slideUpLightbox 0.3s ease', boxShadow: '0 40px 120px rgba(0,0,0,0.8), 0 0 0 1px rgba(0,200,255,0.08)' }}>

        {/* Header */}
        <div style={{ padding: '24px 28px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'rgba(0,200,255,0.1)', border: '1px solid rgba(0,200,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: '#00c8ff', flexShrink: 0 }}>+</div>
          <div>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '20px', fontWeight: 800, color: '#e8edf5', letterSpacing: '-0.02em' }}>Add New Project</h2>
            <p style={{ fontSize: '13px', color: '#8892a4', marginTop: '2px' }}>Upload images from your computer and fill in the project details.</p>
          </div>
        </div>

        {/* Scrollable form body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '18px', maxHeight: 'calc(90vh - 160px)', overflowY: 'auto' }}>

          {/* Title + Category */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <Label text="TITLE *" />
              <input className="form-field" placeholder="e.g. CRABIGO" value={title} onChange={e => setTitle(e.target.value)} required />
            </div>
            <div>
              <Label text="CATEGORY *" />
              <input className="form-field" placeholder="e.g. Booking Platform" value={category} onChange={e => setCategory(e.target.value)} required />
            </div>
          </div>

          {/* Description */}
          <div>
            <Label text="DESCRIPTION" />
            <textarea className="form-field" placeholder="Short description of the project..." rows={3} value={desc} onChange={e => setDesc(e.target.value)} />
          </div>

          {/* Keywords */}
          <div>
            <Label text="KEYWORDS" sub="(comma-separated)" />
            <input className="form-field" placeholder="UI/UX, Figma, Responsive, Prototyping" value={tagsRaw} onChange={e => setTagsRaw(e.target.value)} />
          </div>

          {/* Link */}
          <div>
            <Label text="PROJECT LINK" sub="(Behance, Figma, website, etc.)" />
            <input className="form-field" placeholder="https://www.behance.net/..." value={link} onChange={e => setLink(e.target.value)} />
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em', color: '#374151' }}>IMAGES</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
          </div>

          {/* Image upload */}
          <div>
            <Label text="UPLOAD IMAGES" sub="(click thumbnails to reorder, × to remove)" />
            <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleFiles} style={{ display: 'none' }} />

            {/* Drop zone */}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              style={{ width: '100%', padding: '24px', border: '1.5px dashed rgba(0,200,255,0.25)', borderRadius: '12px', background: 'rgba(0,200,255,0.03)', color: '#8892a4', fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', fontFamily: "'Inter', sans-serif" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,200,255,0.5)'; e.currentTarget.style.background = 'rgba(0,200,255,0.06)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,200,255,0.25)'; e.currentTarget.style.background = 'rgba(0,200,255,0.03)' }}
            >
              <span style={{ fontSize: '28px', color: '#00c8ff', opacity: 0.7 }}>{uploading ? '…' : '↑'}</span>
              <span style={{ fontWeight: 600, color: '#e8edf5' }}>{uploading ? 'Processing images…' : 'Click to upload images'}</span>
              <span style={{ fontSize: '12px' }}>PNG, JPG, WEBP — multiple files supported</span>
            </button>

            {/* Thumbnail grid */}
            {images.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px', marginTop: '12px' }}>
                {images.map((img, i) => (
                  <div key={i} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: `2px solid ${i === 0 ? '#00c8ff' : 'rgba(255,255,255,0.08)'}`, aspectRatio: '1', background: '#070a10' }}>
                    <img src={img.url} alt={img.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {/* Cover badge */}
                    {i === 0 && (
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,200,255,0.85)', padding: '3px 0', textAlign: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', color: '#070a10' }}>COVER</div>
                    )}
                    {/* Controls */}
                    <div style={{ position: 'absolute', top: '4px', right: '4px', display: 'flex', gap: '3px' }}>
                      {i > 0 && (
                        <button type="button" onClick={() => moveImage(i, i - 1)} title="Move left" style={{ width: 20, height: 20, borderRadius: '4px', background: 'rgba(7,10,16,0.85)', border: '1px solid rgba(255,255,255,0.15)', color: '#e8edf5', fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>‹</button>
                      )}
                      <button type="button" onClick={() => removeImage(i)} title="Remove" style={{ width: 20, height: 20, borderRadius: '4px', background: 'rgba(239,68,68,0.85)', border: 'none', color: '#fff', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>×</button>
                    </div>
                  </div>
                ))}
                {/* Add more */}
                <button type="button" onClick={() => fileRef.current?.click()} style={{ aspectRatio: '1', borderRadius: '8px', border: '1.5px dashed rgba(255,255,255,0.1)', background: 'transparent', color: '#374151', fontSize: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease' }} onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,200,255,0.3)'; e.currentTarget.style.color = '#00c8ff' }} onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#374151' }}>+</button>
              </div>
            )}
          </div>

          {/* Optional iframe */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em', color: '#374151' }}>OPTIONAL EMBED</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
            </div>
            <Label text="IFRAME / EMBED URL" sub="(overrides images in lightbox)" />
            <input className="form-field" placeholder="https://www.figma.com/proto/..." value={iframeSrc} onChange={e => setIframeSrc(e.target.value)} style={{ borderColor: iframeSrc ? 'rgba(0,200,255,0.35)' : undefined }} />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <button type="button" onClick={onClose} className="btn-outline" style={{ fontSize: '14px', padding: '10px 24px' }}>Cancel</button>
            <button type="submit" className="btn-neon" style={{ fontSize: '14px', padding: '10px 24px' }}>Add Project</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Reveal component ──────────────────────────────────────────────────────────

function Reveal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add('is-visible'); obs.unobserve(el) } },
      { threshold: 0.08 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return (
    <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}s` }}>
      {children}
    </div>
  )
}

// ── Nav ───────────────────────────────────────────────────────────────────────

function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('home')

  useEffect(() => {
    const onScroll = () => { setScrolled(window.scrollY > 50) }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = ['Home', 'About', 'Work', 'Services', 'Skills', 'Contact']

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
      transition: 'all 0.35s ease',
      background: scrolled ? 'rgba(7,10,16,0.88)' : 'transparent',
      backdropFilter: scrolled ? 'blur(24px) saturate(1.4)' : 'none',
      WebkitBackdropFilter: scrolled ? 'blur(24px) saturate(1.4)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : '1px solid transparent',
    }}>
      <div className="section-inner">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '68px' }}>
          {/* Logo */}
          <a href="#home" style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '17px', letterSpacing: '-0.02em', color: C.text, textDecoration: 'none' }}>
            AMANTHA <span style={{ color: C.accent }}>NIRMAL</span>
          </a>

          {/* Desktop links */}
          <div style={{ display: 'flex', gap: '28px', alignItems: 'center' }} className="hidden md:flex">
            {links.map(l => (
              <a
                key={l}
                href={`#${l.toLowerCase()}`}
                onClick={() => setActive(l.toLowerCase())}
                style={{
                  color: active === l.toLowerCase() ? C.accent : C.muted,
                  textDecoration: 'none', fontSize: '14px', fontWeight: 500, letterSpacing: '0.01em',
                  transition: 'color 0.2s ease', position: 'relative',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = C.accent)}
                onMouseLeave={e => (e.currentTarget.style.color = active === l.toLowerCase() ? C.accent : C.muted)}
              >
                {l}
              </a>
            ))}
          </div>

          <a href="#contact" className="btn-neon hidden md:inline-flex" style={{ fontSize: '13px', padding: '9px 20px' }}>
            Let's Talk
          </a>

        </div>
      </div>
    </nav>
  )
}

// ── Hero ──────────────────────────────────────────────────────────────────────

function HeroSection({ heroImg: heroImgOverride }: { heroImg?: string | null }) {
  const [mouse, setMouse] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setMouse({ x: e.clientX / window.innerWidth - 0.5, y: e.clientY / window.innerHeight - 0.5 })
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <section id="home" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', paddingTop: '80px', position: 'relative', overflow: 'hidden' }}>
      {/* Grid background */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(0,200,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,200,255,0.025) 1px, transparent 1px)',
        backgroundSize: '64px 64px',
      }} />

      {/* Ambient blobs */}
      <div style={{ position: 'absolute', top: '15%', right: '8%', width: '640px', height: '640px', background: 'radial-gradient(circle, rgba(0,200,255,0.055) 0%, transparent 65%)', borderRadius: '50%', zIndex: 0, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '15%', left: '-5%', width: '480px', height: '480px', background: 'radial-gradient(circle, rgba(59,130,246,0.04) 0%, transparent 65%)', borderRadius: '50%', zIndex: 0, pointerEvents: 'none' }} />

      <div className="section-inner" style={{ position: 'relative', zIndex: 1, width: '100%' }}>
        <div style={{ display: 'grid', gap: '48px', alignItems: 'center' }} className="grid grid-cols-1 lg:grid-cols-[1fr_380px]">
          {/* Left */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px', flexWrap: 'wrap' }}>
              {/* Role pill */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '6px 16px', border: `1px solid ${C.borderAccent}`, borderRadius: '100px', background: 'rgba(0,200,255,0.05)' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.accent, display: 'block', boxShadow: `0 0 8px ${C.accent}` }} />
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', fontWeight: 600, letterSpacing: '0.14em', color: C.accent }}>UI/UX DESIGNER</span>
              </div>
              {/* Available badge */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', border: '1px solid rgba(34,197,94,0.35)', borderRadius: '100px', background: 'rgba(34,197,94,0.07)' }}>
                <span className="animate-blink" style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'block', boxShadow: '0 0 8px #22c55e' }} />
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em', color: '#22c55e' }}>AVAILABLE FOR HIRE</span>
              </div>
            </div>

            <h1 style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 'clamp(38px, 6.5vw, 84px)',
              fontWeight: 900, lineHeight: 1.03, letterSpacing: '-0.035em',
              color: C.text, marginBottom: '24px',
            }}>
              Designing<br />
              Digital{' '}
              <span style={{ color: C.accent, textShadow: '0 0 32px rgba(0,200,255,0.35)' }}>Experiences</span><br />
              That Feel Right.
            </h1>

            <p style={{ fontSize: '17px', lineHeight: 1.75, color: C.muted, maxWidth: '480px', marginBottom: '40px', fontWeight: 400 }}>
              I design thoughtful digital experiences with a strong focus on usability,
              visual hierarchy, and modern interfaces.
            </p>

            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <a href="#work" className="btn-neon">View My Work <span style={{ fontSize: 18 }}>→</span></a>
              <a href="#contact" className="btn-outline">Let's Connect</a>
              <a
                href="http://www.linkedin.com/in/amantha-nirmal-45676a224"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline"
                style={{ fontSize: '15px' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                LinkedIn
              </a>
              <a
                href="https://www.behance.net/amanthanirmal"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline"
                style={{ fontSize: '15px' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}><path d="M22 7h-7V5h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14H15.97c.13 1.2.836 1.884 2.102 1.884.945 0 1.554-.372 1.754-1.023l2.9.168zM15.973 12.6h4.268c-.052-1.19-.727-1.948-2.075-1.948-1.26 0-2.042.696-2.193 1.948zM8.516 13.961c.33.578.498 1.258.498 2.02 0 2.702-2.01 4.022-4.764 4.022H0V4.001h3.936c2.55 0 4.658 1.027 4.658 3.578 0 1.297-.622 2.166-1.407 2.706 1.083.456 1.77 1.373 1.329 3.676zm-5.047-6.56H2.99v2.867h.697c1.166 0 1.966-.372 1.966-1.41 0-1.056-.765-1.457-2.184-1.457zm.424 5.024H2.99v3.131h1.03c1.302 0 2.117-.456 2.117-1.554 0-1.063-.777-1.577-2.244-1.577z"/></svg>
                Behance
              </a>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: '0', marginTop: '56px', paddingTop: '40px', borderTop: `1px solid ${C.border}` }}>
              {[
                { val: '5+', label: 'Featured Projects' },
                { val: '1+', label: 'Year Experience' },
                { val: '2026', label: 'IT Graduate' },
                { val: 'UI+Code', label: 'Design & Dev' },
              ].map((s, i) => (
                <div key={i} style={{ flex: 1, paddingRight: '24px', borderRight: i < 3 ? `1px solid ${C.border}` : 'none', paddingLeft: i > 0 ? '24px' : 0 }}>
                  <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 800, color: C.text, letterSpacing: '-0.02em' }}>{s.val}</div>
                  <div style={{ fontSize: '12px', color: C.muted, marginTop: '3px', lineHeight: 1.4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Profile */}
          <div className="hidden lg:flex" style={{ justifyContent: 'center', alignItems: 'center' }}>
            <div
              style={{
                position: 'relative', width: '340px', height: '340px',
                transform: `translate(${mouse.x * -12}px, ${mouse.y * -8}px)`,
                transition: 'transform 0.1s ease-out',
              }}
            >
              {/* Outer orbital */}
              <div className="animate-orbit" style={{
                position: 'absolute', inset: '-56px',
                border: '1px solid rgba(0,200,255,0.12)',
                borderTopColor: 'rgba(0,200,255,0.6)',
                borderRadius: '50%',
              }} />
              {/* Inner orbital */}
              <div className="animate-orbit-reverse" style={{
                position: 'absolute', inset: '-28px',
                border: '1px dashed rgba(0,200,255,0.1)',
                borderRightColor: 'rgba(0,200,255,0.45)',
                borderRadius: '50%',
              }} />
              {/* Ambient glow */}
              <div className="animate-glow-pulse" style={{
                position: 'absolute', inset: '-20px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(0,200,255,0.12) 0%, transparent 70%)',
                pointerEvents: 'none',
              }} />
              {/* Image */}
              <img
                src={heroImgOverride || profileImg}
                alt="Amantha Nirmal — UI/UX Designer"
                style={{
                  width: '100%', height: '100%',
                  objectFit: 'cover', objectPosition: 'top center',
                  borderRadius: '50%',
                  border: `2px solid rgba(0,200,255,0.35)`,
                  position: 'relative', zIndex: 2,
                  boxShadow: '0 0 0 6px rgba(0,200,255,0.06)',
                }}
              />
              {/* Orbital dot */}
              <div style={{
                position: 'absolute', top: '-54px', left: '50%', transform: 'translateX(-50%)',
                width: 10, height: 10, borderRadius: '50%',
                background: C.accent, boxShadow: `0 0 14px ${C.accent}`,
                zIndex: 3,
              }} />
              {/* Floating badge */}
              <div style={{
                position: 'absolute', bottom: '10px', right: '-60px',
                background: 'rgba(12,17,29,0.96)', border: `1px solid ${C.borderAccent}`,
                borderRadius: '100px', padding: '8px 18px', zIndex: 4,
                backdropFilter: 'blur(12px)',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em',
                color: C.accent, whiteSpace: 'nowrap',
              }}>
                UI · UX · WEB · MOBILE
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div style={{ position: 'absolute', bottom: '36px', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 1 }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', fontWeight: 500, letterSpacing: '0.15em', color: C.muted }}>SCROLL</span>
        <div style={{ width: 1, height: 48, background: `linear-gradient(to bottom, rgba(0,200,255,0.5), transparent)` }} />
      </div>
    </section>
  )
}

// ── About ─────────────────────────────────────────────────────────────────────

function AboutSection() {
  return (
    <section id="about" style={{ padding: '120px 0', borderTop: `1px solid ${C.border}` }}>
      <div className="section-inner">
        <div style={{ display: 'grid', gap: '80px', alignItems: 'start' }} className="grid grid-cols-1 lg:grid-cols-2">
          {/* Left */}
          <div>
            <Reveal>
              <div className="section-label">About Me</div>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(30px, 4vw, 52px)', fontWeight: 800, letterSpacing: '-0.03em', color: C.text, marginBottom: '24px', lineHeight: 1.1 }}>
                A Designer With<br />
                <span style={{ color: C.accent }}>a Technical Mind.</span>
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p style={{ fontSize: '16px', lineHeight: 1.8, color: C.muted, marginBottom: '20px' }}>
                {"I'm"} an Information Technology graduate who transitioned his technical understanding into
                digital product design. My IT background lets me see both sides — how things should feel
                and how they get built.
              </p>
              <p style={{ fontSize: '16px', lineHeight: 1.8, color: C.muted, marginBottom: '36px' }}>
                With a strong eye for visual trends and a user-centered approach, I design interfaces
                that are not only aesthetically refined but functionally sound — from wireframe to
                developer handoff.
              </p>
            </Reveal>

            {/* Journey */}
            <Reveal delay={0.2}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginBottom: '8px' }}>
                {['Education', 'Internship', 'Associate', 'Independent'].map((step, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{
                      padding: '6px 14px', borderRadius: '100px',
                      background: i === 3 ? 'rgba(0,200,255,0.1)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${i === 3 ? C.borderAccent : C.border}`,
                      color: i === 3 ? C.accent : C.muted,
                      fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap',
                    }}>{step}</div>
                    {i < 3 && <div style={{ width: '24px', height: 1, background: C.border, flexShrink: 0 }} />}
                  </div>
                ))}
              </div>
              <p style={{ fontSize: '12px', color: C.muted, opacity: 0.6 }}>Current journey</p>
            </Reveal>
          </div>

          {/* Right: stat cards */}
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[
                { val: '2026', sub: 'IT Graduate', note: 'BSc Hons., KDU' },
                { val: '1+ Year', sub: 'Professional Experience', note: 'UI/UX Design' },
                { val: '5+', sub: 'Featured Projects', note: 'Web & Mobile' },
                { val: 'UI + Code', sub: 'Design & Development', note: 'Full product thinking' },
              ].map((s, i) => (
                <Reveal key={i} delay={i * 0.1}>
                  <div className="card-hover" style={{
                    background: C.surface, border: `1px solid ${C.border}`,
                    borderRadius: '14px', padding: '28px 24px',
                  }}>
                    <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '28px', fontWeight: 800, color: C.text, letterSpacing: '-0.02em', marginBottom: '4px' }}>{s.val}</div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: C.text, marginBottom: '4px' }}>{s.sub}</div>
                    <div style={{ fontSize: '12px', color: C.muted }}>{s.note}</div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Work ──────────────────────────────────────────────────────────────────────

function WorkSection({ projects = [] }: { projects?: Project[] }) {
  const [activeProject, setActiveProject] = useState<Project | null>(null)
  const openProject  = useCallback((p: Project) => setActiveProject(p), [])
  const closeProject = useCallback(() => setActiveProject(null), [])

  return (
    <section id="work" style={{ padding: '120px 0', borderTop: `1px solid ${C.border}` }}>
      <div className="section-inner">
        <Reveal>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div className="section-label">Portfolio</div>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(30px, 4vw, 52px)', fontWeight: 800, letterSpacing: '-0.03em', color: C.text, lineHeight: 1.1 }}>Selected Work</h2>
            </div>
            <p style={{ fontSize: '15px', color: C.muted, maxWidth: '320px', lineHeight: 1.65 }}>
              A curated set of projects spanning booking platforms, fintech, wellness, and e-commerce.
            </p>
          </div>
        </Reveal>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {projects.map((project, i) => (
            <Reveal key={project.id} className={i === 0 ? 'col-span-2' : ''} delay={(i % 2) * 0.1}>
              <ProjectCard project={project} large={i === 0} onOpen={openProject} />
            </Reveal>
          ))}
        </div>
      </div>
      {activeProject && <Lightbox project={activeProject} onClose={closeProject} />}
    </section>
  )
}

function ProjectCard({ project, large = false, onOpen }: { project: Project; large?: boolean; onOpen: (p: Project) => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      className="card-hover"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: C.surface, border: `1px solid ${C.border}`,
        borderRadius: '16px', overflow: 'hidden', cursor: 'pointer',
        display: 'flex', flexDirection: large ? 'row' : 'column',
      }}
    >
      {/* Image */}
      <div style={{
        position: 'relative', overflow: 'hidden',
        flex: large ? '1' : 'none',
        minWidth: large ? '55%' : 'auto',
      }}>
        <img
          src={project.images?.[0] ?? ''}
          alt={project.title}
          style={{
            width: '100%', height: 'auto', display: 'block',
            transition: 'transform 0.55s ease',
            transform: hovered ? 'scale(1.04)' : 'scale(1)',
          }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(7,10,16,0.6), transparent)' }} />
        {/* Category tag on image */}
        <div style={{ position: 'absolute', top: '16px', left: '16px' }}>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', fontWeight: 600,
            letterSpacing: '0.1em', color: C.accent, background: 'rgba(7,10,16,0.8)',
            border: `1px solid ${C.borderAccent}`, borderRadius: '100px', padding: '5px 12px',
            backdropFilter: 'blur(8px)',
          }}>
            {project.category.split('·')[0].trim().toUpperCase()}
          </span>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1, gap: '16px' }}>
        <div>
          <div style={{ fontSize: '12px', color: C.muted, marginBottom: '6px', fontWeight: 500 }}>{project.category}</div>
          <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: large ? '28px' : '22px', fontWeight: 800, letterSpacing: '-0.025em', color: C.text, marginBottom: '12px' }}>{project.title}</h3>
          <p style={{ fontSize: '14px', lineHeight: 1.7, color: C.muted }}>{project.desc}</p>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {project.tags.slice(0, 3).map((t, i) => (
              <span key={i} style={{ fontSize: '11px', fontWeight: 600, color: C.muted, background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, borderRadius: '6px', padding: '4px 10px', letterSpacing: '0.02em' }}>{t}</span>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => onOpen(project)}
              style={{ fontSize: '12px', fontWeight: 700, color: C.accent, letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit', transition: 'opacity 0.2s ease' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              View Case Study <span style={{ fontSize: 16 }}>→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Services ──────────────────────────────────────────────────────────────────

function ServicesSection() {
  return (
    <section id="services" style={{ padding: '120px 0', borderTop: `1px solid ${C.border}` }}>
      <div className="section-inner">
        <Reveal>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div className="section-label" style={{ justifyContent: 'center' }}>
              <span style={{ width: 24, height: 1, background: C.accent, opacity: 0.6 }} />
              Services
              <span style={{ width: 24, height: 1, background: C.accent, opacity: 0.6 }} />
            </div>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(30px, 4vw, 52px)', fontWeight: 800, letterSpacing: '-0.03em', color: C.text }}>
              What I Can <span style={{ color: C.accent }}>Design</span>
            </h2>
          </div>
        </Reveal>

        <div style={{ display: 'grid', gap: '16px' }} className="grid-cols-1 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {services.map((svc, i) => (
            <Reveal key={svc.title} delay={i * 0.07}>
              <ServiceCard svc={svc} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function ServiceCard({ svc }: { svc: typeof services[0] }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      className="card-hover"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: C.surface, border: `1px solid ${hov ? 'rgba(0,200,255,0.3)' : C.border}`,
        borderRadius: '14px', padding: '32px 28px',
        transition: 'all 0.3s ease',
        boxShadow: hov ? '0 0 32px rgba(0,200,255,0.07)' : 'none',
      }}
    >
      <div style={{
        width: '48px', height: '48px', borderRadius: '12px', marginBottom: '24px',
        background: hov ? 'rgba(0,200,255,0.12)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${hov ? C.borderAccent : C.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '22px', color: hov ? C.accent : C.muted,
        transition: 'all 0.3s ease',
      }}>
        {svc.icon}
      </div>
      <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '17px', fontWeight: 700, color: C.text, marginBottom: '10px', letterSpacing: '-0.01em' }}>{svc.title}</h3>
      <p style={{ fontSize: '14px', lineHeight: 1.7, color: C.muted }}>{svc.desc}</p>
    </div>
  )
}

// ── Skills ────────────────────────────────────────────────────────────────────

function SkillsSection() {
  const [activeTab, setActiveTab] = useState(0)
  return (
    <section id="skills" style={{ padding: '120px 0', borderTop: `1px solid ${C.border}` }}>
      <div className="section-inner">
        <Reveal>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '48px', flexWrap: 'wrap', gap: '24px' }}>
            <div>
              <div className="section-label">Expertise</div>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(30px, 4vw, 52px)', fontWeight: 800, letterSpacing: '-0.03em', color: C.text }}>
                Skills & Tools
              </h2>
            </div>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {skillGroups.map((g, i) => (
                <button
                  key={g.name}
                  onClick={() => setActiveTab(i)}
                  style={{
                    padding: '8px 18px', borderRadius: '100px', border: `1px solid ${activeTab === i ? C.accent : C.border}`,
                    background: activeTab === i ? 'rgba(0,200,255,0.1)' : 'transparent',
                    color: activeTab === i ? C.accent : C.muted,
                    fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                    transition: 'all 0.2s ease', fontFamily: "'Outfit', sans-serif",
                  }}
                >
                  {g.name}
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', minHeight: '120px' }}>
            {skillGroups[activeTab].skills.map((skill, i) => (
              <span key={i} className="skill-tag" style={{ animationDelay: `${i * 0.05}s` }}>
                {skill}
              </span>
            ))}
          </div>
        </Reveal>

        {/* Marquee banner */}
        <Reveal delay={0.2}>
          <div style={{ marginTop: '72px', overflow: 'hidden', padding: '20px 0', borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
            <div className="animate-marquee" style={{ display: 'flex', gap: '48px', whiteSpace: 'nowrap', width: 'max-content' }}>
              {['Figma', 'UI Design', 'UX Research', 'Prototyping', 'Design Systems', 'Web Design', 'Mobile Apps', 'Figma', 'UI Design', 'UX Research', 'Prototyping', 'Design Systems', 'Web Design', 'Mobile Apps'].map((item, i) => (
                <span key={i} style={{ fontFamily: "'Outfit', sans-serif", fontSize: '15px', fontWeight: 600, color: i % 2 === 0 ? C.muted : 'rgba(255,255,255,0.15)', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '48px' }}>
                  {item}
                  {i % 2 === 0 && <span style={{ color: C.accent, fontSize: '12px' }}>✦</span>}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

// ── Philosophy ────────────────────────────────────────────────────────────────

function PhilosophySection() {
  return (
    <section style={{ padding: '120px 0', borderTop: `1px solid ${C.border}` }}>
      <div className="section-inner">
        <Reveal>
          <div style={{ textAlign: 'center', marginBottom: '72px' }}>
            <div className="section-label" style={{ justifyContent: 'center' }}>
              <span style={{ width: 24, height: 1, background: C.accent, opacity: 0.6 }} />
              Approach
              <span style={{ width: 24, height: 1, background: C.accent, opacity: 0.6 }} />
            </div>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(30px, 4vw, 52px)', fontWeight: 800, letterSpacing: '-0.03em', color: C.text, marginBottom: '20px' }}>
              Design With <span style={{ color: C.accent }}>Purpose.</span>
            </h2>
            <p style={{ fontSize: '16px', lineHeight: 1.8, color: C.muted, maxWidth: '520px', margin: '0 auto' }}>
              Good design {"isn't"} only about making something look good. {"It's"} about understanding people,
              simplifying complexity, and creating experiences that feel natural to use.
            </p>
          </div>
        </Reveal>

        <div style={{ display: 'grid', gap: '24px', position: 'relative' }} className="grid grid-cols-1 md:grid-cols-3">
          {/* Connector line — desktop only */}
          <div className="hidden md:block" style={{ position: 'absolute', top: '48px', left: '16.67%', right: '16.67%', height: 1, background: `linear-gradient(90deg, transparent, ${C.accent}50, transparent)`, zIndex: 0 }} />

          {[
            { num: '01', title: 'Understand', desc: 'Start with users, context and the problem. Empathy is the foundation of every good solution.' },
            { num: '02', title: 'Simplify', desc: 'Remove unnecessary complexity. Create clear, intuitive experiences that work without instruction.' },
            { num: '03', title: 'Refine', desc: 'Iterate, test and polish until every detail feels intentional and purposeful.' },
          ].map((p, i) => (
            <Reveal key={i} delay={i * 0.15}>
              <div style={{ textAlign: 'center', padding: '40px 32px', position: 'relative', zIndex: 1 }}>
                <div style={{
                  width: '72px', height: '72px', borderRadius: '50%', margin: '0 auto 24px',
                  background: 'rgba(0,200,255,0.08)', border: `1px solid ${C.borderAccent}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', fontWeight: 600, color: C.accent,
                  boxShadow: '0 0 20px rgba(0,200,255,0.1)',
                }}>
                  {p.num}
                </div>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '22px', fontWeight: 800, color: C.text, marginBottom: '12px', letterSpacing: '-0.02em' }}>{p.title}</h3>
                <p style={{ fontSize: '14px', lineHeight: 1.75, color: C.muted }}>{p.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Timeline ──────────────────────────────────────────────────────────────────

function TimelineSection({ entries = DEFAULT_TIMELINE }: { entries?: TimelineEntry[] }) {
  const workEntries = entries.filter(e => e.type === 'work')
  const eduEntries  = entries.filter(e => e.type === 'edu')

  const TimelineColumn = ({ items, accentColor, borderAccent }: { items: TimelineEntry[]; accentColor: string; borderAccent: string }) => (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Vertical line */}
      <div style={{ position: 'absolute', left: '15px', top: '8px', bottom: '8px', width: 1, background: `linear-gradient(to bottom, ${accentColor}70, transparent)` }} />
      {items.map((item, i) => (
        <Reveal key={item.role + i} delay={i * 0.12}>
          <div style={{ display: 'flex', gap: '28px', alignItems: 'flex-start' }}>
            {/* Dot */}
            <div style={{ paddingTop: '6px', flexShrink: 0 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: accentColor, boxShadow: `0 0 10px ${accentColor}80`, flexShrink: 0 }} />
            </div>
            {/* Card */}
            <div style={{ flex: 1, background: C.surface, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '22px 24px', transition: 'border-color 0.2s ease' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = borderAccent)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = C.border)}
            >
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', fontWeight: 600, color: accentColor, letterSpacing: '0.12em', marginBottom: '8px' }}>{item.period}</div>
              <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '17px', fontWeight: 700, color: C.text, marginBottom: '4px', lineHeight: 1.25 }}>{item.role}</h3>
              <div style={{ fontSize: '13px', color: C.muted, marginBottom: '14px' }}>{item.org}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {item.points.map((pt, pi) => (
                  <span key={pi} style={{ fontSize: '11px', color: C.muted, background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, borderRadius: '6px', padding: '3px 9px' }}>{pt}</span>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      ))}
    </div>
  )

  return (
    <section style={{ padding: '120px 0', borderTop: `1px solid ${C.border}` }}>
      <div className="section-inner">
        <Reveal>
          <div style={{ marginBottom: '64px' }}>
            <div className="section-label">Journey</div>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(30px, 4vw, 52px)', fontWeight: 800, letterSpacing: '-0.03em', color: C.text }}>
              Education &<br /><span style={{ color: C.accent }}>Experience</span>
            </h2>
          </div>
        </Reveal>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'start' }}>
          {/* Experience column */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
              <div style={{ width: 24, height: 1, background: C.accent, opacity: 0.5 }} />
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em', color: C.accent }}>EXPERIENCE</span>
            </div>
            <TimelineColumn items={workEntries} accentColor={C.accent} borderAccent={C.borderAccent} />
          </div>

          {/* Education column */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
              <div style={{ width: 24, height: 1, background: '#818cf8', opacity: 0.5 }} />
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em', color: '#818cf8' }}>EDUCATION</span>
            </div>
            <TimelineColumn items={eduEntries} accentColor="#818cf8" borderAccent="rgba(129,140,248,0.35)" />
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Beyond the Interface ───────────────────────────────────────────────────────

function BeyondSection({ cards = DEFAULT_BEYOND }: { cards?: BeyondCard[] }) {
  return (
    <section style={{ padding: '120px 0', borderTop: `1px solid ${C.border}` }}>
      <div className="section-inner">
        <Reveal>
          <div style={{ marginBottom: '48px' }}>
            <div className="section-label">Experimental</div>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(30px, 4vw, 52px)', fontWeight: 800, letterSpacing: '-0.03em', color: C.text }}>
              Beyond the <span style={{ color: C.accent }}>Interface</span>
            </h2>
            <p style={{ fontSize: '15px', color: C.muted, marginTop: '12px', maxWidth: '440px' }}>
              Experimental work — video edits, motion studies, AI-assisted visuals, and design explorations outside the main portfolio.
            </p>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="h-scroll" style={{ display: 'flex', gap: '16px', paddingBottom: '12px' }}>
            {cards.map((card, i) => (
              <div key={i} style={{
                flexShrink: 0, width: '280px', height: '200px',
                borderRadius: '12px', overflow: 'hidden', position: 'relative',
                border: `1px solid ${C.border}`, cursor: 'pointer',
              }}
                className="card-hover"
              >
                <img src={card.image} alt={card.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(7,10,16,0.8), transparent)' }} />
                <div style={{ position: 'absolute', bottom: '14px', left: '16px', fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', fontWeight: 600, color: C.accent, letterSpacing: '0.08em' }}>
                  {card.label.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}

// ── Contact ───────────────────────────────────────────────────────────────────

function ContactSection({ cv }: { cv: CvData | null }) {
  const [form, setForm] = useState({ name: '', email: '', type: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    setErrorMsg('')
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name:    form.name,
          from_email:   form.email,
          project_type: form.type,
          message:      form.message,
        },
        EMAILJS_PUBLIC_KEY,
      )
      setStatus('sent')
      setForm({ name: '', email: '', type: '', message: '' })
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    }
  }

  return (
    <section id="contact" style={{ padding: '120px 0', borderTop: `1px solid ${C.border}` }}>
      <div className="section-inner">
        <Reveal>
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <div className="section-label" style={{ justifyContent: 'center' }}>
              <span style={{ width: 24, height: 1, background: C.accent, opacity: 0.6 }} />
              Contact
              <span style={{ width: 24, height: 1, background: C.accent, opacity: 0.6 }} />
            </div>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(28px, 4.5vw, 60px)', fontWeight: 800, letterSpacing: '-0.03em', color: C.text, marginBottom: '16px' }}>
              Have an idea?<br />
              <span style={{ color: C.accent }}>{"Let's"} create it.</span>
            </h2>
            <p style={{ fontSize: '16px', color: C.muted, maxWidth: '440px', margin: '0 auto', lineHeight: 1.75 }}>
              Whether you have a product idea, a website that needs a better experience,
              or a design challenge to solve — {"let's"} talk.
            </p>
          </div>
        </Reveal>

        <div style={{ display: 'grid', gap: '64px', alignItems: 'start' }} className="grid grid-cols-1 lg:grid-cols-[1fr_420px]">
          {/* Form */}
          <Reveal delay={0.1}>
            {status === 'sent' ? (
              <div style={{ background: 'rgba(0,200,255,0.08)', border: `1px solid ${C.borderAccent}`, borderRadius: '16px', padding: '48px', textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>✦</div>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '24px', fontWeight: 800, color: C.text, marginBottom: '8px' }}>Message Sent!</h3>
                <p style={{ color: C.muted }}>{"I'll"} get back to you as soon as possible.</p>
                <button className="btn-outline" style={{ marginTop: '24px' }} onClick={() => setStatus('idle')}>Send Another</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="grid-cols-1 sm:grid-cols-2">
                  <input
                    className="form-field"
                    placeholder="Your Name"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    required
                  />
                  <input
                    className="form-field"
                    type="email"
                    placeholder="Email Address"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    required
                  />
                </div>
                <select
                  className="form-field"
                  value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                  style={{ appearance: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '14px 18px', color: form.type ? '#e8edf5' : '#4b5563', fontFamily: 'Inter, sans-serif', fontSize: '15px', outline: 'none' }}
                >
                  <option value="" disabled>Choose Inquiry Category</option>
                  {['UI/UX Design', 'Website Design', 'Mobile App Design', 'Design System', 'Recruitment Offer', 'Consultation', 'Other'].map(t => (
                    <option key={t} value={t} style={{ background: '#0c111d', color: '#e8edf5' }}>{t}</option>
                  ))}
                </select>
                <textarea
                  className="form-field"
                  placeholder="Tell me about your project..."
                  rows={5}
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  required
                />
                {status === 'error' && (
                  <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', fontSize: '14px' }}>
                    {errorMsg || 'Failed to send. Please try again.'}
                  </div>
                )}
                <button
                  type="submit"
                  className="btn-neon"
                  disabled={status === 'sending'}
                  style={{ alignSelf: 'flex-start', fontSize: '15px', opacity: status === 'sending' ? 0.7 : 1, cursor: status === 'sending' ? 'not-allowed' : 'pointer' }}
                >
                  {status === 'sending' ? 'Sending…' : <>Send Message <span style={{ fontSize: 18 }}>→</span></>}
                </button>
              </form>
            )}
          </Reveal>

          {/* Contact Info */}
          <Reveal delay={0.2}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Info cards */}
              {[
                { label: 'Email', value: 'amanthanirmal2002@gmail.com', icon: '✉' },
                { label: 'Phone', value: '+94 760 841 616', icon: '◎' },
                { label: 'Location', value: 'Kandy, Sri Lanka', icon: '◈' },
              ].map(info => (
                <div key={info.label + info.value} style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '20px 24px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px' }}>
                  <span style={{ fontSize: '20px', color: C.accent, flexShrink: 0 }}>{info.icon}</span>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', color: C.muted, textTransform: 'uppercase', marginBottom: '3px', fontFamily: "'JetBrains Mono', monospace" }}>{info.label}</div>
                    <div style={{ fontSize: '15px', color: C.text, fontWeight: 500 }}>{info.value}</div>
                  </div>
                </div>
              ))}

              {/* WhatsApp */}
              <a
                href="https://wa.me/94760841616"
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'flex', gap: '14px', alignItems: 'center', padding: '20px 24px', background: 'rgba(37,211,102,0.06)', border: '1px solid rgba(37,211,102,0.25)', borderRadius: '12px', textDecoration: 'none', transition: 'all 0.2s ease' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(37,211,102,0.12)'; e.currentTarget.style.borderColor = 'rgba(37,211,102,0.5)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(37,211,102,0.06)'; e.currentTarget.style.borderColor = 'rgba(37,211,102,0.25)' }}
              >
                <span style={{ fontSize: '20px', flexShrink: 0 }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="#25d366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </span>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', color: 'rgba(37,211,102,0.8)', textTransform: 'uppercase', marginBottom: '3px', fontFamily: "'JetBrains Mono', monospace" }}>WhatsApp</div>
                  <div style={{ fontSize: '15px', color: C.text, fontWeight: 500 }}>+94 760 841 616</div>
                </div>
                <span style={{ marginLeft: 'auto', color: 'rgba(37,211,102,0.6)', fontSize: '16px' }}>↗</span>
              </a>

              {/* Social */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                {[
                  { name: 'LinkedIn', url: 'http://www.linkedin.com/in/amantha-nirmal-45676a224' },
                  { name: 'Behance', url: 'https://www.behance.net/amanthanirmal' },
                ].map(s => (
                  <a
                    key={s.name}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline"
                    style={{ flex: 1, justifyContent: 'center', fontSize: '14px', padding: '12px 20px' }}
                  >
                    {s.name} ↗
                  </a>
                ))}
              </div>

              {/* Download CV */}
              {cv ? (
                <button
                  onClick={() => downloadCv(cv)}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', background: 'rgba(0,200,255,0.06)', border: `1px solid ${C.borderAccent}`, borderRadius: '12px', cursor: 'pointer', width: '100%', transition: 'all 0.2s ease', textAlign: 'left' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,200,255,0.12)'; e.currentTarget.style.borderColor = C.accent }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,200,255,0.06)'; e.currentTarget.style.borderColor = C.borderAccent }}
                >
                  <span style={{ fontSize: '20px', color: C.accent }}>↓</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em', color: C.accent, marginBottom: '2px' }}>DOWNLOAD</div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: C.text }}>My CV / Resume</div>
                  </div>
                  <span style={{ fontSize: '12px', color: C.muted, fontFamily: "'JetBrains Mono',monospace" }}>PDF</span>
                </button>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${C.border}`, borderRadius: '12px', opacity: 0.45 }}>
                  <span style={{ fontSize: '20px', color: C.muted }}>↓</span>
                  <div>
                    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em', color: C.muted, marginBottom: '2px' }}>DOWNLOAD</div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: C.muted }}>CV not uploaded yet</div>
                  </div>
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

// ── Footer ────────────────────────────────────────────────────────────────────

// ── Admin Panel ───────────────────────────────────────────────────────────────

type AdminTab = 'overview' | 'projects' | 'add' | 'beyond' | 'hero' | 'timeline' | 'cv'

function AdminPanel({ projects, onProjectsChange, beyond, onBeyondChange, heroImg, onHeroImgChange, timelineEntries, onTimelineChange, cv, onCvChange, onClose }: {
  projects: Project[]
  onProjectsChange: (list: Project[]) => void
  beyond: BeyondCard[]
  onBeyondChange: (list: BeyondCard[]) => void
  heroImg: string | null
  onHeroImgChange: (url: string | null) => void
  timelineEntries: TimelineEntry[]
  onTimelineChange: (list: TimelineEntry[]) => void
  cv: CvData | null
  onCvChange: (cv: CvData | null) => void
  onClose: () => void
}) {
  const [authed, setAuthed]     = useState(() => sessionStorage.getItem('admin_auth') === '1')
  const [tab, setTab]           = useState<AdminTab>('overview')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [onClose])

  const handleLogout = () => { sessionStorage.removeItem('admin_auth'); setAuthed(false) }

  const handleDelete = (id: number) => {
    const next = projects.filter(p => p.id !== id)
    onProjectsChange(next)
    setDeleteId(null)
  }

  const handleUpdate = (updated: Project) => {
    const next = projects.map(p => p.id === updated.id ? updated : p)
    onProjectsChange(next)
    setEditingId(null)
  }

  const handleAdd = (p: Project) => {
    onProjectsChange([...projects, p])
    setTab('projects')
  }

  const move = (idx: number, dir: -1 | 1) => {
    const arr = [...projects]
    const target = idx + dir
    if (target < 0 || target >= arr.length) return;
    [arr[idx], arr[target]] = [arr[target], arr[idx]]
    onProjectsChange(arr)
  }

  if (!authed) return <AdminLogin onSuccess={() => { sessionStorage.setItem('admin_auth', '1'); setAuthed(true) }} onClose={onClose} />

  // ── Beyond tab handlers ──
  const moveBeyond = (idx: number, dir: -1 | 1) => {
    const arr = [...beyond]
    const target = idx + dir
    if (target < 0 || target >= arr.length) return;
    [arr[idx], arr[target]] = [arr[target], arr[idx]]
    onBeyondChange(arr)
  }
  const deleteBeyond = (idx: number) => onBeyondChange(beyond.filter((_, i) => i !== idx))

  const categories = [...new Set(projects.map(p => p.category.split('·')[0].trim()))]

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', background: C.bg }}>
      <style>{MODAL_STYLES}</style>

      {/* Sidebar */}
      <div style={{ width: '220px', flexShrink: 0, background: C.surface, borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', padding: '0' }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px', borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '14px', color: C.text, letterSpacing: '-0.01em' }}>AMANTHA <span style={{ color: C.accent }}>ADMIN</span></div>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '10px', color: C.muted, marginTop: '3px', letterSpacing: '0.08em' }}>CONTROL PANEL</div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {([
            { id: 'overview', icon: '◈', label: 'Overview' },
            { id: 'projects', icon: '⬡', label: 'Projects' },
            { id: 'add',      icon: '+', label: 'Add Project' },
            { id: 'beyond',   icon: '▣', label: 'Beyond Section' },
            { id: 'hero',     icon: '◉', label: 'Hero Image' },
            { id: 'timeline', icon: '≡', label: 'Timeline' },
            { id: 'cv',       icon: '↓', label: 'CV / Resume' },
          ] as { id: AdminTab; icon: string; label: string }[]).map(item => (
            <button key={item.id} onClick={() => { setTab(item.id); setEditingId(null) }}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all 0.18s ease', fontFamily: "'Inter',sans-serif", fontSize: '14px', fontWeight: tab === item.id ? 600 : 400, background: tab === item.id ? 'rgba(0,200,255,0.1)' : 'transparent', color: tab === item.id ? C.accent : C.muted, borderLeft: tab === item.id ? `2px solid ${C.accent}` : '2px solid transparent' }}>
              <span style={{ fontSize: '14px', flexShrink: 0 }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: '12px 8px', borderTop: `1px solid ${C.border}` }}>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', width: '100%', background: 'transparent', color: '#ef4444', fontSize: '14px', fontFamily: "'Inter',sans-serif", transition: 'all 0.18s ease' }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
            ⏻ &nbsp;Logout
          </button>
          <button onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', width: '100%', background: 'transparent', color: C.muted, fontSize: '14px', fontFamily: "'Inter',sans-serif", marginTop: '2px', transition: 'all 0.18s ease' }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
            ← &nbsp;Back to Site
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '40px 48px' }}>

        {/* ── Overview ── */}
        {tab === 'overview' && (
          <div>
            <div style={{ marginBottom: '36px' }}>
              <div className="section-label">Dashboard</div>
              <h1 style={{ fontFamily: "'Outfit',sans-serif", fontSize: '32px', fontWeight: 800, letterSpacing: '-0.03em', color: C.text }}>Overview</h1>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px,1fr))', gap: '16px', marginBottom: '40px' }}>
              {[
                { val: projects.length, label: 'Total Projects', icon: '⬡' },
                { val: categories.length, label: 'Categories', icon: '◈' },
                { val: projects.filter(p => p.link || p.iframeSrc).length, label: 'With Live Links', icon: '↗' },
                { val: projects.filter(p => p.images.length > 1).length, label: 'Multi-image', icon: '▣' },
              ].map((s, i) => (
                <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '20px' }}>
                  <div style={{ fontSize: '22px', marginBottom: '8px' }}>{s.icon}</div>
                  <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: '28px', fontWeight: 800, color: C.text }}>{s.val}</div>
                  <div style={{ fontSize: '12px', color: C.muted, marginTop: '2px' }}>{s.label}</div>
                </div>
              ))}
            </div>

            <h2 style={{ fontFamily: "'Outfit',sans-serif", fontSize: '18px', fontWeight: 700, color: C.text, marginBottom: '16px' }}>Project List</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {projects.map((p, i) => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '12px 16px' }}>
                  <div style={{ width: '40px', height: '32px', borderRadius: '6px', overflow: 'hidden', flexShrink: 0, background: '#000' }}>
                    <img src={p.images?.[0] ?? ''} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</div>
                    <div style={{ fontSize: '12px', color: C.muted }}>{p.category}</div>
                  </div>
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '11px', color: C.muted }}>#{i + 1}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Projects ── */}
        {tab === 'projects' && (
          <div>
            <div style={{ marginBottom: '36px' }}>
              <div className="section-label">Manage</div>
              <h1 style={{ fontFamily: "'Outfit',sans-serif", fontSize: '32px', fontWeight: 800, letterSpacing: '-0.03em', color: C.text }}>Projects</h1>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {projects.map((p, i) => (
                <div key={p.id}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: C.surface, border: `1px solid ${editingId === p.id ? C.borderAccent : C.border}`, borderRadius: '12px', padding: '14px 18px', transition: 'border-color 0.2s' }}>
                    {/* Thumb */}
                    <div style={{ width: '56px', height: '44px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: '#000' }}>
                      <img src={p.images?.[0] ?? ''} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '15px', color: C.text }}>{p.title}</div>
                      <div style={{ fontSize: '12px', color: C.muted, marginTop: '2px' }}>{p.category}</div>
                      <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                        {p.tags.slice(0, 3).map((t, i) => <span key={i} style={{ fontSize: '10px', color: C.muted, background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, borderRadius: '4px', padding: '2px 7px' }}>{t}</span>)}
                      </div>
                    </div>
                    {/* Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                      {/* Reorder */}
                      <button onClick={() => move(i, -1)} disabled={i === 0} title="Move up" style={{ width: 28, height: 28, borderRadius: '6px', border: `1px solid ${C.border}`, background: 'transparent', color: i === 0 ? C.border : C.muted, cursor: i === 0 ? 'default' : 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>↑</button>
                      <button onClick={() => move(i, 1)} disabled={i === projects.length - 1} title="Move down" style={{ width: 28, height: 28, borderRadius: '6px', border: `1px solid ${C.border}`, background: 'transparent', color: i === projects.length - 1 ? C.border : C.muted, cursor: i === projects.length - 1 ? 'default' : 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>↓</button>
                      {/* Edit */}
                      <button onClick={() => setEditingId(editingId === p.id ? null : p.id)} style={{ padding: '5px 12px', borderRadius: '6px', border: `1px solid ${editingId === p.id ? C.borderAccent : C.border}`, background: editingId === p.id ? 'rgba(0,200,255,0.1)' : 'transparent', color: editingId === p.id ? C.accent : C.muted, fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}>
                        {editingId === p.id ? 'Cancel' : 'Edit'}
                      </button>
                      {/* Delete */}
                      {deleteId === p.id ? (
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button onClick={() => handleDelete(p.id)} style={{ padding: '5px 10px', borderRadius: '6px', border: '1px solid rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: '12px', cursor: 'pointer', fontWeight: 700 }}>Confirm</button>
                          <button onClick={() => setDeleteId(null)} style={{ padding: '5px 10px', borderRadius: '6px', border: `1px solid ${C.border}`, background: 'transparent', color: C.muted, fontSize: '12px', cursor: 'pointer' }}>✕</button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteId(p.id)} style={{ padding: '5px 12px', borderRadius: '6px', border: '1px solid rgba(239,68,68,0.3)', background: 'transparent', color: '#ef4444', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}>Delete</button>
                      )}
                    </div>
                  </div>

                  {/* Inline Edit Form */}
                  {editingId === p.id && (
                    <AdminEditForm project={p} onSave={handleUpdate} onCancel={() => setEditingId(null)} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Add Project ── */}
        {tab === 'add' && (
          <div>
            <div style={{ marginBottom: '36px' }}>
              <div className="section-label">New</div>
              <h1 style={{ fontFamily: "'Outfit',sans-serif", fontSize: '32px', fontWeight: 800, letterSpacing: '-0.03em', color: C.text }}>Add Project</h1>
            </div>
            <div style={{ maxWidth: '700px' }}>
              <AdminProjectForm onSave={handleAdd} />
            </div>
          </div>
        )}

        {/* ── Beyond the Interface ── */}
        {tab === 'beyond' && (
          <div>
            <div style={{ marginBottom: '36px' }}>
              <div className="section-label">Experimental</div>
              <h1 style={{ fontFamily: "'Outfit',sans-serif", fontSize: '32px', fontWeight: 800, letterSpacing: '-0.03em', color: C.text }}>Beyond the Interface</h1>
              <p style={{ fontSize: '14px', color: C.muted, marginTop: '8px' }}>Manage the cards in the experimental gallery. Images are uploaded from your computer.</p>
            </div>
            <AdminBeyondManager cards={beyond} onChange={onBeyondChange} onMove={moveBeyond} onDelete={deleteBeyond} />
          </div>
        )}

        {/* ── Hero Image ── */}
        {tab === 'hero' && (
          <div>
            <div style={{ marginBottom: '36px' }}>
              <div className="section-label">Appearance</div>
              <h1 style={{ fontFamily: "'Outfit',sans-serif", fontSize: '32px', fontWeight: 800, letterSpacing: '-0.03em', color: C.text }}>Hero Image</h1>
              <p style={{ fontSize: '14px', color: C.muted, marginTop: '8px' }}>Replace the profile photo shown in the hero section. Upload a new image from your computer.</p>
            </div>
            <AdminHeroImage heroImg={heroImg} onChange={onHeroImgChange} />
          </div>
        )}

        {/* ── Timeline ── */}
        {tab === 'timeline' && (
          <div>
            <div style={{ marginBottom: '36px' }}>
              <div className="section-label">Experience</div>
              <h1 style={{ fontFamily: "'Outfit',sans-serif", fontSize: '32px', fontWeight: 800, letterSpacing: '-0.03em', color: C.text }}>Timeline</h1>
              <p style={{ fontSize: '14px', color: C.muted, marginTop: '8px' }}>Add, remove, or reorder Education & Experience entries.</p>
            </div>
            <AdminTimelineManager entries={timelineEntries} onChange={onTimelineChange} />
          </div>
        )}

        {/* ── CV / Resume ── */}
        {tab === 'cv' && (
          <div>
            <div style={{ marginBottom: '36px' }}>
              <div className="section-label">Documents</div>
              <h1 style={{ fontFamily: "'Outfit',sans-serif", fontSize: '32px', fontWeight: 800, letterSpacing: '-0.03em', color: C.text }}>CV / Resume</h1>
              <p style={{ fontSize: '14px', color: C.muted, marginTop: '8px' }}>Upload your CV to make it downloadable from the contact section.</p>
            </div>
            <AdminCvManager cv={cv} onChange={onCvChange} />
          </div>
        )}
      </div>
    </div>
  )
}

// ── Admin CV Manager ──────────────────────────────────────────────────────────

function AdminCvManager({ cv, onChange }: { cv: CvData | null; onChange: (cv: CvData | null) => void }) {
  const [uploading, setUploading] = useState(false)
  const [filename, setFilename]   = useState(cv?.filename ?? 'Amantha_Nirmal_CV.pdf')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setUploading(true)
    const base64 = await readRawBase64(f)
    const name = filename.trim() || f.name
    onChange({ base64, filename: name.endsWith('.pdf') ? name : name + '.pdf' })
    setUploading(false)
    e.target.value = ''
  }

  const handleRename = () => {
    if (!cv) return
    const name = filename.trim() || cv.filename
    onChange({ ...cv, filename: name.endsWith('.pdf') ? name : name + '.pdf' })
  }

  return (
    <div style={{ maxWidth: '520px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <input ref={fileRef} type="file" accept=".pdf,application/pdf" onChange={handleFile} style={{ display: 'none' }} />

      {cv ? (
        <>
          {/* Current CV card */}
          <div style={{ background: C.surface, border: `1px solid ${C.borderAccent}`, borderRadius: '14px', padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: 48, height: 56, borderRadius: '8px', background: 'rgba(0,200,255,0.1)', border: `1px solid ${C.borderAccent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '10px', fontWeight: 700, color: C.accent, letterSpacing: '0.06em' }}>PDF</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '15px', color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cv.filename}</div>
              <div style={{ fontSize: '12px', color: C.muted, marginTop: '3px' }}>
                {Math.round(cv.base64.length * 0.75 / 1024)} KB · Stored in browser
              </div>
            </div>
            <button onClick={() => downloadCv(cv)} className="btn-outline" style={{ fontSize: '12px', padding: '7px 14px', whiteSpace: 'nowrap' }}>Preview ↓</button>
          </div>

          {/* Rename */}
          <div>
            <label style={{ display: 'block', fontFamily: "'JetBrains Mono',monospace", fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em', color: C.muted, marginBottom: '7px' }}>DOWNLOAD FILENAME</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input className="form-field" value={filename} onChange={e => setFilename(e.target.value)} placeholder="Amantha_Nirmal_CV.pdf" style={{ flex: 1 }} />
              <button onClick={handleRename} className="btn-outline" style={{ fontSize: '13px', padding: '10px 16px', whiteSpace: 'nowrap' }}>Rename</button>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => fileRef.current?.click()} className="btn-neon" style={{ fontSize: '14px' }}>
              {uploading ? 'Uploading…' : 'Replace CV'}
            </button>
            <button onClick={() => onChange(null)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.35)', background: 'transparent', color: '#ef4444', fontSize: '14px', cursor: 'pointer', fontWeight: 600, fontFamily: "'Outfit',sans-serif", transition: 'all 0.2s ease' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)' }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
              Delete CV
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Empty state */}
          <button onClick={() => fileRef.current?.click()} style={{ padding: '40px', border: `1.5px dashed rgba(0,200,255,0.25)`, borderRadius: '14px', background: 'rgba(0,200,255,0.03)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', transition: 'all 0.2s ease' }} onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,200,255,0.5)'; e.currentTarget.style.background = 'rgba(0,200,255,0.06)' }} onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,200,255,0.25)'; e.currentTarget.style.background = 'rgba(0,200,255,0.03)' }}>
            <span style={{ fontSize: '32px', color: C.accent, opacity: 0.6 }}>{uploading ? '…' : '↑'}</span>
            <span style={{ fontWeight: 700, fontSize: '15px', color: C.text }}>{uploading ? 'Uploading…' : 'Upload CV (PDF)'}</span>
            <span style={{ fontSize: '13px', color: C.muted }}>Click to select a PDF from your computer</span>
          </button>

          {/* Custom filename before upload */}
          <div>
            <label style={{ display: 'block', fontFamily: "'JetBrains Mono',monospace", fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em', color: C.muted, marginBottom: '7px' }}>DOWNLOAD FILENAME (optional)</label>
            <input className="form-field" value={filename} onChange={e => setFilename(e.target.value)} placeholder="Amantha_Nirmal_CV.pdf" />
          </div>
        </>
      )}

      <p style={{ fontSize: '13px', color: C.muted, lineHeight: 1.6 }}>
        The CV is stored in your browser's local storage and will persist across refreshes.<br />
        You can also place a PDF at <code style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '11px', color: C.accent }}>public/cv/</code> in the project folder for a static fallback.
      </p>
    </div>
  )
}

// ── Admin Hero Image ──────────────────────────────────────────────────────────

function AdminHeroImage({ heroImg, onChange }: { heroImg: string | null; onChange: (url: string | null) => void }) {
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setUploading(true)
    onChange(await readFileAsBase64(f))
    setUploading(false)
    e.target.value = ''
  }

  return (
    <div style={{ maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />

      {/* Preview */}
      <div style={{ width: '200px', height: '200px', borderRadius: '16px', overflow: 'hidden', border: `2px solid ${heroImg ? C.borderAccent : C.border}`, background: '#000', position: 'relative' }}>
        <img src={heroImg || profileImg} alt="Hero" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        {heroImg && (
          <div style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,200,255,0.9)', borderRadius: '4px', padding: '2px 7px', fontFamily: "'JetBrains Mono',monospace", fontSize: '9px', fontWeight: 700, color: '#000', letterSpacing: '0.06em' }}>CUSTOM</div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={() => fileRef.current?.click()} className="btn-neon" style={{ fontSize: '14px' }}>
          {uploading ? 'Uploading…' : 'Upload New Photo'}
        </button>
        {heroImg && (
          <button onClick={() => onChange(null)} className="btn-outline" style={{ fontSize: '14px', color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}>
            Reset to Default
          </button>
        )}
      </div>

      <p style={{ fontSize: '13px', color: C.muted, lineHeight: 1.6 }}>
        Best results: square crop, minimum 600×600px, clear background or professional portrait.<br />
        The image is stored locally in your browser.
      </p>
    </div>
  )
}

// ── Admin Timeline Manager ────────────────────────────────────────────────────

function AdminTimelineManager({ entries, onChange }: { entries: TimelineEntry[]; onChange: (list: TimelineEntry[]) => void }) {
  const [editingIdx, setEditingIdx] = useState<number | null>(null)
  const [deleteIdx, setDeleteIdx]   = useState<number | null>(null)
  const [adding, setAdding]         = useState(false)

  const [draft, setDraft] = useState<TimelineEntry>({ period: '', role: '', org: '', type: 'work', points: [] })
  const [pointsRaw, setPointsRaw] = useState('')

  const move = (idx: number, dir: -1 | 1) => {
    const arr = [...entries]; const t = idx + dir
    if (t < 0 || t >= arr.length) return;
    [arr[idx], arr[t]] = [arr[t], arr[idx]]; onChange(arr)
  }

  const startEdit = (idx: number) => {
    setDraft({ ...entries[idx] }); setPointsRaw(entries[idx].points.join('\n')); setEditingIdx(idx); setAdding(false)
  }

  const saveEdit = (idx: number) => {
    const updated = { ...draft, points: pointsRaw.split('\n').map(p => p.trim()).filter(Boolean) }
    onChange(entries.map((e, i) => i === idx ? updated : e))
    setEditingIdx(null)
  }

  const saveAdd = () => {
    const entry = { ...draft, points: pointsRaw.split('\n').map(p => p.trim()).filter(Boolean) }
    onChange([...entries, entry]); setAdding(false); setDraft({ period: '', role: '', org: '', type: 'work', points: [] }); setPointsRaw('')
  }

  const Label = ({ text }: { text: string }) => (
    <label style={{ display: 'block', fontFamily: "'JetBrains Mono',monospace", fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em', color: C.muted, marginBottom: '7px' }}>{text}</label>
  )

  const EntryForm = ({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) => (
    <div style={{ background: 'rgba(0,200,255,0.03)', border: `1px solid ${C.borderAccent}`, borderTop: 'none', borderRadius: '0 0 10px 10px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div><Label text="PERIOD" /><input className="form-field" value={draft.period} onChange={e => setDraft(d => ({ ...d, period: e.target.value }))} placeholder="e.g. 2025 — 2026" /></div>
        <div>
          <Label text="TYPE" />
          <select className="form-field" value={draft.type} onChange={e => setDraft(d => ({ ...d, type: e.target.value as 'work' | 'edu' }))} style={{ appearance: 'none', cursor: 'pointer' }}>
            <option value="work" style={{ background: '#0c111d' }}>Work</option>
            <option value="edu" style={{ background: '#0c111d' }}>Education</option>
          </select>
        </div>
      </div>
      <div><Label text="ROLE / TITLE" /><input className="form-field" value={draft.role} onChange={e => setDraft(d => ({ ...d, role: e.target.value }))} placeholder="e.g. Associate UI/UX Designer" /></div>
      <div><Label text="ORGANIZATION" /><input className="form-field" value={draft.org} onChange={e => setDraft(d => ({ ...d, org: e.target.value }))} placeholder="e.g. UEXPLUS" /></div>
      <div><Label text="HIGHLIGHTS (one per line)" /><textarea className="form-field" rows={4} value={pointsRaw} onChange={e => setPointsRaw(e.target.value)} placeholder={"Line 1\nLine 2\nLine 3"} /></div>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <button type="button" onClick={onCancel} className="btn-outline" style={{ fontSize: '12px', padding: '7px 16px' }}>Cancel</button>
        <button type="button" onClick={onSave} className="btn-neon" style={{ fontSize: '12px', padding: '7px 16px' }}>Save Entry</button>
      </div>
    </div>
  )

  return (
    <div style={{ maxWidth: '720px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {entries.map((entry, i) => (
        <div key={i}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: C.surface, border: `1px solid ${editingIdx === i ? C.borderAccent : C.border}`, borderRadius: editingIdx === i ? '10px 10px 0 0' : '10px', padding: '14px 16px', transition: 'border-color 0.2s' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: entry.type === 'work' ? C.accent : '#a78bfa', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '14px', color: C.text }}>{entry.role}</div>
              <div style={{ fontSize: '12px', color: C.muted, marginTop: '2px' }}>{entry.org} · {entry.period}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
              <button onClick={() => move(i, -1)} disabled={i === 0} style={{ width: 26, height: 26, borderRadius: '5px', border: `1px solid ${C.border}`, background: 'transparent', color: i === 0 ? C.border : C.muted, cursor: i === 0 ? 'default' : 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>↑</button>
              <button onClick={() => move(i, 1)} disabled={i === entries.length - 1} style={{ width: 26, height: 26, borderRadius: '5px', border: `1px solid ${C.border}`, background: 'transparent', color: i === entries.length - 1 ? C.border : C.muted, cursor: i === entries.length - 1 ? 'default' : 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>↓</button>
              <button onClick={() => { if (editingIdx === i) { setEditingIdx(null) } else { startEdit(i) } }} style={{ padding: '4px 10px', borderRadius: '5px', border: `1px solid ${editingIdx === i ? C.borderAccent : C.border}`, background: editingIdx === i ? 'rgba(0,200,255,0.1)' : 'transparent', color: editingIdx === i ? C.accent : C.muted, fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}>
                {editingIdx === i ? 'Cancel' : 'Edit'}
              </button>
              {deleteIdx === i ? (
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button onClick={() => { onChange(entries.filter((_, idx) => idx !== i)); setDeleteIdx(null) }} style={{ padding: '4px 8px', borderRadius: '5px', border: '1px solid rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: '12px', cursor: 'pointer', fontWeight: 700 }}>Confirm</button>
                  <button onClick={() => setDeleteIdx(null)} style={{ padding: '4px 8px', borderRadius: '5px', border: `1px solid ${C.border}`, background: 'transparent', color: C.muted, fontSize: '12px', cursor: 'pointer' }}>✕</button>
                </div>
              ) : (
                <button onClick={() => setDeleteIdx(i)} style={{ padding: '4px 10px', borderRadius: '5px', border: '1px solid rgba(239,68,68,0.3)', background: 'transparent', color: '#ef4444', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}>Delete</button>
              )}
            </div>
          </div>
          {editingIdx === i && <EntryForm onSave={() => saveEdit(i)} onCancel={() => setEditingIdx(null)} />}
        </div>
      ))}

      {/* Add new */}
      {adding ? (
        <div style={{ border: `1px solid ${C.borderAccent}`, borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', background: C.surface, fontWeight: 700, fontSize: '14px', color: C.text }}>New Entry</div>
          <EntryForm onSave={saveAdd} onCancel={() => { setAdding(false); setDraft({ period: '', role: '', org: '', type: 'work', points: [] }); setPointsRaw('') }} />
        </div>
      ) : (
        <button onClick={() => { setAdding(true); setEditingIdx(null) }} className="btn-outline" style={{ alignSelf: 'flex-start', fontSize: '13px', marginTop: '4px' }}>+ Add Entry</button>
      )}
    </div>
  )
}

// ── Admin Beyond Manager ─────────────────────────────────────────────────────

function AdminBeyondManager({ cards, onChange, onMove, onDelete }: {
  cards: BeyondCard[]
  onChange: (list: BeyondCard[]) => void
  onMove: (idx: number, dir: -1 | 1) => void
  onDelete: (idx: number) => void
}) {
  const [editingIdx, setEditingIdx]   = useState<number | null>(null)
  const [deleteIdx, setDeleteIdx]     = useState<number | null>(null)
  const [addLabel, setAddLabel]       = useState('')
  const [addImage, setAddImage]       = useState('')
  const [uploading, setUploading]     = useState(false)
  const fileRef     = useRef<HTMLInputElement>(null)
  const addFileRef  = useRef<HTMLInputElement>(null)

  // Edit state for inline row
  const [editLabel, setEditLabel] = useState('')
  const [editImage, setEditImage] = useState('')

  const startEdit = (idx: number) => {
    setEditingIdx(idx)
    setEditLabel(cards[idx].label)
    setEditImage(cards[idx].image)
  }

  const saveEdit = (idx: number) => {
    const next = cards.map((c, i) => i === idx ? { label: editLabel, image: editImage } : c)
    onChange(next)
    setEditingIdx(null)
  }

  const handleEditFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setUploading(true)
    setEditImage(await readFileAsBase64(f))
    setUploading(false)
    e.target.value = ''
  }

  const handleAddFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setUploading(true)
    setAddImage(await readFileAsBase64(f))
    setUploading(false)
    e.target.value = ''
  }

  const handleAdd = (e: FormEvent) => {
    e.preventDefault()
    if (!addLabel.trim() || !addImage) return
    onChange([...cards, { label: addLabel.trim(), image: addImage }])
    setAddLabel(''); setAddImage('')
  }

  const Label = ({ text }: { text: string }) => (
    <label style={{ display: 'block', fontFamily: "'JetBrains Mono',monospace", fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em', color: C.muted, marginBottom: '7px' }}>{text}</label>
  )

  return (
    <div style={{ maxWidth: '720px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleEditFile} style={{ display: 'none' }} />
      <input ref={addFileRef} type="file" accept="image/*" onChange={handleAddFile} style={{ display: 'none' }} />

      {/* Card list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {cards.map((card, i) => (
          <div key={i}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: C.surface, border: `1px solid ${editingIdx === i ? C.borderAccent : C.border}`, borderRadius: '10px', padding: '12px 16px', transition: 'border-color 0.2s' }}>
              <div style={{ width: '56px', height: '40px', borderRadius: '6px', overflow: 'hidden', flexShrink: 0, background: '#000' }}>
                <img src={card.image} alt={card.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ flex: 1, fontWeight: 600, fontSize: '14px', color: C.text }}>{card.label}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
                <button onClick={() => onMove(i, -1)} disabled={i === 0} style={{ width: 26, height: 26, borderRadius: '5px', border: `1px solid ${C.border}`, background: 'transparent', color: i === 0 ? C.border : C.muted, cursor: i === 0 ? 'default' : 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>↑</button>
                <button onClick={() => onMove(i, 1)} disabled={i === cards.length - 1} style={{ width: 26, height: 26, borderRadius: '5px', border: `1px solid ${C.border}`, background: 'transparent', color: i === cards.length - 1 ? C.border : C.muted, cursor: i === cards.length - 1 ? 'default' : 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>↓</button>
                <button onClick={() => { if (editingIdx === i) { setEditingIdx(null) } else { startEdit(i) } }} style={{ padding: '4px 10px', borderRadius: '5px', border: `1px solid ${editingIdx === i ? C.borderAccent : C.border}`, background: editingIdx === i ? 'rgba(0,200,255,0.1)' : 'transparent', color: editingIdx === i ? C.accent : C.muted, fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}>
                  {editingIdx === i ? 'Cancel' : 'Edit'}
                </button>
                {deleteIdx === i ? (
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button onClick={() => { onDelete(i); setDeleteIdx(null) }} style={{ padding: '4px 8px', borderRadius: '5px', border: '1px solid rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: '12px', cursor: 'pointer', fontWeight: 700 }}>Confirm</button>
                    <button onClick={() => setDeleteIdx(null)} style={{ padding: '4px 8px', borderRadius: '5px', border: `1px solid ${C.border}`, background: 'transparent', color: C.muted, fontSize: '12px', cursor: 'pointer' }}>✕</button>
                  </div>
                ) : (
                  <button onClick={() => setDeleteIdx(i)} style={{ padding: '4px 10px', borderRadius: '5px', border: '1px solid rgba(239,68,68,0.3)', background: 'transparent', color: '#ef4444', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}>Delete</button>
                )}
              </div>
            </div>
            {editingIdx === i && (
              <div style={{ background: 'rgba(0,200,255,0.03)', border: `1px solid ${C.borderAccent}`, borderTop: 'none', borderRadius: '0 0 10px 10px', padding: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', alignItems: 'end' }}>
                  <div>
                    <Label text="LABEL" />
                    <input className="form-field" value={editLabel} onChange={e => setEditLabel(e.target.value)} />
                  </div>
                  <div>
                    <Label text="IMAGE" />
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {editImage && <div style={{ width: 48, height: 36, borderRadius: '5px', overflow: 'hidden', border: `1px solid ${C.border}` }}><img src={editImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>}
                      <button type="button" onClick={() => fileRef.current?.click()} style={{ padding: '10px 14px', borderRadius: '8px', border: `1px dashed rgba(0,200,255,0.3)`, background: 'transparent', color: C.accent, fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap' }}>{uploading ? '…' : 'Upload'}</button>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '12px' }}>
                  <button type="button" onClick={() => setEditingIdx(null)} className="btn-outline" style={{ fontSize: '12px', padding: '7px 16px' }}>Cancel</button>
                  <button type="button" onClick={() => saveEdit(i)} className="btn-neon" style={{ fontSize: '12px', padding: '7px 16px' }}>Save</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add new card */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '20px' }}>
        <h3 style={{ fontFamily: "'Outfit',sans-serif", fontSize: '16px', fontWeight: 700, color: C.text, marginBottom: '16px' }}>Add New Card</h3>
        <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', alignItems: 'end' }}>
          <div>
            <Label text="LABEL" />
            <input className="form-field" placeholder="e.g. Motion Study" value={addLabel} onChange={e => setAddLabel(e.target.value)} required />
          </div>
          <div>
            <Label text="IMAGE" />
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {addImage && <div style={{ width: 48, height: 36, borderRadius: '5px', overflow: 'hidden', border: `1px solid ${C.border}` }}><img src={addImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>}
              <button type="button" onClick={() => addFileRef.current?.click()} style={{ padding: '10px 14px', borderRadius: '8px', border: `1px dashed rgba(0,200,255,0.3)`, background: 'transparent', color: C.accent, fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap' }}>{uploading ? '…' : 'Upload Image'}</button>
            </div>
          </div>
          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn-neon" style={{ fontSize: '13px', padding: '9px 22px' }} disabled={!addLabel.trim() || !addImage}>Add Card →</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Admin Login ───────────────────────────────────────────────────────────────

function AdminLogin({ onSuccess, onClose }: { onSuccess: () => void; onClose: () => void }) {
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]     = useState('')
  const [showPw, setShowPw]   = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (email.trim() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      onSuccess()
    } else {
      setError('Invalid email or password.')
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(7,10,16,0.96)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <style>{MODAL_STYLES}</style>
      <button onClick={onClose} style={{ position: 'fixed', top: 20, right: 24, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: C.text, borderRadius: '50%', width: 44, height: 44, fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>

      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '40px', width: '100%', maxWidth: '400px', animation: 'slideUpLightbox 0.3s ease', boxShadow: `0 40px 120px rgba(0,0,0,0.8), 0 0 60px rgba(0,200,255,0.06)` }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: 56, height: 56, borderRadius: '14px', background: 'rgba(0,200,255,0.1)', border: `1px solid ${C.borderAccent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '24px' }}>⬢</div>
          <h2 style={{ fontFamily: "'Outfit',sans-serif", fontSize: '24px', fontWeight: 800, color: C.text, letterSpacing: '-0.02em' }}>Admin Access</h2>
          <p style={{ fontSize: '14px', color: C.muted, marginTop: '6px' }}>Sign in to manage your portfolio</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontFamily: "'JetBrains Mono',monospace", fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em', color: C.muted, marginBottom: '7px' }}>EMAIL</label>
            <input className="form-field" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
          </div>
          <div>
            <label style={{ display: 'block', fontFamily: "'JetBrains Mono',monospace", fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em', color: C.muted, marginBottom: '7px' }}>PASSWORD</label>
            <div style={{ position: 'relative' }}>
              <input className="form-field" type={showPw ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required style={{ paddingRight: '44px' }} />
              <button type="button" onClick={() => setShowPw(v => !v)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: '13px', padding: 0 }}>{showPw ? 'Hide' : 'Show'}</button>
            </div>
          </div>
          {error && <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', fontSize: '13px' }}>{error}</div>}
          <button type="submit" className="btn-neon" style={{ marginTop: '4px', justifyContent: 'center' }}>Sign In</button>
        </form>
      </div>
    </div>
  )
}

// ── Admin edit inline form ─────────────────────────────────────────────────────

function AdminEditForm({ project, onSave, onCancel }: { project: Project; onSave: (p: Project) => void; onCancel: () => void }) {
  const [title, setTitle]       = useState(project.title)
  const [category, setCategory] = useState(project.category)
  const [desc, setDesc]         = useState(project.desc)
  const [tagsRaw, setTagsRaw]   = useState(project.tags.join(', '))
  const [link, setLink]         = useState(project.link ?? '')
  const [iframeSrc, setIframeSrc] = useState(project.iframeSrc ?? '')
  const [images, setImages]     = useState(project.images)
  const [wide, setWide]         = useState(project.wide)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploading(true)
    const base64s = await Promise.all(files.map(f => readFileAsBase64(f)))
    setImages(prev => [...prev, ...base64s])
    setUploading(false)
    e.target.value = ''
  }

  const handleSave = (e: FormEvent) => {
    e.preventDefault()
    onSave({ ...project, title, category, desc, tags: tagsRaw.split(',').map(t => t.trim()).filter(Boolean), link: link || undefined, iframeSrc: iframeSrc || undefined, images, wide })
  }

  const Label = ({ text }: { text: string }) => (
    <label style={{ display: 'block', fontFamily: "'JetBrains Mono',monospace", fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em', color: C.muted, marginBottom: '7px' }}>{text}</label>
  )

  return (
    <form onSubmit={handleSave} style={{ background: 'rgba(0,200,255,0.03)', border: `1px solid ${C.borderAccent}`, borderTop: 'none', borderRadius: '0 0 12px 12px', padding: '20px 18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleFiles} style={{ display: 'none' }} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div><Label text="TITLE" /><input className="form-field" value={title} onChange={e => setTitle(e.target.value)} required /></div>
        <div><Label text="CATEGORY" /><input className="form-field" value={category} onChange={e => setCategory(e.target.value)} /></div>
      </div>
      <div><Label text="DESCRIPTION" /><textarea className="form-field" rows={2} value={desc} onChange={e => setDesc(e.target.value)} /></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div><Label text="KEYWORDS (comma-sep)" /><input className="form-field" value={tagsRaw} onChange={e => setTagsRaw(e.target.value)} /></div>
        <div><Label text="PROJECT LINK" /><input className="form-field" value={link} onChange={e => setLink(e.target.value)} placeholder="https://..." /></div>
      </div>
      <div><Label text="IFRAME/EMBED URL" /><input className="form-field" value={iframeSrc} onChange={e => setIframeSrc(e.target.value)} placeholder="https://figma.com/proto/..." /></div>

      {/* Images */}
      <div>
        <Label text="IMAGES" />
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {images.map((img, i) => (
            <div key={i} style={{ position: 'relative', width: '64px', height: '48px', borderRadius: '6px', overflow: 'hidden', border: `2px solid ${i === 0 ? C.accent : C.border}` }}>
              <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button type="button" onClick={() => setImages(imgs => imgs.filter((_, idx) => idx !== i))} style={{ position: 'absolute', top: 2, right: 2, width: 16, height: 16, borderRadius: '3px', background: 'rgba(239,68,68,0.9)', border: 'none', color: '#fff', fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, lineHeight: 1 }}>×</button>
            </div>
          ))}
          <button type="button" onClick={() => fileRef.current?.click()} style={{ width: '64px', height: '48px', borderRadius: '6px', border: `1.5px dashed rgba(0,200,255,0.3)`, background: 'transparent', color: C.accent, fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{uploading ? '…' : '+'}</button>
        </div>
      </div>

      {/* Wide toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button type="button" onClick={() => setWide(v => !v)} style={{ width: 36, height: 20, borderRadius: '100px', border: 'none', background: wide ? C.accent : 'rgba(255,255,255,0.12)', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
          <span style={{ position: 'absolute', top: 3, left: wide ? 18 : 3, width: 14, height: 14, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
        </button>
        <span style={{ fontSize: '13px', color: C.muted }}>Full-width card (first position)</span>
      </div>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <button type="button" onClick={onCancel} className="btn-outline" style={{ fontSize: '13px', padding: '8px 20px' }}>Cancel</button>
        <button type="submit" className="btn-neon" style={{ fontSize: '13px', padding: '8px 20px' }}>Save Changes</button>
      </div>
    </form>
  )
}

// ── Admin add form (inline, no modal) ────────────────────────────────────────

function AdminProjectForm({ onSave }: { onSave: (p: Project) => void }) {
  const [title, setTitle]       = useState('')
  const [category, setCategory] = useState('')
  const [desc, setDesc]         = useState('')
  const [tagsRaw, setTagsRaw]   = useState('')
  const [link, setLink]         = useState('')
  const [iframeSrc, setIframeSrc] = useState('')
  const [images, setImages]     = useState<{ url: string; name: string }[]>([])
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploading(true)
    const newImgs = await Promise.all(files.map(async f => ({ url: await readFileAsBase64(f), name: f.name })))
    setImages(prev => [...prev, ...newImgs])
    setUploading(false)
    e.target.value = ''
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const fallback = 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=900&h=600&fit=crop&auto=format'
    onSave({
      id: Date.now(),
      title, category, desc,
      tags: tagsRaw.split(',').map(t => t.trim()).filter(Boolean),
      images: images.length > 0 ? images.map(i => i.url) : [fallback],
      wide: false,
      iframeSrc: iframeSrc || undefined,
      link: link || undefined,
    })
    setTitle(''); setCategory(''); setDesc(''); setTagsRaw(''); setLink(''); setIframeSrc(''); setImages([])
  }

  const Label = ({ text, sub }: { text: string; sub?: string }) => (
    <label style={{ display: 'block', fontFamily: "'JetBrains Mono',monospace", fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em', color: C.muted, marginBottom: '7px' }}>
      {text}{sub && <span style={{ fontWeight: 400, opacity: 0.55, marginLeft: '6px' }}>{sub}</span>}
    </label>
  )

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleFiles} style={{ display: 'none' }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        <div><Label text="TITLE *" /><input className="form-field" placeholder="Project name" value={title} onChange={e => setTitle(e.target.value)} required /></div>
        <div><Label text="CATEGORY *" /><input className="form-field" placeholder="e.g. Mobile App Design" value={category} onChange={e => setCategory(e.target.value)} required /></div>
      </div>
      <div><Label text="DESCRIPTION" /><textarea className="form-field" rows={3} placeholder="Short description..." value={desc} onChange={e => setDesc(e.target.value)} /></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        <div><Label text="KEYWORDS" sub="(comma-separated)" /><input className="form-field" placeholder="UI/UX, Figma, Mobile" value={tagsRaw} onChange={e => setTagsRaw(e.target.value)} /></div>
        <div><Label text="PROJECT LINK" /><input className="form-field" placeholder="https://behance.net/..." value={link} onChange={e => setLink(e.target.value)} /></div>
      </div>
      <div><Label text="IFRAME / EMBED URL" sub="(optional)" /><input className="form-field" placeholder="https://figma.com/proto/..." value={iframeSrc} onChange={e => setIframeSrc(e.target.value)} /></div>

      {/* Upload */}
      <div>
        <Label text="IMAGES" />
        <button type="button" onClick={() => fileRef.current?.click()} style={{ width: '100%', padding: '20px', border: '1.5px dashed rgba(0,200,255,0.25)', borderRadius: '10px', background: 'rgba(0,200,255,0.03)', color: C.muted, fontSize: '14px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', transition: 'all 0.2s ease' }} onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,200,255,0.5)'; e.currentTarget.style.background = 'rgba(0,200,255,0.06)' }} onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,200,255,0.25)'; e.currentTarget.style.background = 'rgba(0,200,255,0.03)' }}>
          <span style={{ fontSize: '24px', color: C.accent, opacity: 0.7 }}>{uploading ? '…' : '↑'}</span>
          <span style={{ fontWeight: 600, color: C.text, fontSize: '13px' }}>{uploading ? 'Processing…' : 'Click to upload images'}</span>
        </button>
        {images.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
            {images.map((img, i) => (
              <div key={i} style={{ position: 'relative', width: '72px', height: '54px', borderRadius: '6px', overflow: 'hidden', border: `2px solid ${i === 0 ? C.accent : C.border}` }}>
                <img src={img.url} alt={img.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                {i === 0 && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,200,255,0.85)', textAlign: 'center', fontFamily: "'JetBrains Mono',monospace", fontSize: '8px', fontWeight: 700, color: '#000', padding: '2px 0', letterSpacing: '0.06em' }}>COVER</div>}
                <button type="button" onClick={() => setImages(imgs => imgs.filter((_, idx) => idx !== i))} style={{ position: 'absolute', top: 2, right: 2, width: 16, height: 16, borderRadius: '3px', background: 'rgba(239,68,68,0.9)', border: 'none', color: '#fff', fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>×</button>
              </div>
            ))}
          </div>
        )}
      </div>
      <button type="submit" className="btn-neon" style={{ alignSelf: 'flex-start', fontSize: '14px' }}>Add Project →</button>
    </form>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

function Footer({ onAdminClick }: { onAdminClick: () => void }) {
  return (
    <footer style={{ borderTop: `1px solid ${C.border}`, padding: '48px 0 32px' }}>
      <div className="section-inner">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px' }}>
          <div>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '18px', color: C.text, letterSpacing: '-0.02em', marginBottom: '6px' }}>
              AMANTHA <span style={{ color: C.accent }}>NIRMAL</span>
            </div>
            <div style={{ fontSize: '13px', color: C.muted }}>UI/UX Designer · Web Designer · Digital Creative</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            {[
              { name: 'LinkedIn', url: 'http://www.linkedin.com/in/amantha-nirmal-45676a224' },
              { name: 'Behance', url: 'https://www.behance.net/amanthanirmal' },
            ].map(s => (
              <a
                key={s.name}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '14px', fontWeight: 600, color: C.muted, textDecoration: 'none', transition: 'color 0.2s ease' }}
                onMouseEnter={e => (e.currentTarget.style.color = C.accent)}
                onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
              >
                {s.name}
              </a>
            ))}
          </div>
        </div>

        <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <p style={{ fontSize: '13px', color: C.muted }}>© 2026 Amantha Nirmal. All rights reserved.</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.15)' }}>Designed & developed with care.</p>
            <button
              onClick={onAdminClick}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: "'JetBrains Mono',monospace", fontSize: '10px', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.12)', padding: '4px 8px', borderRadius: '4px', transition: 'color 0.2s ease' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.12)')}
            >
              ADMIN
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}

// ── App ───────────────────────────────────────────────────────────────────────

// ── Custom cursor ─────────────────────────────────────────────────────────────

function CustomCursor() {
  const dot   = useRef<HTMLDivElement>(null)
  const ring  = useRef<HTMLDivElement>(null)
  const pos   = useRef({ x: 0, y: 0 })
  const ring_pos = useRef({ x: 0, y: 0 })
  const raf   = useRef<number>(0)
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    const onMove = (e: MouseEvent) => { pos.current = { x: e.clientX, y: e.clientY } }
    window.addEventListener('mousemove', onMove, { passive: true })

    const onEnter = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      if (t.closest('a, button, [role="button"], input, textarea, select')) setHovered(true)
    }
    const onLeave = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      if (t.closest('a, button, [role="button"], input, textarea, select')) setHovered(false)
    }
    document.addEventListener('mouseover',  onEnter, { passive: true })
    document.addEventListener('mouseout',   onLeave, { passive: true })

    const loop = () => {
      if (dot.current) {
        dot.current.style.transform = `translate(${pos.current.x - 4}px, ${pos.current.y - 4}px)`
      }
      if (ring.current) {
        ring_pos.current.x += (pos.current.x - ring_pos.current.x) * 0.12
        ring_pos.current.y += (pos.current.y - ring_pos.current.y) * 0.12
        const sz = hovered ? 48 : 32
        ring.current.style.transform = `translate(${ring_pos.current.x - sz / 2}px, ${ring_pos.current.y - sz / 2}px)`
        ring.current.style.width  = `${sz}px`
        ring.current.style.height = `${sz}px`
      }
      raf.current = requestAnimationFrame(loop)
    }
    raf.current = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover',  onEnter)
      document.removeEventListener('mouseout',   onLeave)
      cancelAnimationFrame(raf.current)
    }
  }, [hovered])

  return (
    <>
      <style>{`* { cursor: none !important; }`}</style>
      {/* Dot */}
      <div ref={dot} style={{
        position: 'fixed', top: 0, left: 0, zIndex: 9999, pointerEvents: 'none',
        width: 8, height: 8, borderRadius: '50%',
        background: '#ef4444',
        boxShadow: '0 0 10px rgba(239,68,68,0.8)',
        transition: 'opacity 0.2s ease',
      }} />
      {/* Ring */}
      <div ref={ring} style={{
        position: 'fixed', top: 0, left: 0, zIndex: 9998, pointerEvents: 'none',
        borderRadius: '50%',
        border: `1.5px solid rgba(239,68,68,${hovered ? 0.8 : 0.45})`,
        background: hovered ? 'rgba(239,68,68,0.06)' : 'transparent',
        transition: 'border-color 0.2s ease, background 0.2s ease, width 0.2s ease, height 0.2s ease',
      }} />
    </>
  )
}

export default function App() {
  const [projects, setProjects]           = useState<Project[]>(initProjectList)
  const [beyond, setBeyond]               = useState<BeyondCard[]>(initBeyond)
  const [heroImg, setHeroImg]             = useState<string | null>(initHeroImg)
  const [timelineEntries, setTimeline]    = useState<TimelineEntry[]>(initTimeline)
  const [cv, setCv]                       = useState<CvData | null>(initCv)
  const [adminOpen, setAdminOpen]         = useState(false)

  const handleProjectsChange = (list: Project[]) => { persistProjects(list); setProjects(list) }
  const handleBeyondChange   = (list: BeyondCard[]) => { persistBeyond(list); setBeyond(list) }
  const handleHeroImgChange  = (url: string | null) => { persistHeroImg(url); setHeroImg(url) }
  const handleTimelineChange = (list: TimelineEntry[]) => { persistTimeline(list); setTimeline(list) }
  const handleCvChange       = (data: CvData | null) => { persistCv(data); setCv(data) }

  return (
    <div style={{ background: C.bg, minHeight: '100vh', color: C.text }}>
      <CustomCursor />
      <Nav />
      <HeroSection heroImg={heroImg} />
      <AboutSection />
      <WorkSection projects={projects} />
      <ServicesSection />
      <SkillsSection />
      <PhilosophySection />
      <TimelineSection entries={timelineEntries} />
      <BeyondSection cards={beyond} />
      <ContactSection cv={cv} />
      <Footer onAdminClick={() => setAdminOpen(true)} />
      {adminOpen && (
        <AdminPanel
          projects={projects}
          onProjectsChange={handleProjectsChange}
          beyond={beyond}
          onBeyondChange={handleBeyondChange}
          heroImg={heroImg}
          onHeroImgChange={handleHeroImgChange}
          timelineEntries={timelineEntries}
          onTimelineChange={handleTimelineChange}
          cv={cv}
          onCvChange={handleCvChange}
          onClose={() => setAdminOpen(false)}
        />
      )}
    </div>
  )
}
