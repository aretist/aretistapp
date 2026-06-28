'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { uploadFile, validateFile } from '@/lib/storage'

export default function PostComposer({ userId }: { userId: string }) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [content, setContent] = useState('')
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [mediaPreview, setMediaPreview] = useState<string | null>(null)
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null)
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const type = file.type.startsWith('video/') ? 'video' : 'image'
    const validationError = validateFile(file, type, type === 'video' ? 50 : 8)
    if (validationError) { setError(validationError); return }
    setError(null)
    setMediaFile(file)
    setMediaType(type)
    setMediaPreview(URL.createObjectURL(file))
  }

  function clearMedia() {
    setMediaFile(null)
    setMediaPreview(null)
    setMediaType(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handlePublish() {
    if (!content.trim() && !mediaFile) return
    setPosting(true)
    setError(null)
    try {
      let mediaUrl: string | null = null
      if (mediaFile) {
        mediaUrl = await uploadFile('posts-media', mediaFile, userId)
      }
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, mediaUrl, mediaType }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al publicar')
      }
      setContent('')
      clearMedia()
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al publicar')
    } finally {
      setPosting(false)
    }
  }

  return (
    <div style={{
      background: 'white',
      border: '0.5px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '14px 16px',
      marginBottom: 16,
    }}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Comparte algo con la comunidad..."
        rows={3}
        style={{
          width: '100%',
          border: 'none',
          outline: 'none',
          resize: 'none',
          fontFamily: 'var(--font)',
          fontSize: 15,
          color: 'var(--text-primary)',
          background: 'transparent',
          lineHeight: 1.5,
        }}
      />

      {mediaPreview && (
        <div style={{ marginTop: 10, position: 'relative', display: 'inline-block' }}>
          {mediaType === 'video'
            ? <video src={mediaPreview} style={{ maxWidth: 260, borderRadius: 10 }} controls />
            : <img src={mediaPreview} alt="preview" style={{ maxWidth: 260, borderRadius: 10 }} />
          }
          <button
            onClick={clearMedia}
            style={{
              position: 'absolute',
              top: 6,
              right: 6,
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.55)',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >×</button>
        </div>
      )}

      {error && (
        <p style={{ color: 'var(--red)', fontSize: 13, marginTop: 8, fontFamily: 'var(--font)' }}>{error}</p>
      )}

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
        paddingTop: 12,
        borderTop: '0.5px solid var(--border)',
      }}>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 13,
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          fontFamily: 'var(--font)',
          fontWeight: 500,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/>
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
          </svg>
          Foto / vídeo
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </label>

        <button
          onClick={handlePublish}
          disabled={posting || (!content.trim() && !mediaFile)}
          style={{
            background: 'var(--red)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-full)',
            padding: '8px 20px',
            fontSize: 13,
            fontWeight: 500,
            fontFamily: 'var(--font)',
            cursor: 'pointer',
            opacity: posting || (!content.trim() && !mediaFile) ? 0.5 : 1,
            transition: 'opacity 0.15s, background 0.15s',
          }}
        >
          {posting ? 'Publicando...' : 'Publicar'}
        </button>
      </div>
    </div>
  )
}
