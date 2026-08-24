'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { uploadFile, validateFile } from '@/lib/storage'

interface Props {
  artistProfile: {
    user_id: string
    portfolio_video_url: string | null
    portfolio_photo_urls: string[]
  } | null
  userId: string
}

export default function PortfolioSection({ artistProfile, userId }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [videoUrl, setVideoUrl] = useState(artistProfile?.portfolio_video_url ?? null)
  const [photoUrls, setPhotoUrls] = useState<string[]>(artistProfile?.portfolio_photo_urls ?? [])
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [uploadingPhotoIndex, setUploadingPhotoIndex] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function saveToDb(updates: { portfolio_video_url?: string | null; portfolio_photo_urls?: string[] }) {
    const { error: upsertError } = await supabase
      .from('artist_profiles')
      .upsert({ user_id: userId, ...updates })

    if (upsertError) {
      setError(upsertError.message)
      return false
    }
    router.refresh()
    return true
  }

  async function handleVideoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const validationError = validateFile(file, 'video', 50)
    if (validationError) {
      setError(validationError)
      return
    }

    setUploadingVideo(true)
    setError(null)

    try {
      const url = await uploadFile('portfolio', file, userId)
      setVideoUrl(url)
      await saveToDb({ portfolio_video_url: url })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir el vídeo')
    } finally {
      setUploadingVideo(false)
    }
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>, index: number) {
    const file = e.target.files?.[0]
    if (!file) return

    const validationError = validateFile(file, 'image', 5)
    if (validationError) {
      setError(validationError)
      return
    }

    setUploadingPhotoIndex(index)
    setError(null)

    try {
      const url = await uploadFile('portfolio', file, userId)
      const newPhotoUrls = [...photoUrls]
      newPhotoUrls[index] = url
      setPhotoUrls(newPhotoUrls)
      await saveToDb({ portfolio_photo_urls: newPhotoUrls })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir la foto')
    } finally {
      setUploadingPhotoIndex(null)
    }
  }

  return (
    <section style={{ marginBottom: 40, paddingBottom: 32, borderBottom: '1px solid #eee' }}>
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Portfolio</h2>
      <p style={{ fontSize: 13, color: '#666', marginBottom: 20 }}>1 vídeo y hasta 3 fotos que muestren tu trabajo</p>

      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 14, marginBottom: 8 }}>Vídeo de presentación</p>
        {videoUrl ? (
          <video src={videoUrl} controls style={{ width: '100%', maxWidth: 320, borderRadius: 8, marginBottom: 8 }} />
        ) : (
          <div style={{ width: '100%', maxWidth: 320, height: 180, background: '#f5f5f5', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: 13, marginBottom: 8 }}>
            Sin vídeo todavía
          </div>
        )}
        <label
          style={{
            display: 'inline-block',
            padding: '8px 14px',
            border: '1px solid #ddd',
            borderRadius: 6,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          {uploadingVideo ? 'Subiendo...' : videoUrl ? 'Cambiar vídeo' : 'Subir vídeo'}
          <input
            type="file"
            accept="video/*"
            onChange={handleVideoChange}
            disabled={uploadingVideo}
            style={{ display: 'none' }}
          />
        </label>
        <p style={{ fontSize: 12, color: '#999', marginTop: 6 }}>Máx 50MB</p>
      </div>

      <div>
        <p style={{ fontSize: 14, marginBottom: 8 }}>Fotos</p>
        <div style={{ display: 'flex', gap: 12 }}>
          {[0, 1, 2].map((index) => (
            <div key={index}>
              {photoUrls[index] ? (
                <div
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 8,
                    backgroundImage: `url(${photoUrls[index]})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    marginBottom: 6,
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 8,
                    background: '#f5f5f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#999',
                    fontSize: 11,
                    marginBottom: 6,
                  }}
                >
                  Foto {index + 1}
                </div>
              )}
              <label
                style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: '4px 0',
                  border: '1px solid #ddd',
                  borderRadius: 6,
                  fontSize: 11,
                  cursor: 'pointer',
                }}
              >
                {uploadingPhotoIndex === index ? '...' : photoUrls[index] ? 'Cambiar' : 'Subir'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handlePhotoChange(e, index)}
                  disabled={uploadingPhotoIndex === index}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          ))}
        </div>
      </div>

      {error && <p style={{ color: '#c00', fontSize: 14, marginTop: 12 }}>{error}</p>}
    </section>
  )
}
