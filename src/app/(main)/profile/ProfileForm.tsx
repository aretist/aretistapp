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

  const initials = fullName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const validationError = validateFile(file, 'image', 5)
    if (validationError) { setError(validationError); return }
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
      .update({ full_name: fullName, bio, city, avatar_url: avatarUrl })
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
    <section style={{ marginBottom: 40, paddingBottom: 32, borderBottom: '0.5px solid var(--border)' }}>
      {/* Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
        <div style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          overflow: 'hidden',
          backgroundColor: avatarUrl ? 'transparent' : 'var(--pink)',
          backgroundImage: avatarUrl ? `url(${avatarUrl})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 24,
          fontWeight: 700,
          color: 'var(--red)',
          flexShrink: 0,
          fontFamily: 'var(--font)',
        }}>
          {!avatarUrl && initials}
        </div>
        <div>
          <label style={{
            display: 'inline-block',
            padding: '8px 16px',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-full)',
            fontSize: 13,
            fontWeight: 500,
            fontFamily: 'var(--font)',
            cursor: 'pointer',
            color: 'var(--text-primary)',
            background: 'white',
          }}>
            {uploading ? 'Subiendo...' : 'Cambiar foto'}
            <input type="file" accept="image/*" onChange={handleAvatarChange} disabled={uploading} style={{ display: 'none' }} />
          </label>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6, fontFamily: 'var(--font)' }}>JPG o PNG, máx 5MB</p>
        </div>
      </div>

      {/* Campos */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500, fontFamily: 'var(--font)', color: 'var(--text-primary)' }}>
            Nombre completo
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font)', fontSize: 14, background: 'white', color: 'var(--text-primary)', outline: 'none' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500, fontFamily: 'var(--font)', color: 'var(--text-primary)' }}>
            Username
          </label>
          <input
            type="text"
            value={profile.username}
            disabled
            style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font)', fontSize: 14, background: 'var(--bg-surface)', color: 'var(--text-secondary)', outline: 'none' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500, fontFamily: 'var(--font)', color: 'var(--text-primary)' }}>
            Ciudad
          </label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font)', fontSize: 14, background: 'white', color: 'var(--text-primary)', outline: 'none' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 500, fontFamily: 'var(--font)', color: 'var(--text-primary)' }}>
            Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font)', fontSize: 14, background: 'white', color: 'var(--text-primary)', outline: 'none', resize: 'vertical' }}
          />
        </div>

        {error && <p style={{ color: 'var(--red)', fontSize: 13, fontFamily: 'var(--font)' }}>{error}</p>}
        {success && <p style={{ color: 'var(--success-text)', fontSize: 13, fontFamily: 'var(--font)' }}>Perfil actualizado correctamente</p>}

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: '12px',
            background: 'var(--red)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-full)',
            fontWeight: 500,
            fontSize: 14,
            fontFamily: 'var(--font)',
            cursor: 'pointer',
            opacity: saving ? 0.6 : 1,
            transition: 'opacity 0.15s',
          }}
        >
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </section>
  )
}
