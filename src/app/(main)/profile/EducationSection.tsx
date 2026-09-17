'use client'

import { useState, type CSSProperties } from 'react'
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

export default function EducationSection({
  education,
  userId,
}: Props) {
  const router = useRouter()

  // Mantiene estable la instancia de Supabase.
  const [supabase] = useState(() => createClient())

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [institution, setInstitution] = useState('')
  const [title, setTitle] = useState('')
  const [discipline, setDiscipline] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const inputStyle: CSSProperties = {
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

  function clearFields() {
    setInstitution('')
    setTitle('')
    setDiscipline('')
    setStartDate('')
    setEndDate('')
    setError(null)
  }

  function resetForm() {
    clearFields()
    setShowForm(false)
    setEditingId(null)
  }

  function handleToggleAdd() {
    if (showForm) {
      resetForm()
      return
    }

    clearFields()
    setEditingId(null)
    setShowForm(true)
  }

  function startEdit(item: EducationItem) {
    setEditingId(item.id)
    setTitle(item.title)
    setInstitution(item.institution)
    setDiscipline(item.discipline ?? '')
    setStartDate(item.start_date)
    setEndDate(item.end_date ?? '')
    setShowForm(false)
    setError(null)
  }

  async function handleAdd() {
    if (!institution.trim() || !title.trim() || !startDate) return

    setSaving(true)
    setError(null)

    const { error: insertError } = await supabase
      .from('education')
      .insert({
        user_id: userId,
        institution: institution.trim(),
        title: title.trim(),
        discipline: discipline.trim() || null,
        start_date: startDate,
        end_date: endDate || null,
      })

    if (insertError) {
      setError(insertError.message)
      setSaving(false)
      return
    }

    setSaving(false)
    resetForm()
    router.refresh()
  }

  async function handleUpdate() {
    if (
      !institution.trim() ||
      !title.trim() ||
      !startDate ||
      !editingId
    ) {
      return
    }

    setSaving(true)
    setError(null)

    const { error: updateError } = await supabase
      .from('education')
      .update({
        institution: institution.trim(),
        title: title.trim(),
        discipline: discipline.trim() || null,
        start_date: startDate,
        end_date: endDate || null,
      })
      .eq('id', editingId)
      .eq('user_id', userId)

    if (updateError) {
      setError(updateError.message)
      setSaving(false)
      return
    }

    setSaving(false)
    resetForm()
    router.refresh()
  }

  async function handleDelete(id: string) {
    setError(null)

    const { error: deleteError } = await supabase
      .from('education')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (deleteError) {
      setError(deleteError.message)
      return
    }

    router.refresh()
  }

  /*
   * Función de renderizado.
   * Se utiliza como renderEducationForm(), no como <EditForm />.
   */
  function renderEducationForm() {
    const formIsInvalid =
      !institution.trim() ||
      !title.trim() ||
      !startDate

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          padding: 16,
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-md)',
          border: '0.5px solid var(--border)',
        }}
      >
        <input
          type="text"
          placeholder="Título o curso *"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          style={inputStyle}
        />

        <input
          type="text"
          placeholder="Centro de formación *"
          value={institution}
          onChange={(event) => setInstitution(event.target.value)}
          style={inputStyle}
        />

        <input
          type="text"
          placeholder="Disciplina (opcional)"
          value={discipline}
          onChange={(event) => setDiscipline(event.target.value)}
          style={inputStyle}
        />

        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <label
              style={{
                display: 'block',
                marginBottom: 4,
                fontSize: 12,
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font)',
              }}
            >
              Desde *
            </label>

            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={{ flex: 1 }}>
            <label
              style={{
                display: 'block',
                marginBottom: 4,
                fontSize: 12,
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font)',
              }}
            >
              Hasta (vacío si actual)
            </label>

            <input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        {error && (
          <p
            style={{
              margin: 0,
              color: 'var(--red)',
              fontSize: 13,
              fontFamily: 'var(--font)',
            }}
          >
            {error}
          </p>
        )}

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={resetForm}
            disabled={saving}
            style={{
              flex: 1,
              padding: '10px',
              background: 'white',
              color: 'var(--text-secondary)',
              border: '0.5px solid var(--border)',
              borderRadius: 'var(--radius-full)',
              fontFamily: 'var(--font)',
              fontSize: 14,
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.6 : 1,
            }}
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={editingId ? handleUpdate : handleAdd}
            disabled={saving || formIsInvalid}
            style={{
              flex: 2,
              padding: '10px',
              background: 'var(--red)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              fontFamily: 'var(--font)',
              fontSize: 14,
              fontWeight: 500,
              cursor:
                saving || formIsInvalid
                  ? 'not-allowed'
                  : 'pointer',
              opacity: saving || formIsInvalid ? 0.5 : 1,
            }}
          >
            {saving
              ? 'Guardando...'
              : editingId
                ? 'Guardar cambios'
                : 'Guardar formación'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <section style={{ marginBottom: 24 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <h2
          style={{
            fontSize: 18,
            fontWeight: 700,
            fontFamily: 'var(--font)',
            color: 'var(--text-primary)',
          }}
        >
          Educación
        </h2>

        <button
          type="button"
          onClick={handleToggleAdd}
          disabled={saving}
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: 'var(--red)',
            background: 'none',
            border: 'none',
            cursor: saving ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--font)',
            opacity: saving ? 0.6 : 1,
          }}
        >
          {showForm ? 'Cancelar' : '+ Añadir'}
        </button>
      </div>

      {education.length === 0 && !showForm && !editingId && (
        <p
          style={{
            fontSize: 13,
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font)',
          }}
        >
          Aún no has añadido formación
        </p>
      )}

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          marginBottom: showForm ? 16 : 0,
        }}
      >
        {education.map((item) => (
          <div key={item.id}>
            {editingId === item.id ? (
              renderEducationForm()
            ) : (
              <div
                style={{
                  position: 'relative',
                  padding: '12px 16px',
                  background: 'white',
                  border: '0.5px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 12,
                    right: 14,
                    display: 'flex',
                    gap: 10,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => startEdit(item)}
                    disabled={saving}
                    style={{
                      fontSize: 12,
                      color: 'var(--text-secondary)',
                      background: 'none',
                      border: 'none',
                      cursor: saving ? 'not-allowed' : 'pointer',
                      fontFamily: 'var(--font)',
                      fontWeight: 500,
                    }}
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    disabled={saving}
                    style={{
                      fontSize: 12,
                      color: 'var(--red)',
                      background: 'none',
                      border: 'none',
                      cursor: saving ? 'not-allowed' : 'pointer',
                      fontFamily: 'var(--font)',
                      fontWeight: 500,
                    }}
                  >
                    Eliminar
                  </button>
                </div>

                <p
                  style={{
                    fontWeight: 600,
                    fontSize: 14,
                    fontFamily: 'var(--font)',
                    color: 'var(--text-primary)',
                    paddingRight: 100,
                  }}
                >
                  {item.title}
                </p>

                <p
                  style={{
                    marginTop: 2,
                    fontSize: 13,
                    color: 'var(--red)',
                    fontFamily: 'var(--font)',
                  }}
                >
                  {item.institution}
                </p>

                {item.discipline && (
                  <p
                    style={{
                      marginTop: 3,
                      fontSize: 12,
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font)',
                    }}
                  >
                    {item.discipline}
                  </p>
                )}

                <p
                  style={{
                    marginTop: 3,
                    fontSize: 12,
                    color: 'var(--text-secondary)',
                    fontFamily: 'var(--font)',
                  }}
                >
                  {item.start_date} — {item.end_date ?? 'Actual'}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {showForm && renderEducationForm()}

      {error && !showForm && !editingId && (
        <p
          style={{
            marginTop: 12,
            color: 'var(--red)',
            fontSize: 13,
            fontFamily: 'var(--font)',
          }}
        >
          {error}
        </p>
      )}
    </section>
  )
}