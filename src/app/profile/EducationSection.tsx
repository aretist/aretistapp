'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface EducationItem {
  id: string
  institution: string
  title: string
  discipline: string | null
  start_date: string
  end_date: string | null
}

interface Props {
  education: EducationItem[]
  userId: string
}

export default function EducationSection({ education, userId }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [showForm, setShowForm] = useState(false)
  const [institution, setInstitution] = useState('')
  const [title, setTitle] = useState('')
  const [discipline, setDiscipline] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [saving, setSaving] = useState(false)

  function resetForm() {
    setInstitution('')
    setTitle('')
    setDiscipline('')
    setStartDate('')
    setEndDate('')
    setShowForm(false)
  }

  async function handleAdd() {
    if (!institution || !title || !startDate) return
    setSaving(true)

    await supabase.from('education').insert({
      user_id: userId,
      institution,
      title,
      discipline: discipline || null,
      start_date: startDate,
      end_date: endDate || null,
    })

    setSaving(false)
    resetForm()
    router.refresh()
  }

  async function handleDelete(id: string) {
    await supabase.from('education').delete().eq('id', id)
    router.refresh()
  }

  return (
    <section style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600 }}>Educación</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{ fontSize: 13, color: '#534AB7', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          {showForm ? 'Cancelar' : '+ Añadir'}
        </button>
      </div>

      {education.length === 0 && !showForm && (
        <p style={{ fontSize: 13, color: '#999' }}>Aún no has añadido formación</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: showForm ? 20 : 0 }}>
        {education.map((edu) => (
          <div key={edu.id} style={{ padding: 12, background: '#fafafa', borderRadius: 8, position: 'relative' }}>
            <button
              onClick={() => handleDelete(edu.id)}
              style={{ position: 'absolute', top: 10, right: 10, fontSize: 12, color: '#c00', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Eliminar
            </button>
            <p style={{ fontWeight: 500, fontSize: 14 }}>{edu.title}</p>
            <p style={{ fontSize: 13, color: '#666' }}>{edu.institution}</p>
            <p style={{ fontSize: 12, color: '#999', marginTop: 2 }}>
              {edu.start_date} — {edu.end_date ?? 'Actual'}
            </p>
          </div>
        ))}
      </div>

      {showForm && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16, background: '#fafafa', borderRadius: 8 }}>
          <input
            type="text"
            placeholder="Título o curso"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ padding: 10, border: '1px solid #ddd', borderRadius: 6 }}
          />
          <input
            type="text"
            placeholder="Centro de formación"
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            style={{ padding: 10, border: '1px solid #ddd', borderRadius: 6 }}
          />
          <input
            type="text"
            placeholder="Disciplina (opcional)"
            value={discipline}
            onChange={(e) => setDiscipline(e.target.value)}
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
          <button
            onClick={handleAdd}
            disabled={saving || !institution || !title || !startDate}
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
            {saving ? 'Guardando...' : 'Guardar formación'}
          </button>
        </div>
      )}
    </section>
  )
}
