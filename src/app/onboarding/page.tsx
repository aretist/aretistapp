'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Role = 'artist' | 'teacher' | 'employer'

const DISCIPLINES = [
  { value: 'dance', label: 'Danza' },
  { value: 'theater', label: 'Teatro' },
  { value: 'singing', label: 'Canto' },
  { value: 'circus', label: 'Circo' },
  { value: 'opera', label: 'Ópera' },
  { value: 'music', label: 'Música' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<'role' | 'details'>('role')
  const [selectedRoles, setSelectedRoles] = useState<Role[]>([])
  const [city, setCity] = useState('')
  const [bio, setBio] = useState('')
  const [disciplines, setDisciplines] = useState<string[]>([])
  const [companyName, setCompanyName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggleRole(role: Role) {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    )
  }

  function toggleDiscipline(value: string) {
    setDisciplines((prev) =>
      prev.includes(value) ? prev.filter((d) => d !== value) : [...prev, value]
    )
  }

  async function handleFinish() {
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('No hay sesión activa. Vuelve a iniciar sesión.')
      setLoading(false)
      return
    }

    // 1. Actualizar perfil base
    const { error: updateError } = await supabase
      .from('users')
      .update({
        roles: selectedRoles,
        city,
        bio,
      })
      .eq('id', user.id)

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    // 2. Crear subperfil de artista (también cubre profesores que son artistas)
    if (selectedRoles.includes('artist') || selectedRoles.includes('teacher')) {
      const { error: artistError } = await supabase
        .from('artist_profiles')
        .upsert({
          user_id: user.id,
          disciplines,
        })

      if (artistError) {
        setError(artistError.message)
        setLoading(false)
        return
      }
    }

    // 3. Crear subperfil de empleador
    if (selectedRoles.includes('employer')) {
      const { error: employerError } = await supabase
        .from('employer_profiles')
        .upsert({
          user_id: user.id,
          company_name: companyName || 'Sin nombre',
        })

      if (employerError) {
        setError(employerError.message)
        setLoading(false)
        return
      }
    }

    router.push('/feed')
    router.refresh()
  }

  return (
    <div style={{ maxWidth: 480, margin: '60px auto', padding: '0 20px' }}>
      {step === 'role' && (
        <>
          <h1 style={{ fontSize: 28, fontWeight: 600, marginBottom: 8 }}>
            ¿Cómo participas en Aretist?
          </h1>
          <p style={{ color: '#666', marginBottom: 24 }}>
            Puedes elegir más de una opción. Lo más habitual es combinar artista y profesor.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
            {[
              { value: 'artist' as Role, title: 'Artista', desc: 'Bailarín, actor, cantante, circense...' },
              { value: 'teacher' as Role, title: 'Profesor / Escuela', desc: 'Imparto formaciones y talleres' },
              { value: 'employer' as Role, title: 'Empleador', desc: 'Compañía, productora, festival' },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => toggleRole(opt.value)}
                style={{
                  textAlign: 'left',
                  padding: 16,
                  borderRadius: 8,
                  border: selectedRoles.includes(opt.value) ? '2px solid #534AB7' : '1px solid #ddd',
                  background: selectedRoles.includes(opt.value) ? '#EEEDFE' : 'white',
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontWeight: 600 }}>{opt.title}</div>
                <div style={{ fontSize: 13, color: '#666', marginTop: 2 }}>{opt.desc}</div>
              </button>
            ))}
          </div>

          <button
            disabled={selectedRoles.length === 0}
            onClick={() => setStep('details')}
            style={{
              width: '100%',
              padding: 12,
              background: selectedRoles.length === 0 ? '#ccc' : '#534AB7',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              fontWeight: 500,
              cursor: selectedRoles.length === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            Continuar
          </button>
        </>
      )}

      {step === 'details' && (
        <>
          <h1 style={{ fontSize: 28, fontWeight: 600, marginBottom: 8 }}>
            Cuéntanos un poco más
          </h1>
          <p style={{ color: '#666', marginBottom: 24 }}>
            Esto ayuda a que te encuentren más fácilmente.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>Ciudad</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Barcelona"
                style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 6 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>Bio corta</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="Cuéntanos quién eres en pocas palabras"
                style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 6, resize: 'vertical' }}
              />
            </div>

            {(selectedRoles.includes('artist') || selectedRoles.includes('teacher')) && (
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14 }}>Disciplinas</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {DISCIPLINES.map((d) => (
                    <button
                      key={d.value}
                      onClick={() => toggleDiscipline(d.value)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 20,
                        border: disciplines.includes(d.value) ? '1px solid #534AB7' : '1px solid #ddd',
                        background: disciplines.includes(d.value) ? '#EEEDFE' : 'white',
                        color: disciplines.includes(d.value) ? '#3C3489' : '#333',
                        fontSize: 13,
                        cursor: 'pointer',
                      }}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedRoles.includes('employer') && (
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>Nombre de la compañía</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Compañía Vértice"
                  style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 6 }}
                />
              </div>
            )}
          </div>

          {error && <p style={{ color: '#c00', fontSize: 14, marginBottom: 16 }}>{error}</p>}

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => setStep('role')}
              style={{
                padding: 12,
                background: 'white',
                color: '#333',
                border: '1px solid #ddd',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              Atrás
            </button>
            <button
              onClick={handleFinish}
              disabled={loading}
              style={{
                flex: 1,
                padding: 12,
                background: '#534AB7',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                fontWeight: 500,
                cursor: 'pointer',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? 'Guardando...' : 'Finalizar y entrar'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
