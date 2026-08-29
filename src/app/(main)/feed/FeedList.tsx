'use client'

import { useState } from 'react'
import PostCard from './PostCard'

interface Props {
  initialPosts: any[]
  currentUserId: string
  hasMore: boolean
  nextCursor: string | null
}

export default function FeedList({ initialPosts, currentUserId, hasMore: initialHasMore, nextCursor: initialCursor }: Props) {
  const [posts, setPosts] = useState(initialPosts)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [cursor, setCursor] = useState(initialCursor)
  const [loading, setLoading] = useState(false)

  async function loadMore() {
    if (!cursor || loading) return
    setLoading(true)

    try {
      const res = await fetch(`/api/posts/feed?cursor=${encodeURIComponent(cursor)}`)
      const data = await res.json()

      if (res.ok) {
        setPosts(prev => [...prev, ...data.posts])
        setHasMore(data.hasMore)
        setCursor(data.nextCursor)
      }
    } catch (err) {
      console.error('Error cargando más posts:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {posts.length === 0 && (
          <p style={{ fontSize: 14, color: '#999', textAlign: 'center', padding: '40px 0' }}>
            Aún no hay publicaciones. Sigue a otros artistas o publica algo tú mismo.
          </p>
        )}
        {posts.map((post: any) => (
          <PostCard key={post.id} post={post} currentUserId={currentUserId} />
        ))}
      </div>

      {hasMore && (
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <button
            onClick={loadMore}
            disabled={loading}
            style={{
              padding: '10px 28px',
              background: 'white',
              color: 'var(--text-primary)',
              border: '0.5px solid var(--border)',
              borderRadius: 'var(--radius-full)',
              fontSize: 14,
              fontFamily: 'var(--font)',
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Cargando...' : 'Cargar más'}
          </button>
        </div>
      )}
    </div>
  )
}
