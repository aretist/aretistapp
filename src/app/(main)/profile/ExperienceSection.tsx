'use client'

import { useState, type CSSProperties } from 'react'
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

export default function ExperienceSection({
  experiences,
  userId,
}: Props) {
  const router = useRouter()

  // Mantiene la misma instancia de Supabase durante los renders.
  const [supabase] = useState(() => createClient())

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [company, setCompany] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [description, setDescription] = useState('')
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
    setTitle('')
    setCompany('')
    setStartDate('')
    setEndDate('')
    setDescription('')
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

  function startEdit(exp: Experience) {
    setEditingId(exp.id)
    setTitle(exp.title)
    setCompany(exp.company)
    setStartDate(exp.start_date)
    setEndDate(exp.end_date ?? '')
    setDescription(exp.description ?? '')
    setShowForm(false)
    setError(null)
  }

  async function handleAdd() {
    if (!title.trim() || !company.trim() || !startDate) return

    setSaving(true)
    setError(null)

    const { error: insertError } = await supabase
      .from('experiences')
      .insert({
        user_id: userId,
        title: title.trim(),
        company: company.trim(),
        start_date: startDate,
        end_date: endDate || null,
        description: description.trim() || null,
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
      !title.trim() ||
      !company.trim() ||
      !startDate ||
      !editingId
    ) {
      return
    }

    setSaving(true)
    setError(null)

    const { error: updateError } = await supabase
      .from('experiences')
      .update({
        title: title.trim(),
        company: company.trim(),
        start_date: startDate,
        end_date: endDate || null,
        description: description.trim() || null,
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
      .from('experiences')
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
   * Es una función de renderizado, no un componente React interno.
   * Debe utilizarse como renderEditForm(), no como <EditForm />.
   */
  function renderEditForm() {
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
          placeholder="Puesto o rol *"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          style={inputStyle}
        />

        <input
          type="text"
          placeholder="Compañía *"
          value={company}
          onChange={(event) => setCompany(event.target.value)}
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

        <textarea
          placeholder="Descripción (opcional)"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={2}
          style={{
            ...inputStyle,
            resize: 'vertical',
          }}
        />

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
            disabled={
              saving ||
              !title.trim() ||
              !company.trim() ||
              !startDate
            }
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
                saving ||
                !title.trim() ||
                !company.trim() ||
                !startDate
                  ? 'not-allowed'
                  : 'pointer',
              opacity:
                saving ||
                !title.trim() ||
                !company.trim() ||
                !startDate
                  ? 0.5
                  : 1,
            }}
          >
            {saving
              ? 'Guardando...'
              : editingId
                ? 'Guardar cambios'
                : 'Guardar experiencia'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <section
      style={{
        marginBottom: 40,
        paddingBottom: 32,
        borderBottom: '0.5px solid var(--border)',
      }}
    >
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
          Experiencia
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

      {experiences.length === 0 && !showForm && !editingId && (
        <p
          style={{
            fontSize: 13,
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font)',
          }}
        >
          Aún no has añadido experiencia
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
        {experiences.map((experience) => (
          <div key={experience.id}>
            {editingId === experience.id ? (
              renderEditForm()
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
                    onClick={() => startEdit(experience)}
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
                    onClick={() => handleDelete(experience.id)}
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
                  {experience.title}
                </p>

                <p
                  style={{
                    fontSize: 13,
                    color: 'var(--red)',
                    fontFamily: 'var(--font)',
                    marginTop: 2,
                  }}
                >
                  {experience.company}
                </p>

                <p
                  style={{
                    fontSize: 12,
                    color: 'var(--text-secondary)',
                    fontFamily: 'var(--font)',
                    marginTop: 3,
                  }}
                >
                  {experience.start_date} —{' '}
                  {experience.end_date ?? 'Actual'}
                </p>

                {experience.description && (
                  <p
                    style={{
                      fontSize: 13,
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font)',
                      marginTop: 6,
                      lineHeight: 1.5,
                    }}
                  >
                    {experience.description}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {showForm && renderEditForm()}

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