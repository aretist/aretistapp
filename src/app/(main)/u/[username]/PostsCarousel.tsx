'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Post {
  id: string
  content: string | null
  media_url: string | null
  media_type: string | null
  created_at: string
  post_likes: { user_id: string }[]
  post_comments: { id: string }[]
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'ahora'
  if (m < 60) return `hace ${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `hace ${h}h`
  return `hace ${Math.floor(h / 24)}d`
}

interface Props {
  posts: Post[]
  username: string
}

export default function PostsCarousel({ posts, username }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAll, setShowAll] = useState(false)

  if (posts.length === 0) return null

  const visiblePosts = showAll ? posts : posts.slice(0, 6)
  const canGoPrev = currentIndex > 0
  const canGoNext = currentIndex < visiblePosts.length - 1

  function prev() {
    if (canGoPrev) setCurrentIndex(i => i - 1)
  }

  function next() {
    if (canGoNext) setCurrentIndex(i => i + 1)
  }

  const post = visiblePosts[currentIndex]

  return (
    <div style={{ marginBottom: 20 }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--font)', color: 'var(--text-primary)', marginBottom: 12 }}>
        Publicaciones
      </h2>

      {/* Tarjeta de publicación */}
      <div style={{
        background: 'white',
        border: '0.5px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
      }}>
        {/* Imagen o contenido */}
        {post.media_url && post.media_type === 'image' && (
          <img
            src={post.media_url}
            alt=""
            style={{ width: '100%', maxHeight: 260, objectFit: 'cover', display: 'block' }}
          />
        )}
        {post.media_url && post.media_type === 'video' && (
          <video
            src={post.media_url}
            controls
            style={{ width: '100%', maxHeight: 260, objectFit: 'cover', display: 'block' }}
          />
        )}

        <div style={{ padding: '12px 14px' }}>
          {post.content && (
            <p style={{
              fontSize: 14,
              color: 'var(--text-primary)',
              fontFamily: 'var(--font)',
              lineHeight: 1.5,
              marginBottom: 10,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}>
              {post.content}
            </p>
          )}

          {/* Meta */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font)', display: 'flex', alignItems: 'center', gap: 4 }}>
                ♥ {post.post_likes.length}
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font)', display: 'flex', alignItems: 'center', gap: 4 }}>
                💬 {post.post_comments.length}
              </span>
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font)' }}>
              {timeAgo(post.created_at)}
            </span>
          </div>
        </div>

        {/* Navegación */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          borderTop: '0.5px solid var(--border)',
          background: 'var(--bg-surface)',
        }}>
          <button
            onClick={prev}
            disabled={!canGoPrev}
            style={{
              width: 32, height: 32, borderRadius: '50%',
              background: canGoPrev ? 'white' : 'transparent',
              border: `0.5px solid ${canGoPrev ? 'var(--border)' : 'transparent'}`,
              cursor: canGoPrev ? 'pointer' : 'default',
              color: canGoPrev ? 'var(--text-primary)' : 'var(--border)',
              fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            ‹
          </button>

          {/* Indicadores */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {visiblePosts.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                style={{
                  width: i === currentIndex ? 20 : 6,
                  height: 6,
                  borderRadius: 3,
                  background: i === currentIndex ? 'var(--red)' : 'var(--border)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  padding: 0,
                }}
              />
            ))}
          </div>

          <button
            onClick={next}
            disabled={!canGoNext}
            style={{
              width: 32, height: 32, borderRadius: '50%',
              background: canGoNext ? 'white' : 'transparent',
              border: `0.5px solid ${canGoNext ? 'var(--border)' : 'transparent'}`,
              cursor: canGoNext ? 'pointer' : 'default',
              color: canGoNext ? 'var(--text-primary)' : 'var(--border)',
              fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            ›
          </button>
        </div>
      </div>

      {/* Mostrar más */}
      {!showAll && posts.length > 6 && (
        <button
          onClick={() => { setShowAll(true); setCurrentIndex(0) }}
          style={{
            width: '100%',
            marginTop: 10,
            padding: '10px',
            background: 'transparent',
            border: '0.5px solid var(--border)',
            borderRadius: 'var(--radius-full)',
            fontSize: 13,
            fontFamily: 'var(--font)',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          Mostrar más publicaciones ({posts.length - 6} más)
        </button>
      )}
    </div>
  )
}
