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
    setTitle('')
    setCompany('')
    setStartDate('')
    setEndDate('')
    setDescription('')
    setShowForm(false)
  }

  async function handleAdd() {
    if (!title || !company || !startDate) return
    setSaving(true)

    await supabase.from('experiences').insert({
      user_id: userId,
      title,
      company,
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

  return (
    <section style={{ marginBottom: 40, paddingBottom: 32, borderBottom: '1px solid #eee' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600 }}>Experiencia</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{ fontSize: 13, color: '#534AB7', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          {showForm ? 'Cancelar' : '+ Añadir'}
        </button>
      </div>

      {experiences.length === 0 && !showForm && (
        <p style={{ fontSize: 13, color: '#999' }}>Aún no has añadido experiencia</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: showForm ? 20 : 0 }}>
        {experiences.map((exp) => (
          <div key={exp.id} style={{ padding: 12, background: '#fafafa', borderRadius: 8, position: 'relative' }}>
            <button
              onClick={() => handleDelete(exp.id)}
              style={{ position: 'absolute', top: 10, right: 10, fontSize: 12, color: '#c00', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Eliminar
            </button>
            <p style={{ fontWeight: 500, fontSize: 14 }}>{exp.title}</p>
            <p style={{ fontSize: 13, color: '#666' }}>{exp.company}</p>
            <p style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
              {exp.start_date} — {exp.end_date ?? 'Actual'}
            </p>
            {exp.description && <p style={{ fontSize: 13, marginTop: 6 }}>{exp.description}</p>}
          </div>
        ))}
      </div>

      {showForm && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16, background: '#fafafa', borderRadius: 8 }}>
          <input
            type="text"
            placeholder="Puesto o rol"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ padding: 10, border: '1px solid #ddd', borderRadius: 6 }}
          />
          <input
            type="text"
            placeholder="Compañía"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            style={{ padding: 10, border: '1px solid #ddd', borderRadius: 6 }}
          />
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, color: '#666' }}>Desde</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 6 }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, color: '#666' }}>Hasta (vacío si es actual)</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 6 }}
              />
            </div>
          </div>
          <textarea
            placeholder="Descripción (opcional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            style={{ padding: 10, border: '1px solid #ddd', borderRadius: 6, resize: 'vertical' }}
          />
          <button
            onClick={handleAdd}
            disabled={saving || !title || !company || !startDate}
            style={{
              padding: 10,
              background: '#534AB7',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? 'Guardando...' : 'Guardar experiencia'}
          </button>
        </div>
      )}
    </section>
  )
}
