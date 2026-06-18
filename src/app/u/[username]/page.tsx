import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import SocialButtons from './SocialButtons'

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const supabase = await createClient()
  const { data: { user: currentUser } } = await supabase.auth.getUser()

  if (!currentUser) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('users')
    .select('*, artist_profiles(*), employer_profiles(*)')
    .eq('username', username)
    .maybeSingle()

  if (!profile) {
    notFound()
  }

  const isOwnProfile = profile.id === currentUser.id

  // Estado de "sigue"
  const { data: followRecord } = await supabase
    .from('follows')
    .select('*')
    .eq('follower_id', currentUser.id)
    .eq('following_id', profile.id)
    .maybeSingle()

  // Estado de conexión (en cualquier dirección)
  const { data: connectionRecord } = await supabase
    .from('connections')
    .select('*')
    .or(
      `and(requester_id.eq.${currentUser.id},addressee_id.eq.${profile.id}),and(requester_id.eq.${profile.id},addressee_id.eq.${currentUser.id})`
    )
    .maybeSingle()

  // Contadores
  const { count: followersCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', profile.id)

  const { count: connectionsCount } = await supabase
    .from('connections')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'accepted')
    .or(`requester_id.eq.${profile.id},addressee_id.eq.${profile.id}`)

  const artistProfile = profile.artist_profiles
  const employerProfile = profile.employer_profiles

  return (
    <div style={{ maxWidth: 640, margin: '40px auto', padding: '0 20px 80px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, marginBottom: 24 }}>
        <div
          style={{
            width: 90,
            height: 90,
            borderRadius: '50%',
            background: profile.avatar_url ? `url(${profile.avatar_url})` : '#EEEDFE',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#534AB7',
            fontSize: 28,
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          {!profile.avatar_url && profile.full_name.charAt(0).toUpperCase()}
        </div>

        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 24, fontWeight: 600 }}>{profile.full_name}</h1>
          <p style={{ color: '#666', fontSize: 14 }}>@{profile.username}</p>
          {profile.city && <p style={{ color: '#666', fontSize: 14, marginTop: 2 }}>{profile.city}</p>}

          <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
            {profile.roles?.map((role: string) => (
              <span
                key={role}
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  padding: '3px 10px',
                  borderRadius: 20,
                  background: '#EEEDFE',
                  color: '#3C3489',
                }}
              >
                {role === 'artist' ? 'Artista' : role === 'teacher' ? 'Profesor' : 'Empleador'}
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: 13, color: '#666' }}>
            <span><strong>{followersCount ?? 0}</strong> seguidores</span>
            <span><strong>{connectionsCount ?? 0}</strong> conexiones</span>
          </div>
        </div>
      </div>

      {!isOwnProfile && (
        <SocialButtons
          targetUserId={profile.id}
          isFollowing={!!followRecord}
          connection={connectionRecord}
          currentUserId={currentUser.id}
        />
      )}

      {profile.bio && (
        <div style={{ marginTop: 24, marginBottom: 24 }}>
          <p style={{ fontSize: 14, lineHeight: 1.6 }}>{profile.bio}</p>
        </div>
      )}

      {employerProfile && (
        <div style={{ marginBottom: 24, padding: 16, background: '#fafafa', borderRadius: 8 }}>
          <p style={{ fontSize: 14, fontWeight: 500 }}>{employerProfile.company_name}</p>
          {employerProfile.website && (
            <a href={employerProfile.website} style={{ fontSize: 13, color: '#534AB7' }}>
              {employerProfile.website}
            </a>
          )}
        </div>
      )}

      {artistProfile?.portfolio_video_url && (
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Portfolio</h2>
          <video
            src={artistProfile.portfolio_video_url}
            controls
            style={{ width: '100%', maxWidth: 320, borderRadius: 8, marginBottom: 12 }}
          />
          {artistProfile.portfolio_photo_urls?.length > 0 && (
            <div style={{ display: 'flex', gap: 8 }}>
              {artistProfile.portfolio_photo_urls.map((url: string, i: number) => (
                <div
                  key={i}
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 8,
                    background: `url(${url})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {artistProfile?.disciplines?.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Disciplinas</h2>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {artistProfile.disciplines.map((d: string) => (
              <span
                key={d}
                style={{
                  fontSize: 12,
                  padding: '4px 12px',
                  borderRadius: 20,
                  background: '#f5f5f5',
                  color: '#333',
                }}
              >
                {d}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
