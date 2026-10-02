'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface Props {
  bookingId: string
  currentStatus: string
}

export default function BookingActions({ bookingId, currentStatus }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function updateStatus(status: string) {
    setLoading(true)
    try {
      await fetch(`/api/formations/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      router.refresh()
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  if (currentStatus === 'cancelled') return null

  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      {currentStatus !== 'confirmed' && (
        <button
          onClick={() => updateStatus('confirmed')}
          disabled={loading}
          style={{
            fontSize: 12,
            fontWeight: 600,
            padding: '5px 12px',
            borderRadius: 8,
            border: '1px solid #16a34a',
            background: loading ? '#f0fdf4' : '#fff',
            color: '#16a34a',
            cursor: loading ? 'not-allowed' : 'pointer',
            whiteSpace: 'nowrap',
            transition: 'background 0.15s',
          }}
        >
          ✓ Confirmar
        </button>
      )}
      {currentStatus !== 'cancelled' && (
        <button
          onClick={() => updateStatus('cancelled')}
          disabled={loading}
          style={{
            fontSize: 12,
            fontWeight: 600,
            padding: '5px 12px',
            borderRadius: 8,
            border: '1px solid #e5e7eb',
            background: loading ? '#fafafa' : '#fff',
            color: '#9ca3af',
            cursor: loading ? 'not-allowed' : 'pointer',
            whiteSpace: 'nowrap',
            transition: 'background 0.15s',
          }}
        >
          Cancelar
        </button>
      )}
    </div>
  )
}
