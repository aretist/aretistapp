'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Experience {
  id: string
  title: string
  company: string
  start_date: string
  end_date: string | null
  description: string | null
}

interface Props {
  experiences: Experience[]
  userId: string
}

export default function ExperienceSection({ experiences, userId }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [company, setCompany] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)

  function resetForm() {
    setTitle(''); setCompany(''); setStartDate(''); setEndDate(''); setDescription('')
    setShowForm(false)
  }

  async function handleAdd() {
    if (!title || !company || !startDate) return
    setSaving(true)
    await supabase.from('experiences').insert({
      user_id: userId, title, company,
      start_date: startDate,
      end_date: endDate || null,
      description: description || null,
    })
    setSaving(false)
    resetForm()
    router.refresh()
  }

  async function handleDelete(id: string) {
    await supabase.from('experiences').delete().eq('id', id)
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
  }

  return (
    <section style={{ marginBottom: 40, paddingBottom: 32, borderBottom: '0.5px solid var(--border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font)', color: 'var(--text-primary)' }}>Experiencia</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{ fontSize: 13, fontWeight: 500, color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font)' }}
        >
          {showForm ? 'Cancelar' : '+ Añadir'}
        </button>
      </div>

      {experiences.length === 0 && !showForm && (
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'var(--font)' }}>Aún no has añadido experiencia</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: showForm ? 16 : 0 }}>
        {experiences.map((exp) => (
          <div key={exp.id} style={{ padding: '12px 16px', background: 'white', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-md)', position: 'relative' }}>
            <button
              onClick={() => handleDelete(exp.id)}
              style={{ position: 'absolute', top: 12, right: 14, fontSize: 12, color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font)', fontWeight: 500 }}
            >
              Eliminar
            </button>
            <p style={{ fontWeight: 600, fontSize: 14, fontFamily: 'var(--font)', color: 'var(--text-primary)', paddingRight: 60 }}>{exp.title}</p>
            <p style={{ fontSize: 13, color: 'var(--red)', fontFamily: 'var(--font)', marginTop: 2 }}>{exp.company}</p>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font)', marginTop: 3 }}>
              {exp.start_date} — {exp.end_date ?? 'Actual'}
            </p>
            {exp.description && (
              <p style={{ fontSize: 13, color: 'var(--text-primary)', fontFamily: 'var(--font)', marginTop: 6, lineHeight: 1.5 }}>{exp.description}</p>
            )}
          </div>
        ))}
      </div>

      {showForm && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16, background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '0.5px solid var(--border)' }}>
          <input type="text" placeholder="Puesto o rol *" value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} />
          <input type="text" placeholder="Compañía *" value={company} onChange={(e) => setCompany(e.target.value)} style={inputStyle} />
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font)', display: 'block', marginBottom: 4 }}>Desde *</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font)', display: 'block', marginBottom: 4 }}>Hasta (vacío si actual)</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={inputStyle} />
            </div>
          </div>
          <textarea placeholder="Descripción (opcional)" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
          <button
            onClick={handleAdd}
            disabled={saving || !title || !company || !startDate}
            style={{
              padding: '10px',
              background: 'var(--red)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              fontFamily: 'var(--font)',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              opacity: saving || !title || !company || !startDate ? 0.5 : 1,
            }}
          >
            {saving ? 'Guardando...' : 'Guardar experiencia'}
          </button>
        </div>
      )}
    </section>
  )
}
