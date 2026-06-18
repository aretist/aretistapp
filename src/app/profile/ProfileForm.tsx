'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { uploadFile, validateFile } from '@/lib/storage'

interface Props {
  profile: {
    id: string
    full_name: string
    username: string
    avatar_url: string | null
    bio: string | null
    city: string | null
  }
  userId: string
}

export default function ProfileForm({ profile, userId }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [fullName, setFullName] = useState(profile.full_name)
  const [bio, setBio] = useState(profile.bio ?? '')
  const [city, setCity] = useState(profile.city ?? '')
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const validationError = validateFile(file, 'image', 5)
    if (validationError) {
      setError(validationError)
      return
    }

    setUploading(true)
    setError(null)

    try {
      const url = await uploadFile('avatars', file, userId)
      setAvatarUrl(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir la imagen')
    } finally {
      setUploading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    setSuccess(false)

    const { error: updateError } = await supabase
      .from('users')
      .update({
        full_name: fullName,
        bio,
        city,
        avatar_url: avatarUrl,
      })
      .eq('id', userId)

    if (updateError) {
      setError(updateError.message)
      setSaving(false)
      return
    }

    setSuccess(true)
    setSaving(false)
    router.refresh()
  }

  return (
    <section style={{ marginBottom: 40, paddingBottom: 32, borderBottom: '1px solid #eee' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: avatarUrl ? `url(${avatarUrl})` : '#EEEDFE',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#534AB7',
            fontSize: 24,
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          {!avatarUrl && fullName.charAt(0).toUpperCase()}
        </div>

        <div>
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
            {uploading ? 'Subiendo...' : 'Cambiar foto'}
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              disabled={uploading}
              style={{ display: 'none' }}
            />
          </label>
          <p style={{ fontSize: 12, color: '#999', marginTop: 6 }}>JPG o PNG, máx 5MB</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>Nombre completo</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 6 }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>Username</label>
          <input
            type="text"
            value={profile.username}
            disabled
            style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 6, background: '#f5f5f5', color: '#999' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>Ciudad</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 6 }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 6, resize: 'vertical' }}
          />
        </div>

        {error && <p style={{ color: '#c00', fontSize: 14 }}>{error}</p>}
        {success && <p style={{ color: '#1D9E75', fontSize: 14 }}>Perfil actualizado correctamente</p>}

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: 12,
            background: '#534AB7',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            fontWeight: 500,
            cursor: 'pointer',
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </section>
  )
}
