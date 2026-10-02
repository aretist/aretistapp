'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function BookingActions({
  bookingId,
  currentStatus,
}: {
  bookingId: string
  currentStatus: string
}) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function updateStatus(status: string) {
    setLoading(true)
    await fetch(`/api/formations/bookings/${bookingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    router.refresh()
    setLoading(false)
  }

  if (currentStatus === 'cancelled') return null

  return (
    <div className="flex gap-2 shrink-0">
      {currentStatus === 'pending' && (
        <button
          onClick={() => updateStatus('confirmed')}
          disabled={loading}
          className="text-xs px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50"
        >
          Confirmar
        </button>
      )}
      {currentStatus !== 'cancelled' && (
        <button
          onClick={() => updateStatus('cancelled')}
          disabled={loading}
          className="text-xs px-3 py-1.5 border hover:bg-muted rounded-lg font-medium disabled:opacity-50"
        >
          Cancelar
        </button>
      )}
    </div>
  )
}