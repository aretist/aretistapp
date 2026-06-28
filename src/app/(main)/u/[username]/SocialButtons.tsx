'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Connection {
  id: string
  requester_id: string
  addressee_id: string
  status: string
}

interface Props {
  targetUserId: string
  isFollowing: boolean
  connection: Connection | null
  currentUserId: string
}

export default function SocialButtons({ targetUserId, isFollowing, connection, currentUserId }: Props) {
  const router = useRouter()
  const [following, setFollowing] = useState(isFollowing)
  const [loadingFollow, setLoadingFollow] = useState(false)
  const [loadingConnect, setLoadingConnect] = useState(false)

  async function handleFollow() {
    setLoadingFollow(true)
    const res = await fetch('/api/follow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUserId }),
    })
    const data = await res.json()
    if (res.ok) setFollowing(data.following)
    setLoadingFollow(false)
  }

  async function handleConnectAction(action: 'request' | 'accept' | 'reject' | 'cancel') {
    setLoadingConnect(true)
    await fetch('/api/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, targetUserId, connectionId: connection?.id }),
    })
    setLoadingConnect(false)
    router.refresh()
  }

  const btnPrimary: React.CSSProperties = {
    padding: '10px 20px',
    background: 'var(--red)',
    color: 'white',
    border: 'none',
    borderRadius: 'var(--radius-full)',
    fontSize: 14,
    fontWeight: 500,
    fontFamily: 'var(--font)',
    cursor: 'pointer',
    transition: 'background 0.15s',
  }

  const btnOutline: React.CSSProperties = {
    padding: '10px 20px',
    background: 'white',
    color: 'var(--text-primary)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-full)',
    fontSize: 14,
    fontWeight: 500,
    fontFamily: 'var(--font)',
    cursor: 'pointer',
  }

  const btnFollowing: React.CSSProperties = {
    ...btnOutline,
    color: 'var(--red)',
    borderColor: 'var(--red)',
  }

  function renderConnectButton() {
    if (!connection) {
      return (
        <button onClick={() => handleConnectAction('request')} disabled={loadingConnect} style={btnOutline}>
          + Conectar
        </button>
      )
    }
    if (connection.status === 'accepted') {
      return (
        <button onClick={() => handleConnectAction('cancel')} disabled={loadingConnect} style={btnOutline}>
          Conectado ✓
        </button>
      )
    }
    if (connection.status === 'pending' && connection.requester_id === currentUserId) {
      return (
        <button onClick={() => handleConnectAction('cancel')} disabled={loadingConnect} style={btnOutline}>
          Solicitud enviada
        </button>
      )
    }
    if (connection.status === 'pending' && connection.addressee_id === currentUserId) {
      return (
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => handleConnectAction('accept')} disabled={loadingConnect} style={btnPrimary}>
            Aceptar
          </button>
          <button onClick={() => handleConnectAction('reject')} disabled={loadingConnect} style={btnOutline}>
            Rechazar
          </button>
        </div>
      )
    }
    return null
  }

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <button
        onClick={handleFollow}
        disabled={loadingFollow}
        style={following ? btnFollowing : btnPrimary}
      >
        {following ? 'Siguiendo ✓' : '+ Seguir'}
      </button>
      {renderConnectButton()}
    </div>
  )
}
