'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const DISCIPLINES = ['dance', 'theater', 'singing', 'circus', 'opera', 'music']
const DISCIPLINE_LABELS: Record<string, string> = {
  dance: 'Danza', theater: 'Teatro', singing: 'Canto',
  circus: 'Circo', opera: 'Ópera', music: 'Música',
}

export default function NewJobPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [disciplines, setDisciplines] = useState<string[]>([])
  const [city, setCity] = useState('')
  const [durationType, setDurationType] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isPaid, setIsPaid] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggleDiscipline(d: string) {
    setDisciplines((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    )
  }

  async function handleSubmit() {
    if (!title || !description) {
      setError('El título y la descripción son obligatorios')
      return
    }

    setSubmitting(true)
    setError(null)

    const res = await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, disciplines, city, durationType, startDate, endDate, isPaid }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error)
      setSubmitting(false)
      return
    }

    router.push('/jobs')
  }

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', padding: '0 20px 80px' }}>
      <Link href="/jobs" style={{ fontSize: 13, color: '#534AB7', textDecoration: 'none' }}>
        ← Volver a empleos
      </Link>

      <h1 style={{ fontSize: 24, fontWeight: 600, margin: '16px 0 4px' }}>Publicar oferta</h1>
      <p style={{ fontSize: 13, color: '#666', marginBottom: 24 }}>
        La oferta quedará pendiente de revisión antes de publicarse.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>Título de la oferta *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Bailarín/a contemporáneo para gira"
            style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 6 }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>Descripción *</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            placeholder="Describe el puesto, requisitos, condiciones..."
            style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 6, resize: 'vertical' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 8, fontSize: 14 }}>Disciplinas</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {DISCIPLINES.map((d) => (
              <button
                key={d}
                onClick={() => toggleDiscipline(d)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 20,
                  border: disciplines.includes(d) ? '1px solid #534AB7' : '1px solid #ddd',
                  background: disciplines.includes(d) ? '#EEEDFE' : 'white',
                  color: disciplines.includes(d) ? '#3C3489' : '#333',
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                {DISCIPLINE_LABELS[d]}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>Ciudad</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Barcelona"
              style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 6 }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>Tipo de contrato</label>
            <select
              value={durationType}
              onChange={(e) => setDurationType(e.target.value)}
              style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 6 }}
            >
              <option value="">Seleccionar</option>
              <option value="permanent">Contrato fijo</option>
              <option value="temporary">Temporal</option>
              <option value="gig">Caché / Proyecto</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>Fecha inicio</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 6 }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>Fecha fin</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 6 }}
            />
          </div>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={isPaid}
            onChange={(e) => setIsPaid(e.target.checked)}
          />
          Oferta remunerada
        </label>

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
