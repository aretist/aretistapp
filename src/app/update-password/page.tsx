'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function UpdatePasswordPage() {
  const router = useRouter()
  const supabase = createClient()
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setError('Error al actualizar la contraseña. El enlace puede haber expirado.')
      setLoading(false)
      return
    }

    router.push('/feed')
    router.refresh()
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    border: '1px solid #E0D4D7',
    borderRadius: 10,
    fontFamily: 'var(--font, DM Sans, sans-serif)',
    fontSize: 15,
    color: '#111111',
    background: '#F9F4F5',
    outline: 'none',
    boxSizing: 'border-box',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F9F4F5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: 'white', borderRadius: 16, padding: '36px 32px', width: '100%', maxWidth: 420, border: '0.5px solid #E0D4D7' }}>
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 26, fontWeight: 700, color: '#B00020', fontFamily: 'var(--font, DM Sans, sans-serif)', letterSpacing: '-0.5px', marginBottom: 4 }}>
            aretist
          </p>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111111', fontFamily: 'var(--font, DM Sans, sans-serif)', marginBottom: 4 }}>
            Nueva contraseña
          </h1>
          <p style={{ fontSize: 14, color: '#5C4B50', fontFamily: 'var(--font, DM Sans, sans-serif)' }}>
            Introduce tu nueva contraseña
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500, color: '#111111', fontFamily: 'var(--font, DM Sans, sans-serif)' }}>
              Nueva contraseña
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                style={{ ...inputStyle, paddingRight: 48 }}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#5C4B50', display: 'flex', alignItems: 'center' }}>
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <p style={{ color: '#B00020', fontSize: 13, fontFamily: 'var(--font, DM Sans, sans-serif)', background: '#FFF0F2', padding: '10px 14px', borderRadius: 8 }}>
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} style={{ padding: '13px', background: '#B00020', color: 'white', border: 'none', borderRadius: 999, fontWeight: 600, fontSize: 15, fontFamily: 'var(--font, DM Sans, sans-serif)', cursor: 'pointer', opacity: loading ? 0.6 : 1, transition: 'opacity 0.15s' }}>
            {loading ? 'Guardando...' : 'Guardar nueva contraseña'}
          </button>
        </form>
      </div>
    </div>
  )
}
