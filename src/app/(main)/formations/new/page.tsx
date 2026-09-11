'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import RichTextEditor from '@/components/RichTextEditor'

const DISCIPLINES = [
  { value: 'dance', label: 'Danza' },
  { value: 'theater', label: 'Teatro' },
  { value: 'singing', label: 'Canto' },
  { value: 'circus', label: 'Circo' },
  { value: 'music', label: 'Música' },
]

const SUBDISCIPLINES: Record<string, { value: string; label: string }[]> = {
  dance: [
    { value: 'jazz', label: 'Jazz' },
    { value: 'urban', label: 'Urbano' },
    { value: 'classical', label: 'Clásico' },
    { value: 'contemporary', label: 'Contemporáneo' },
    { value: 'flamenco', label: 'Flamenco' },
    { value: 'ballroom', label: 'Baile de salón' },
  ],
  theater: [
    { value: 'clown', label: 'Clown' },
    { value: 'physical', label: 'Teatro físico' },
    { value: 'musical', label: 'Musical' },
    { value: 'improv', label: 'Improvisación' },
  ],
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-md)',
  fontFamily: 'var(--font)',
  fontSize: 15,
  color: 'var(--text-primary)',
  background: 'white',
  outline: 'none',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: 6,
  fontSize: 14,
  fontWeight: 500,
  color: 'var(--text-primary)',
  fontFamily: 'var(--font)',
}

export default function NewFormationPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [discipline, setDiscipline] = useState('')
  const [subdiscipline, setSubdiscipline] = useState('')
  const [city, setCity] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [price, setPrice] = useState('')
  const [capacity, setCapacity] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const subdisciplineOptions = discipline ? SUBDISCIPLINES[discipline] ?? [] : []

  async function handleSubmit() {
    if (!title || !description || description === '<br>' || !discipline || !city || !startDate || !endDate || !capacity) {
      setError('Por favor rellena todos los campos obligatorios')
      return
    }
    setSubmitting(true)
    setError(null)

    const res = await fetch('/api/formations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title, description, discipline, subdiscipline,
        city, startDate, endDate,
        price: parseFloat(price) || 0,
        capacity,
      }),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error)
      setSubmitting(false)
      return
    }
    router.push('/formations')
  }

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', padding: '0 20px 80px' }}>
      <Link href="/formations" style={{ fontSize: 13, color: 'var(--red)', textDecoration: 'none', fontFamily: 'var(--font)', fontWeight: 500 }}>
        ← Volver a formaciones
      </Link>

      <h1 style={{ fontSize: 24, fontWeight: 700, margin: '16px 0 4px', fontFamily: 'var(--font)', color: 'var(--text-primary)' }}>
        Publicar formación
      </h1>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24, fontFamily: 'var(--font)' }}>
        La formación quedará pendiente de revisión antes de publicarse.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <label style={labelStyle}>Título *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Taller de clown — nivel avanzado"
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Descripción *</label>
          <RichTextEditor
            value={description}
            onChange={setDescription}
            placeholder="Describe la formación, nivel requerido, qué aprenderán..."
            minHeight={160}
          />
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Disciplina *</label>
            <select
              value={discipline}
              onChange={(e) => { setDiscipline(e.target.value); setSubdiscipline('') }}
              style={inputStyle}
            >
              <option value="">Seleccionar</option>
              {DISCIPLINES.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>

          {subdisciplineOptions.length > 0 && (
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Estilo</label>
              <select value={subdiscipline} onChange={(e) => setSubdiscipline(e.target.value)} style={inputStyle}>
                <option value="">Seleccionar</option>
                {subdisciplineOptions.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div>
          <label style={labelStyle}>Ciudad *</label>
          <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Barcelona" style={inputStyle} />
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Fecha inicio *</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Fecha fin *</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={inputStyle} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Precio (€)</label>
            <input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0 si es gratuito" style={inputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Plazas *</label>
            <input type="number" min="1" value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder="Ej: 15" style={inputStyle} />
          </div>
        </div>

        {error && (
          <p style={{ color: 'var(--red)', fontSize: 13, background: 'var(--bg-highlight)', padding: '10px 14px', borderRadius: 8, fontFamily: 'var(--font)' }}>
            {error}
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={{ padding: '13px', background: 'var(--red)', color: 'white', border: 'none', borderRadius: 'var(--radius-full)', fontWeight: 600, fontSize: 15, fontFamily: 'var(--font)', cursor: 'pointer', opacity: submitting ? 0.6 : 1 }}
        >
          {submitting ? 'Enviando...' : 'Enviar para revisión'}
        </button>
      </div>
    </div>
  )
}
