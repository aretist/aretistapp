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
      .update({ roles: selectedRoles, city, bio })
      .eq('id', user.id)

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    // 2. Crear subperfil de artista / profesor
    if (selectedRoles.includes('artist') || selectedRoles.includes('teacher')) {
      const { error: artistError } = await supabase
        .from('artist_profiles')
        .upsert({ user_id: user.id, disciplines })

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
        .upsert({ user_id: user.id, company_name: companyName || 'Sin nombre' })

      if (employerError) {
        setError(employerError.message)
        setLoading(false)
        return
      }
    }

    // 4. Obtener username y enviar email de bienvenida
    const { data: profile } = await supabase
      .from('users')
      .select('username, full_name')
      .eq('id', user.id)
      .single()

    if (profile && user.email) {
      try {
        await fetch('/api/emails/welcome', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            fullName: profile.full_name,
            username: profile.username,
          }),
        })
      } catch {
        // El email falla silenciosamente — no bloqueamos el flujo
      }
    }

    router.push('/feed')
    router.refresh()
  }

  const chipActive: React.CSSProperties = {
    textAlign: 'left',
    padding: 16,
    borderRadius: 10,
    border: '2px solid #B00020',
    background: '#FFF0F2',
    cursor: 'pointer',
    width: '100%',
  }

  const chipInactive: React.CSSProperties = {
    textAlign: 'left',
    padding: 16,
    borderRadius: 10,
    border: '1px solid #E0D4D7',
    background: 'white',
    cursor: 'pointer',
    width: '100%',
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #E0D4D7',
    borderRadius: 10,
    fontFamily: 'var(--font, DM Sans, sans-serif)',
    fontSize: 14,
    color: '#111111',
    background: '#F9F4F5',
    outline: 'none',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F9F4F5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: 'white', borderRadius: 16, padding: '36px 32px', width: '100%', maxWidth: 480, border: '0.5px solid #E0D4D7' }}>

        <p style={{ fontSize: 22, fontWeight: 700, color: '#B00020', fontFamily: 'var(--font, DM Sans, sans-serif)', letterSpacing: '-0.5px', marginBottom: 20 }}>
          aretist
        </p>

        {step === 'role' && (
          <>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111111', fontFamily: 'var(--font, DM Sans, sans-serif)', marginBottom: 6 }}>
              ¿Cómo participas en Aretist?
            </h1>
            <p style={{ fontSize: 14, color: '#5C4B50', fontFamily: 'var(--font, DM Sans, sans-serif)', marginBottom: 24, lineHeight: 1.5 }}>
              Puedes elegir más de una opción. Lo más habitual es combinar artista y profesor.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
              {[
                { value: 'artist' as Role, title: 'Artista', desc: 'Bailarín/a, actor/actriz, cantante, circense...' },
                { value: 'teacher' as Role, title: 'Profesor/a / Escuela', desc: 'Imparto formaciones y talleres' },
                { value: 'employer' as Role, title: 'Empleador', desc: 'Compañía, productora, festival' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => toggleRole(opt.value)}
                  style={selectedRoles.includes(opt.value) ? chipActive : chipInactive}
                >
                  <div style={{ fontWeight: 600, fontSize: 14, color: selectedRoles.includes(opt.value) ? '#B00020' : '#111111', fontFamily: 'var(--font, DM Sans, sans-serif)' }}>
                    {opt.title}
                  </div>
                  <div style={{ fontSize: 13, color: '#5C4B50', marginTop: 2, fontFamily: 'var(--font, DM Sans, sans-serif)' }}>
                    {opt.desc}
                  </div>
                </button>
              ))}
            </div>

            <button
              disabled={selectedRoles.length === 0}
              onClick={() => setStep('details')}
              style={{
                width: '100%',
                padding: 13,
                background: selectedRoles.length === 0 ? '#E0D4D7' : '#B00020',
                color: 'white',
                border: 'none',
                borderRadius: 999,
                fontWeight: 600,
                fontSize: 15,
                fontFamily: 'var(--font, DM Sans, sans-serif)',
                cursor: selectedRoles.length === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              Continuar
            </button>
          </>
        )}

        {step === 'details' && (
          <>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111111', fontFamily: 'var(--font, DM Sans, sans-serif)', marginBottom: 6 }}>
              Cuéntanos un poco más
            </h1>
            <p style={{ fontSize: 14, color: '#5C4B50', fontFamily: 'var(--font, DM Sans, sans-serif)', marginBottom: 24 }}>
              Esto ayuda a que te encuentren más fácilmente.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500, color: '#111111', fontFamily: 'var(--font, DM Sans, sans-serif)' }}>
                  Ciudad
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Barcelona"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500, color: '#111111', fontFamily: 'var(--font, DM Sans, sans-serif)' }}>
                  Bio corta
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  placeholder="Cuéntanos quién eres en pocas palabras"
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>

              {(selectedRoles.includes('artist') || selectedRoles.includes('teacher')) && (
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500, color: '#111111', fontFamily: 'var(--font, DM Sans, sans-serif)' }}>
                    Disciplinas
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {DISCIPLINES.map((d) => (
                      <button
                        key={d.value}
                        onClick={() => toggleDiscipline(d.value)}
                        style={{
                          padding: '7px 16px',
                          borderRadius: 999,
                          border: disciplines.includes(d.value) ? '1.5px solid #B00020' : '1px solid #E0D4D7',
                          background: disciplines.includes(d.value) ? '#FFF0F2' : 'white',
                          color: disciplines.includes(d.value) ? '#B00020' : '#111111',
                          fontSize: 13,
                          fontWeight: 500,
                          fontFamily: 'var(--font, DM Sans, sans-serif)',
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
                  <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500, color: '#111111', fontFamily: 'var(--font, DM Sans, sans-serif)' }}>
                    Nombre de la compañía
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Compañía Vértice"
                    style={inputStyle}
                  />
                </div>
              )}
            </div>

            {error && (
              <p style={{ color: '#B00020', fontSize: 13, fontFamily: 'var(--font, DM Sans, sans-serif)', background: '#FFF0F2', padding: '10px 14px', borderRadius: 8, marginBottom: 16 }}>
                {error}
              </p>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setStep('role')}
                style={{
                  padding: '13px 20px',
                  background: 'white',
                  color: '#111111',
                  border: '1px solid #E0D4D7',
                  borderRadius: 999,
                  fontFamily: 'var(--font, DM Sans, sans-serif)',
                  fontSize: 14,
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
                  padding: 13,
                  background: '#B00020',
                  color: 'white',
                  border: 'none',
                  borderRadius: 999,
                  fontWeight: 600,
                  fontSize: 15,
                  fontFamily: 'var(--font, DM Sans, sans-serif)',
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
    </div>
  )
}
