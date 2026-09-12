'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DiscoverFollowButton({
  targetUserId,
  isFollowing: initialIsFollowing,
}: {
  targetUserId: string
  isFollowing: boolean
}) {
  const router = useRouter()
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [loading, setLoading] = useState(false)

  async function handleFollow() {
    setLoading(true)
    setIsFollowing(!isFollowing)

    await fetch('/api/follow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUserId }),
    })

    setLoading(false)
    router.refresh()
  }

  return (
    <button
      onClick={handleFollow}
      disabled={loading}
      style={{
        padding: '7px 16px',
        background: isFollowing ? 'white' : 'var(--red)',
        color: isFollowing ? 'var(--text-secondary)' : 'white',
        border: isFollowing ? '0.5px solid var(--border)' : 'none',
        borderRadius: 'var(--radius-full)',
        fontSize: 13,
        fontWeight: 500,
        fontFamily: 'var(--font)',
        cursor: 'pointer',
        opacity: loading ? 0.6 : 1,
        flexShrink: 0,
        transition: 'all 0.15s',
        whiteSpace: 'nowrap',
      }}
    >
      {isFollowing ? 'Siguiendo' : 'Seguir'}
    </button>
  )
}
