'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Comment {
  id: string
  content: string
  created_at: string
  users: { full_name: string; username: string; avatar_url: string | null }
}

interface Post {
  id: string
  content: string | null
  media_url: string | null
  media_type: string | null
  created_at: string
  user_id: string
  users: { id: string; full_name: string; username: string; avatar_url: string | null }
  post_likes: { user_id: string }[]
  post_comments: Comment[]
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

function Avatar({ url, name, size = 38 }: { url: string | null; name: string; size?: number }) {
  const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '50%',
      overflow: 'hidden',
      backgroundColor: 'var(--pink)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: size * 0.35,
      fontWeight: 600,
      color: 'var(--red)',
      flexShrink: 0,
      fontFamily: 'var(--font)',
    }}>
      {url
  ? <img src={url} alt={name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
  : initials}
</div>
  )
}

export default function PostCard({ post, currentUserId }: { post: Post; currentUserId: string }) {
  const router = useRouter()
  const [liked, setLiked] = useState(post.post_likes.some(l => l.user_id === currentUserId))
  const [likeCount, setLikeCount] = useState(post.post_likes.length)
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState(post.post_comments)
  const [newComment, setNewComment] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)

  async function handleLike() {
    setLiked(!liked)
    setLikeCount(prev => liked ? prev - 1 : prev + 1)
    await fetch('/api/posts/like', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId: post.id }),
    })
  }

  async function handleComment() {
    if (!newComment.trim()) return
    setSubmittingComment(true)
    const res = await fetch('/api/posts/comment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId: post.id, content: newComment }),
    })
    const data = await res.json()
    if (res.ok) {
      setComments(prev => [...prev, data.comment])
      setNewComment('')
    }
    setSubmittingComment(false)
  }

  async function handleDelete() {
    await fetch('/api/posts', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId: post.id }),
    })
    router.refresh()
  }

  return (
    <div style={{
      background: 'white',
      border: '0.5px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      marginBottom: 12,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px 10px' }}>
        <Link href={`/u/${post.users.username}`}>
          <Avatar url={post.users.avatar_url} name={post.users.full_name} />
        </Link>
        <div style={{ flex: 1 }}>
          <Link href={`/u/${post.users.username}`} style={{ textDecoration: 'none' }}>
            <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', fontFamily: 'var(--font)' }}>
              {post.users.full_name}
            </p>
          </Link>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font)' }}>
            {timeAgo(post.created_at)}
          </p>
        </div>
        {post.user_id === currentUserId && (
          <button
            onClick={handleDelete}
            style={{
              fontSize: 12,
              color: 'var(--text-secondary)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font)',
              padding: '4px 8px',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            Eliminar
          </button>
        )}
      </div>

      {/* Contenido */}
      {post.content && (
        <p style={{
          fontSize: 15,
          lineHeight: 1.55,
          padding: '0 16px',
          marginBottom: post.media_url ? 10 : 0,
          fontFamily: 'var(--font)',
          color: 'var(--text-primary)',
        }}>
          {post.content}
        </p>
      )}

      {/* Media */}
{post.media_url && (
  post.media_type === 'video'
    ? <video src={post.media_url} controls style={{ width: '100%', display: 'block', maxHeight: 400, objectFit: 'cover' }} />
    : <img src={post.media_url} alt="" loading="lazy" style={{ width: '100%', display: 'block', maxHeight: 400, objectFit: 'cover' }} />
)}

      {/* Acciones */}
      <div style={{
        display: 'flex',
        gap: 4,
        padding: '10px 12px',
        borderTop: '0.5px solid var(--border)',
        marginTop: 10,
      }}>
        <button
          onClick={handleLike}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: liked ? 'var(--red)' : 'var(--text-secondary)',
            fontSize: 13,
            fontWeight: 500,
            fontFamily: 'var(--font)',
            padding: '6px 10px',
            borderRadius: 'var(--radius-sm)',
            transition: 'color 0.15s',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill={liked ? 'var(--red)' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          {likeCount > 0 ? likeCount : ''} Me gusta
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            fontSize: 13,
            fontWeight: 500,
            fontFamily: 'var(--font)',
            padding: '6px 10px',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          {comments.length > 0 ? comments.length : ''} Comentar
        </button>
      </div>

      {/* Comentarios */}
      {showComments && (
        <div style={{ padding: '0 16px 14px', borderTop: '0.5px solid var(--border)' }}>
          {comments.length > 0 && (
            <div style={{ paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
              {comments.map(c => (
                <div key={c.id} style={{ display: 'flex', gap: 8 }}>
                  <Avatar url={c.users.avatar_url} name={c.users.full_name} size={28} />
                  <div style={{
                    background: 'var(--bg-surface)',
                    borderRadius: 10,
                    padding: '7px 12px',
                    flex: 1,
                  }}>
                    <Link href={`/u/${c.users.username}`} style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', fontFamily: 'var(--font)', textDecoration: 'none' }}>
                      {c.users.full_name}
                    </Link>
                    <p style={{ fontSize: 13, color: 'var(--text-primary)', fontFamily: 'var(--font)', marginTop: 1 }}>{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, paddingTop: comments.length ? 0 : 10 }}>
            <input
              type="text"
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleComment()}
              placeholder="Escribe un comentario..."
              style={{
                flex: 1,
                padding: '8px 14px',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-full)',
                fontSize: 13,
                fontFamily: 'var(--font)',
                background: 'var(--bg-surface)',
                outline: 'none',
                color: 'var(--text-primary)',
              }}
            />
            <button
              onClick={handleComment}
              disabled={submittingComment || !newComment.trim()}
              style={{
                padding: '8px 16px',
                background: 'var(--red)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-full)',
                fontSize: 13,
                fontFamily: 'var(--font)',
                fontWeight: 500,
                cursor: 'pointer',
                opacity: submittingComment || !newComment.trim() ? 0.5 : 1,
              }}
            >
              Enviar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
