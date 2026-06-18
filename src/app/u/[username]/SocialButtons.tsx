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
    if (res.ok) {
      setFollowing(data.following)
    }
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

  function renderConnectButton() {
    if (!connection) {
      return (
        <button onClick={() => handleConnectAction('request')} disabled={loadingConnect} style={btnSecondary}>
          + Conectar
        </button>
      )
    }

    if (connection.status === 'accepted') {
      return (
        <button onClick={() => handleConnectAction('cancel')} disabled={loadingConnect} style={btnSecondary}>
          Conectado ✓
        </button>
      )
    }

    if (connection.status === 'pending' && connection.requester_id === currentUserId) {
      return (
        <button onClick={() => handleConnectAction('cancel')} disabled={loadingConnect} style={btnSecondary}>
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
          <button onClick={() => handleConnectAction('reject')} disabled={loadingConnect} style={btnSecondary}>
            Rechazar
          </button>
        </div>
      )
    }

    return null
  }

  return (
    <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
      <button onClick={handleFollow} disabled={loadingFollow} style={following ? btnSecondary : btnPrimary}>
        {following ? 'Siguiendo ✓' : '+ Seguir'}
      </button>
      {renderConnectButton()}
    </div>
  )
}

const btnPrimary: React.CSSProperties = {
  padding: '8px 16px',
  background: '#534AB7',
  color: 'white',
  border: 'none',
  borderRadius: 6,
  fontSize: 13,
  fontWeight: 500,
  cursor: 'pointer',
}

const btnSecondary: React.CSSProperties = {
  padding: '8px 16px',
  background: 'white',
  color: '#333',
  border: '1px solid #ddd',
  borderRadius: 6,
  fontSize: 13,
  cursor: 'pointer',
}
