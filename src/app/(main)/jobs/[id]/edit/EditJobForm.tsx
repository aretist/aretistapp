'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import RichTextEditor from '@/components/RichTextEditor'

const DISCIPLINES = ['dance', 'theater', 'singing', 'circus', 'music']
const DISCIPLINE_LABELS: Record<string, string> = {
  dance: 'Danza', theater: 'Teatro', singing: 'Canto',
  circus: 'Circo', music: 'Música',
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

interface Job {
  id: string
  title: string
  description: string
  disciplines: string[]
  city: string | null
  duration_type: string | null
  start_date: string | null
  end_date: string | null
  is_paid: boolean
}

export default function EditJobForm({ job }: { job: Job }) {
  const router = useRouter()

  const [title, setTitle] = useState(job.title)
  const [description, setDescription] = useState(job.description)
  const [disciplines, setDisciplines] = useState<string[]>(job.disciplines ?? [])
  const [city, setCity] = useState(job.city ?? '')
  const [durationType, setDurationType] = useState(job.duration_type ?? '')
  const [startDate, setStartDate] = useState(job.start_date ?? '')
  const [endDate, setEndDate] = useState(job.end_date ?? '')
  const [isPaid, setIsPaid] = useState(job.is_paid)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggleDiscipline(d: string) {
    setDisciplines((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    )
  }

  async function handleSubmit() {
    if (!title || !description || description === '<br>') {
      setError('El título y la descripción son obligatorios')
      return
    }
    setSubmitting(true)
    setError(null)

    const res = await fetch('/api/jobs', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId: job.id, title, description, disciplines, city, durationType, startDate, endDate, isPaid }),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error)
      setSubmitting(false)
      return
    }
    router.push(`/jobs/${job.id}`)
  }

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', padding: '0 20px 80px' }}>
      <Link href={`/jobs/${job.id}`} style={{ fontSize: 13, color: 'var(--red)', textDecoration: 'none', fontFamily: 'var(--font)', fontWeight: 500 }}>
        ← Volver a la oferta
      </Link>

      <h1 style={{ fontSize: 24, fontWeight: 700, margin: '16px 0 4px', fontFamily: 'var(--font)', color: 'var(--text-primary)' }}>
        Editar oferta
      </h1>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24, fontFamily: 'var(--font)' }}>
        Al guardar, la oferta volverá a revisión antes de publicarse.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <label style={labelStyle}>Título de la oferta *</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Bailarín/a contemporáneo para gira" style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>Descripción *</label>
          <RichTextEditor value={description} onChange={setDescription} placeholder="Describe el puesto, requisitos, condiciones..." minHeight={160} />
        </div>

        <div>
          <label style={labelStyle}>Disciplinas</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {DISCIPLINES.map((d) => (
              <button key={d} type="button" onClick={() => toggleDiscipline(d)} style={{ padding: '6px 14px', borderRadius: 20, border: disciplines.includes(d) ? '1px solid var(--red)' : '1px solid var(--border)', background: disciplines.includes(d) ? 'var(--bg-highlight)' : 'white', color: disciplines.includes(d) ? 'var(--red)' : 'var(--text-primary)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font)' }}>
                {DISCIPLINE_LABELS[d]}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Ciudad</label>
            <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Barcelona" style={inputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Tipo de contrato</label>
            <select value={durationType} onChange={(e) => setDurationType(e.target.value)} style={inputStyle}>
              <option value="">Seleccionar</option>
              <option value="permanent">Contrato fijo</option>
              <option value="temporary">Temporal</option>
              <option value="gig">Caché / Proyecto</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Fecha inicio</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Fecha fin</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={inputStyle} />
          </div>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer', fontFamily: 'var(--font)', color: 'var(--text-primary)' }}>
          <input type="checkbox" checked={isPaid} onChange={(e) => setIsPaid(e.target.checked)} />
          Oferta remunerada
        </label>

        {error && (
          <p style={{ color: 'var(--red)', fontSize: 13, background: 'var(--bg-highlight)', padding: '10px 14px', borderRadius: 8, fontFamily: 'var(--font)' }}>
            {error}
          </p>
        )}

        <button onClick={handleSubmit} disabled={submitting} style={{ padding: '13px', background: 'var(--red)', color: 'white', border: 'none', borderRadius: 'var(--radius-full)', fontWeight: 600, fontSize: 15, fontFamily: 'var(--font)', cursor: 'pointer', opacity: submitting ? 0.6 : 1 }}>
          {submitting ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  )
}
