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

    if (!res.ok) {
      setError(data.error)
      setLoading(false)
      return
    }

    if (action === 'save') setSaved(data.saved)
    if (action === 'apply') setApplied(true)

    setLoading(false)
    router.refresh()
  }

  if (isOwnJob) {
    return (
      <p style={{ fontSize: 13, color: '#999' }}>Esta es tu propia oferta</p>
    )
  }

  if (applied) {
    return (
      <div style={{ padding: 16, background: '#EAF3DE', borderRadius: 8 }}>
        <p style={{ fontSize: 14, color: '#27500A', fontWeight: 500 }}>
          ✓ Has aplicado a esta oferta
        </p>
        <p style={{ fontSize: 13, color: '#3B6D11', marginTop: 4 }}>
          El empleador puede ver tu perfil completo y ponerse en contacto contigo.
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', gap: 10 }}>
      <button
        onClick={() => handleAction('save')}
        disabled={loading}
        style={{
          padding: '10px 18px',
          background: 'white',
          color: saved ? '#534AB7' : '#333',
          border: `1px solid ${saved ? '#534AB7' : '#ddd'}`,
          borderRadius: 6,
          fontSize: 14,
          cursor: 'pointer',
        }}
      >
        {saved ? '★ Guardado' : '☆ Guardar'}
      </button>

      <button
        onClick={() => handleAction('apply')}
        disabled={loading}
        style={{
          flex: 1,
          padding: '10px 18px',
          background: '#534AB7',
          color: 'white',
          border: 'none',
          borderRadius: 6,
          fontSize: 14,
          fontWeight: 500,
          cursor: 'pointer',
          opacity: loading ? 0.6 : 1,
        }}
      >
        Aplicar a esta oferta
      </button>

      {error && <p style={{ color: '#c00', fontSize: 13 }}>{error}</p>}
    </div>
  )
}
