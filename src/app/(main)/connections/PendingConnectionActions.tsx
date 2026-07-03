'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PendingConnectionActions({ connectionId }: { connectionId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleAction(action: 'accept' | 'reject') {
    setLoading(true)
    await fetch('/api/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, connectionId }),
    })
    setLoading(false)
    router.refresh()
  }

  return (
    <div style={{ display: 'flex', gap: 6 }}>
      <button
        onClick={() => handleAction('accept')}
        disabled={loading}
        style={{
          padding: '6px 12px',
          background: '#B00020',
          color: 'white',
          border: 'none',
          borderRadius: 6,
          fontSize: 12,
          cursor: 'pointer',
        }}
      >
        Aceptar
      </button>
      <button
        onClick={() => handleAction('reject')}
        disabled={loading}
        style={{
          padding: '6px 12px',
          background: 'white',
          color: '#333',
          border: '1px solid #ddd',
          borderRadius: 6,
          fontSize: 12,
          cursor: 'pointer',
        }}
      >
        Rechazar
      </button>
    </div>
  )
}
