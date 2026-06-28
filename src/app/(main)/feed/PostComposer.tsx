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

    if (validationError) {
      setError(validationError)
      return
    }

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
    <div style={{ border: '1px solid #eee', borderRadius: 10, padding: 16 }}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Comparte algo con la comunidad..."
        rows={3}
        style={{
          width: '100%',
          padding: 10,
          border: '1px solid #ddd',
          borderRadius: 6,
          resize: 'vertical',
          fontFamily: 'inherit',
          fontSize: 14,
        }}
      />

      {mediaPreview && (
        <div style={{ marginTop: 12, position: 'relative', display: 'inline-block' }}>
          {mediaType === 'video' ? (
            <video src={mediaPreview} style={{ maxWidth: 240, borderRadius: 8 }} controls />
          ) : (
            <img src={mediaPreview} alt="preview" style={{ maxWidth: 240, borderRadius: 8 }} />
          )}
          <button
            onClick={clearMedia}
            style={{
              position: 'absolute',
              top: 6,
              right: 6,
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.6)',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            ×
          </button>
        </div>
      )}

      {error && <p style={{ color: '#c00', fontSize: 13, marginTop: 8 }}>{error}</p>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
        <label style={{ fontSize: 13, color: '#534AB7', cursor: 'pointer' }}>
          📷 Foto / vídeo
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
            padding: '8px 18px',
            background: '#534AB7',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
            opacity: posting || (!content.trim() && !mediaFile) ? 0.5 : 1,
          }}
        >
          {posting ? 'Publicando...' : 'Publicar'}
        </button>
      </div>
    </div>
  )
}
