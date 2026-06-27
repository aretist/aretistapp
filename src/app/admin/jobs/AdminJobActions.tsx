'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  jobId: string
  currentStatus?: string
}

export default function AdminJobActions({ jobId, currentStatus = 'pending' }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleAction(status: 'published' | 'rejected' | 'pending') {
    setLoading(true)

    await fetch('/api/jobs', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId, status }),
    })

    setLoading(false)
    router.refresh()
  }

  if (currentStatus === 'pending') {
    return (
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <button
          onClick={() => handleAction('published')}
          disabled={loading}
          style={{
            padding: '7px 14px',
            background: '#1D9E75',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Aprobar
        </button>
        <button
          onClick={() => handleAction('rejected')}
          disabled={loading}
          style={{
            padding: '7px 14px',
            background: 'white',
            color: '#c00',
            border: '1px solid #c00',
            borderRadius: 6,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Rechazar
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => handleAction('pending')}
      disabled={loading}
      style={{
        padding: '6px 12px',
        background: 'white',
        color: '#666',
        border: '1px solid #ddd',
        borderRadius: 6,
        fontSize: 12,
        cursor: 'pointer',
      }}
    >
      Despublicar
    </button>
  )
}
