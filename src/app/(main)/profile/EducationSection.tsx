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
    setInstitution(''); setTitle(''); setDiscipline(''); setStartDate(''); setEndDate('')
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
    <section style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font)', color: 'var(--text-primary)' }}>Educación</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{ fontSize: 13, fontWeight: 500, color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font)' }}
        >
          {showForm ? 'Cancelar' : '+ Añadir'}
        </button>
      </div>

      {education.length === 0 && !showForm && (
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'var(--font)' }}>Aún no has añadido formación</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: showForm ? 16 : 0 }}>
        {education.map((edu) => (
          <div key={edu.id} style={{ padding: '12px 16px', background: 'white', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-md)', position: 'relative' }}>
            <button
              onClick={() => handleDelete(edu.id)}
              style={{ position: 'absolute', top: 12, right: 14, fontSize: 12, color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font)', fontWeight: 500 }}
            >
              Eliminar
            </button>
            <p style={{ fontWeight: 600, fontSize: 14, fontFamily: 'var(--font)', color: 'var(--text-primary)', paddingRight: 60 }}>{edu.title}</p>
            <p style={{ fontSize: 13, color: 'var(--red)', fontFamily: 'var(--font)', marginTop: 2 }}>{edu.institution}</p>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font)', marginTop: 3 }}>
              {edu.start_date} — {edu.end_date ?? 'Actual'}
            </p>
          </div>
        ))}
      </div>

      {showForm && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16, background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '0.5px solid var(--border)' }}>
          <input type="text" placeholder="Título o curso *" value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} />
          <input type="text" placeholder="Centro de formación *" value={institution} onChange={(e) => setInstitution(e.target.value)} style={inputStyle} />
          <input type="text" placeholder="Disciplina (opcional)" value={discipline} onChange={(e) => setDiscipline(e.target.value)} style={inputStyle} />
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
          <button
            onClick={handleAdd}
            disabled={saving || !institution || !title || !startDate}
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
              opacity: saving || !institution || !title || !startDate ? 0.5 : 1,
            }}
          >
            {saving ? 'Guardando...' : 'Guardar formación'}
          </button>
        </div>
      )}
    </section>
  )
}
