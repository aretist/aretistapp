'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Application {
  id: string
  status: string
  saved: boolean
}

interface Props {
  jobId: string
  application: Application | null
  currentUserId: string
  employerId: string
}

export default function JobActions({ jobId, application, currentUserId, employerId }: Props) {
  const router = useRouter()
  const [saved, setSaved] = useState(application?.saved ?? false)
  const [applied, setApplied] = useState(application?.status === 'applied')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isOwnJob = currentUserId === employerId

  async function handleAction(action: 'save' | 'apply') {
    setLoading(true)
    setError(null)
    const res = await fetch('/api/jobs/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId, action }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); setLoading(false); return }
    if (action === 'save') setSaved(data.saved)
    if (action === 'apply') setApplied(true)
    setLoading(false)
    router.refresh()
  }

  if (isOwnJob) {
    return <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'var(--font)' }}>Esta es tu propia oferta</p>
  }

  if (applied) {
    return (
      <div style={{
        padding: 16,
        background: 'var(--success-bg)',
        borderRadius: 'var(--radius-md)',
        border: '0.5px solid var(--border)',
      }}>
        <p style={{ fontSize: 14, color: 'var(--success-text)', fontWeight: 600, fontFamily: 'var(--font)' }}>
          ✓ Has aplicado a esta oferta
        </p>
        <p style={{ fontSize: 13, color: 'var(--success-text)', marginTop: 4, fontFamily: 'var(--font)' }}>
          El empleador puede ver tu perfil y ponerse en contacto.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          onClick={() => handleAction('save')}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '11px 20px',
            background: 'white',
            color: saved ? 'var(--red)' : 'var(--text-primary)',
            border: `1.5px solid ${saved ? 'var(--red)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-full)',
            fontSize: 14,
            fontWeight: 500,
            fontFamily: 'var(--font)',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill={saved ? 'var(--red)' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
          </svg>
          {saved ? 'Guardado' : 'Guardar'}
        </button>

        <button
          onClick={() => handleAction('apply')}
          disabled={loading}
          style={{
            flex: 1,
            padding: '11px 20px',
            background: 'var(--red)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-full)',
            fontSize: 14,
            fontWeight: 500,
            fontFamily: 'var(--font)',
            cursor: 'pointer',
            opacity: loading ? 0.6 : 1,
            transition: 'opacity 0.15s, background 0.15s',
          }}
        >
          {loading ? 'Enviando...' : 'Me interesa — Aplicar'}
        </button>
      </div>
      {error && <p style={{ color: 'var(--red)', fontSize: 13, marginTop: 8, fontFamily: 'var(--font)' }}>{error}</p>}
    </div>
  )
}
