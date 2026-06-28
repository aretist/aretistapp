'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const DISCIPLINES = [
  { value: 'dance', label: 'Danza' },
  { value: 'theater', label: 'Teatro' },
  { value: 'singing', label: 'Canto' },
  { value: 'circus', label: 'Circo' },
  { value: 'opera', label: 'Ópera' },
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
    if (!title || !description || !discipline || !city || !startDate || !endDate || !capacity) {
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
      <Link href="/formations" style={{ fontSize: 13, color: '#534AB7', textDecoration: 'none' }}>
        ← Volver a formaciones
      </Link>

      <h1 style={{ fontSize: 24, fontWeight: 600, margin: '16px 0 4px' }}>Publicar formación</h1>
      <p style={{ fontSize: 13, color: '#666', marginBottom: 24 }}>
        La formación quedará pendiente de revisión antes de publicarse.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>Título *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Taller de clown — nivel avanzado"
            style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 6 }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>Descripción *</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Describe la formación, nivel requerido, qué aprenderán..."
            style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 6, resize: 'vertical' }}
          />
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>Disciplina *</label>
            <select
              value={discipline}
              onChange={(e) => { setDiscipline(e.target.value); setSubdiscipline('') }}
              style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 6 }}
            >
              <option value="">Seleccionar</option>
              {DISCIPLINES.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>

          {subdisciplineOptions.length > 0 && (
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>Estilo</label>
              <select
                value={subdiscipline}
                onChange={(e) => setSubdiscipline(e.target.value)}
                style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 6 }}
              >
                <option value="">Seleccionar</option>
                {subdisciplineOptions.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>Ciudad *</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Barcelona"
            style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 6 }}
          />
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>Fecha inicio *</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 6 }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>Fecha fin *</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 6 }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>Precio (€)</label>
            <input
              type="number"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0 si es gratuito"
              style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 6 }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>Plazas *</label>
            <input
              type="number"
              min="1"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              placeholder="Ej: 15"
              style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 6 }}
            />
          </div>
        </div>

        {error && <p style={{ color: '#c00', fontSize: 14 }}>{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={{
            padding: 12,
            background: '#534AB7',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            fontWeight: 500,
            fontSize: 14,
            cursor: 'pointer',
            opacity: submitting ? 0.6 : 1,
          }}
        >
          {submitting ? 'Enviando...' : 'Enviar para revisión'}
        </button>
      </div>
    </div>
  )
}
