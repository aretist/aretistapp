'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()

  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          username: username.toLowerCase().trim(),
        },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    router.push('/onboarding')
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

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: 6,
    fontSize: 14,
    fontWeight: 500,
    color: '#111111',
    fontFamily: 'var(--font, DM Sans, sans-serif)',
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F9F4F5',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        background: 'white',
        borderRadius: 16,
        padding: '36px 32px',
        width: '100%',
        maxWidth: 420,
        border: '0.5px solid #E0D4D7',
      }}>
        {/* Logo */}
        <div style={{ marginBottom: 28 }}>
          <p style={{
            fontSize: 26,
            fontWeight: 700,
            color: '#B00020',
            fontFamily: 'var(--font, DM Sans, sans-serif)',
            letterSpacing: '-0.5px',
            marginBottom: 4,
          }}>
            aretist
          </p>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111111', fontFamily: 'var(--font, DM Sans, sans-serif)', marginBottom: 4 }}>
            Crear cuenta
          </h1>
          <p style={{ fontSize: 14, color: '#5C4B50', fontFamily: 'var(--font, DM Sans, sans-serif)' }}>
            Únete a la comunidad de artistas
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>Nombre completo</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Laura García"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Nombre de usuario</label>
            <input
              type="text"
              required
              pattern="[a-z0-9_]+"
              placeholder="lauragarcia"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={inputStyle}
            />
            <p style={{ fontSize: 12, color: '#5C4B50', marginTop: 4, fontFamily: 'var(--font, DM Sans, sans-serif)' }}>
              Solo minúsculas, números y guiones bajos
            </p>
          </div>

          <div>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="laura@ejemplo.com"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Contraseña</label>
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
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 4,
                  color: '#5C4B50',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label="Ocultar contraseña">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label="Mostrar contraseña">
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

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '13px',
              background: '#B00020',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-full, 999px)',
              fontWeight: 600,
              fontSize: 15,
              fontFamily: 'var(--font, DM Sans, sans-serif)',
              cursor: 'pointer',
              opacity: loading ? 0.6 : 1,
              transition: 'opacity 0.15s',
              marginTop: 4,
            }}
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p style={{ marginTop: 20, fontSize: 14, color: '#5C4B50', textAlign: 'center', fontFamily: 'var(--font, DM Sans, sans-serif)' }}>
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" style={{ color: '#B00020', fontWeight: 500, textDecoration: 'none' }}>
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
