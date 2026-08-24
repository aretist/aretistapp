'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function MarkAllReadButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleMarkAllRead() {
    setLoading(true)
    await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    setLoading(false)
    router.refresh()
  }

  return (
    <button
      onClick={handleMarkAllRead}
      disabled={loading}
      style={{
        fontSize: 12,
        fontWeight: 500,
        color: 'var(--red)',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontFamily: 'var(--font)',
        opacity: loading ? 0.6 : 1,
      }}
    >
      Marcar todas como leídas
    </button>
  )
}
