'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), { ssr: false })

interface Formation {
  id: string
  title: string
  description: string
  discipline: string
  subdiscipline: string | null
  city: string
  start_date: string
  end_date: string
  price: number | null
  capacity: number | null
}

const DISCIPLINES = [
  { key: 'dance', label: 'Danza' },
  { key: 'theater', label: 'Teatro' },
  { key: 'singing', label: 'Canto' },
  { key: 'circus', label: 'Circo' },
  { key: 'music', label: 'Música' },
]

const SUBDISCIPLINES: Record<string, { key: string; label: string }[]> = {
  dance: [
    { key: 'contemporary', label: 'Contemporánea' },
    { key: 'classical', label: 'Clásica' },
    { key: 'flamenco', label: 'Flamenco' },
    { key: 'urban', label: 'Urbano' },
    { key: 'latin', label: 'Latina' },
    { key: 'jazz', label: 'Jazz' },
  ],
  theater: [
    { key: 'dramatic', label: 'Dramático' },
    { key: 'musical', label: 'Musical' },
    { key: 'physical', label: 'Físico' },
    { key: 'improvisation', label: 'Improvisación' },
  ],
  singing: [
    { key: 'lyrical', label: 'Lírico' },
    { key: 'modern', label: 'Moderno' },
    { key: 'choral', label: 'Coral' },
  ],
  circus: [
    { key: 'aerial', label: 'Aéreo' },
    { key: 'acrobatics', label: 'Acrobacia' },
  ],
  music: [
    { key: 'guitar', label: 'Guitarra' },
    { key: 'piano', label: 'Piano' },
    { key: 'violin', label: 'Violín' },
    { key: 'percussion', label: 'Percusión' },
  ],
}

export default function EditFormationForm({ formation }: { formation: Formation }) {
  const router = useRouter()

  const [title, setTitle] = useState(formation.title)
  const [description, setDescription] = useState(formation.description)
  const [discipline, setDiscipline] = useState(formation.discipline)
  const [subdiscipline, setSubdiscipline] = useState(formation.subdiscipline ?? '')
  const [city, setCity] = useState(formation.city)
  const [startDate, setStartDate] = useState(formation.start_date ? formation.start_date.slice(0, 10) : '')
  const [endDate, setEndDate] = useState(formation.end_date ? formation.end_date.slice(0, 10) : '')
  const [price, setPrice] = useState(formation.price !== null ? String(formation.price) : '')
  const [capacity, setCapacity] = useState(formation.capacity !== null ? String(formation.capacity) : '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const availableSubdisciplines = discipline ? (SUBDISCIPLINES[discipline] ?? []) : []

  async function handleSave() {
    if (!title || !discipline || !city || !startDate || !endDate) {
      setError('Por favor completa todos los campos obligatorios.')
      return
    }
    setSaving(true)
    setError('')

    const res = await fetch('/api/formations', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: formation.id,
        title,
        description,
        discipline,
        subdiscipline: subdiscipline || null,
        city,
        start_date: startDate,
        end_date: endDate,
        price: price ? Number(price) : null,
        capacity: capacity ? Number(capacity) : null,
      }),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? 'Error al guardar. Inténtalo de nuevo.')
      setSaving(false)
      return
    }

    router.push(`/formations/${formation.id}`)
    router.refresh()
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    fontFamily: 'var(--font)',
    fontSize: 14,
    background: 'white',
    color: 'var(--text-primary)',
    outline: 'none',
    boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--text-secondary)',
    fontFamily: 'var(--font)',
    display: 'block',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Título */}
      <div>
        <label style={labelStyle}>Título *</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Ej: Taller de danza contemporánea intensivo"
          style={inputStyle}
        />
      </div>

      {/* Descripción */}
      <div>
        <label style={labelStyle}>Descripción *</label>
        <RichTextEditor value={description} onChange={setDescription} />
      </div>

      {/* Disciplina */}
      <div>
        <label style={labelStyle}>Disciplina *</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {DISCIPLINES.map(d => (
            <button
              key={d.key}
              type="button"
              onClick={() => {
                setDiscipline(d.key)
                setSubdiscipline('')
              }}
              style={{
                padding: '7px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: 13,
                fontFamily: 'var(--font)',
                fontWeight: 500,
                cursor: 'pointer',
                border: discipline === d.key ? '1.5px solid var(--red)' : '1px solid var(--border)',
                background: discipline === d.key ? 'var(--bg-highlight)' : 'white',
                color: discipline === d.key ? 'var(--red)' : 'var(--text-secondary)',
                transition: 'all 0.15s',
              }}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Subdisciplina */}
      {availableSubdisciplines.length > 0 && (
        <div>
          <label style={labelStyle}>Subdisciplina (opcional)</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {availableSubdisciplines.map(s => (
              <button
                key={s.key}
                type="button"
                onClick={() => setSubdiscipline(subdiscipline === s.key ? '' : s.key)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 12,
                  fontFamily: 'var(--font)',
                  fontWeight: 500,
                  cursor: 'pointer',
                  border: subdiscipline === s.key ? '1.5px solid var(--red)' : '1px solid var(--border)',
                  background: subdiscipline === s.key ? 'var(--bg-highlight)' : 'white',
                  color: subdiscipline === s.key ? 'var(--red)' : 'var(--text-secondary)',
                  transition: 'all 0.15s',
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Ciudad */}
      <div>
        <label style={labelStyle}>Ciudad *</label>
        <input
          type="text"
          value={city}
          onChange={e => setCity(e.target.value)}
          placeholder="Ej: Madrid"
          style={inputStyle}
        />
      </div>

      {/* Fechas */}
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Fecha de inicio *</label>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            style={inputStyle}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Fecha de fin *</label>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            style={inputStyle}
          />
        </div>
      </div>

      {/* Precio y aforo */}
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Precio (€)</label>
          <input
            type="number"
            value={price}
            onChange={e => setPrice(e.target.value)}
            placeholder="0 si es gratuito"
            min="0"
            style={inputStyle}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Plazas disponibles</label>
          <input
            type="number"
            value={capacity}
            onChange={e => setCapacity(e.target.value)}
            placeholder="Ej: 15"
            min="1"
            style={inputStyle}
          />
        </div>
      </div>

      {error && (
        <p style={{ color: 'var(--red)', fontSize: 13, fontFamily: 'var(--font)' }}>{error}</p>
      )}

      {/* Botones */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          type="button"
          onClick={() => router.back()}
          style={{
            flex: 1,
            padding: '12px',
            background: 'white',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-full)',
            fontFamily: 'var(--font)',
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          style={{
            flex: 2,
            padding: '12px',
            background: 'var(--red)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-full)',
            fontFamily: 'var(--font)',
            fontSize: 14,
            fontWeight: 600,
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.7 : 1,
            transition: 'opacity 0.15s',
          }}
        >
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  )
}
