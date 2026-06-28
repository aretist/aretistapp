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

export default function PostCard({ post, currentUserId }: { post: Post; currentUserId: string }) {
  const router = useRouter()
  const [liked, setLiked] = useState(post.post_likes.some((l) => l.user_id === currentUserId))
  const [likeCount, setLikeCount] = useState(post.post_likes.length)
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState(post.post_comments)
  const [newComment, setNewComment] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)

  async function handleLike() {
    setLiked(!liked)
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1))

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
      setComments((prev) => [...prev, data.comment])
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

  const timeAgo = formatTimeAgo(post.created_at)

  return (
    <div style={{ border: '1px solid #eee', borderRadius: 10, padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <Link href={`/u/${post.users.username}`}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: post.users.avatar_url ? `url(${post.users.avatar_url})` : '#EEEDFE',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        </Link>
        <div style={{ flex: 1 }}>
          <Link href={`/u/${post.users.username}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <p style={{ fontWeight: 500, fontSize: 14 }}>{post.users.full_name}</p>
          </Link>
          <p style={{ fontSize: 12, color: '#999' }}>{timeAgo}</p>
        </div>
        {post.user_id === currentUserId && (
          <button
            onClick={handleDelete}
            style={{ fontSize: 12, color: '#c00', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Eliminar
          </button>
        )}
      </div>

      {post.content && <p style={{ fontSize: 14, lineHeight: 1.5, marginBottom: post.media_url ? 12 : 0 }}>{post.content}</p>}

      {post.media_url && (
        post.media_type === 'video' ? (
          <video src={post.media_url} controls style={{ width: '100%', borderRadius: 8 }} />
        ) : (
          <img src={post.media_url} alt="" style={{ width: '100%', borderRadius: 8 }} />
        )
      )}

      <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: 13 }}>
        <button
          onClick={handleLike}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: liked ? '#534AB7' : '#666' }}
        >
          {liked ? '♥' : '♡'} {likeCount > 0 ? likeCount : ''} Me gusta
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}
        >
          💬 {comments.length > 0 ? comments.length : ''} Comentar
        </button>
      </div>

      {showComments && (
        <div style={{ marginTop: 12, borderTop: '1px solid #f0f0f0', paddingTop: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
            {comments.map((c) => (
              <div key={c.id} style={{ fontSize: 13 }}>
                <Link href={`/u/${c.users.username}`} style={{ fontWeight: 500, textDecoration: 'none', color: 'inherit' }}>
                  {c.users.full_name}
                </Link>{' '}
                <span style={{ color: '#444' }}>{c.content}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleComment()}
              placeholder="Escribe un comentario..."
              style={{ flex: 1, padding: 8, border: '1px solid #ddd', borderRadius: 6, fontSize: 13 }}
            />
            <button
              onClick={handleComment}
              disabled={submittingComment || !newComment.trim()}
              style={{
                padding: '8px 14px',
                background: '#534AB7',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                fontSize: 13,
                cursor: 'pointer',
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

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'ahora mismo'
  if (minutes < 60) return `hace ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `hace ${hours}h`
  const days = Math.floor(hours / 24)
  return `hace ${days}d`
}
