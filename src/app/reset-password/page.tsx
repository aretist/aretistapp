'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    })

    if (resetError) {
      setError('Error al enviar el email. Comprueba que el email es correcto.')
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
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
            Recuperar contraseña
          </h1>
          <p style={{ fontSize: 14, color: '#5C4B50', fontFamily: 'var(--font, DM Sans, sans-serif)' }}>
            Te enviaremos un enlace para restablecer tu contraseña
          </p>
        </div>

        {sent ? (
          <div>
            <div style={{ background: '#E8F5EE', borderRadius: 10, padding: '16px', marginBottom: 20 }}>
              <p style={{ fontSize: 14, color: '#1B6B3A', fontFamily: 'var(--font, DM Sans, sans-serif)', fontWeight: 500 }}>
                ✓ Email enviado
              </p>
              <p style={{ fontSize: 13, color: '#1B6B3A', fontFamily: 'var(--font, DM Sans, sans-serif)', marginTop: 4 }}>
                Revisa tu bandeja de entrada en <strong>{email}</strong> y sigue las instrucciones.
              </p>
            </div>
            <Link href="/login" style={{ display: 'block', textAlign: 'center', padding: '13px', background: '#B00020', color: 'white', border: 'none', borderRadius: 999, fontWeight: 600, fontSize: 15, fontFamily: 'var(--font, DM Sans, sans-serif)', textDecoration: 'none' }}>
              Volver al inicio de sesión
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500, color: '#111111', fontFamily: 'var(--font, DM Sans, sans-serif)' }}>
                Email
              </label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="laura@ejemplo.com" style={inputStyle} />
            </div>

            {error && (
              <p style={{ color: '#B00020', fontSize: 13, fontFamily: 'var(--font, DM Sans, sans-serif)', background: '#FFF0F2', padding: '10px 14px', borderRadius: 8 }}>
                {error}
              </p>
            )}

            <button type="submit" disabled={loading} style={{ padding: '13px', background: '#B00020', color: 'white', border: 'none', borderRadius: 999, fontWeight: 600, fontSize: 15, fontFamily: 'var(--font, DM Sans, sans-serif)', cursor: 'pointer', opacity: loading ? 0.6 : 1, transition: 'opacity 0.15s' }}>
              {loading ? 'Enviando...' : 'Enviar enlace'}
            </button>

            <p style={{ textAlign: 'center', fontSize: 14, color: '#5C4B50', fontFamily: 'var(--font, DM Sans, sans-serif)' }}>
              <Link href="/login" style={{ color: '#B00020', fontWeight: 500, textDecoration: 'none' }}>
                ← Volver al inicio de sesión
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
