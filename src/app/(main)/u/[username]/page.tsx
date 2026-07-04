import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import SocialButtons from './SocialButtons'
import ShareProfileButton from './ShareProfileButton'

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const supabase = await createClient()
  const { data: { user: currentUser } } = await supabase.auth.getUser()

  if (!currentUser) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .maybeSingle()

  if (!profile) notFound()

  const isOwnProfile = profile.id === currentUser.id

  // Todas las queries en paralelo
  const [
    { data: artistProfile },
    { data: employerProfile },
    { data: experiences },
    { data: education },
    { data: followRecord },
    { data: connectionRecord },
    { count: followersCount },
    { count: connectionsCount },
  ] = await Promise.all([
    supabase.from('artist_profiles').select('*').eq('user_id', profile.id).maybeSingle(),
    supabase.from('employer_profiles').select('*').eq('user_id', profile.id).maybeSingle(),
    supabase.from('experiences').select('*').eq('user_id', profile.id).order('start_date', { ascending: false }),
    supabase.from('education').select('*').eq('user_id', profile.id).order('start_date', { ascending: false }),
    supabase.from('follows').select('*').eq('follower_id', currentUser.id).eq('following_id', profile.id).maybeSingle(),
    supabase.from('connections').select('*').or(`and(requester_id.eq.${currentUser.id},addressee_id.eq.${profile.id}),and(requester_id.eq.${profile.id},addressee_id.eq.${currentUser.id})`).maybeSingle(),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', profile.id),
    supabase.from('connections').select('*', { count: 'exact', head: true }).eq('status', 'accepted').or(`requester_id.eq.${profile.id},addressee_id.eq.${profile.id}`),
  ])

  const initials = profile.full_name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
  const primaryDiscipline = artistProfile?.disciplines?.[0] ?? null

  const DISCIPLINE_LABELS: Record<string, string> = {
    dance: 'Danza', theater: 'Teatro', singing: 'Canto',
    circus: 'Circo', opera: 'Ópera', music: 'Música',
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px 20px 80px' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font)' }}>
          aretist.es/{username}
        </p>
        {isOwnProfile && (
          <Link href="/profile" style={{ fontSize: 13, fontWeight: 600, color: 'var(--red)', fontFamily: 'var(--font)', textDecoration: 'none', letterSpacing: '0.02em' }}>
            EDITAR
          </Link>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
        <div style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: profile.avatar_url ? 'transparent' : 'var(--pink)',
          backgroundImage: profile.avatar_url ? `url(${profile.avatar_url})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 28,
          fontWeight: 700,
          color: 'var(--red)',
          flexShrink: 0,
          fontFamily: 'var(--font)',
        }}>
          {!profile.avatar_url && initials}
        </div>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font)', marginBottom: 3 }}>
            {profile.full_name}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--red)', fontWeight: 500, fontFamily: 'var(--font)' }}>
            {primaryDiscipline ? `${DISCIPLINE_LABELS[primaryDiscipline] ?? primaryDiscipline}` : ''}
            {primaryDiscipline && profile.city ? ' · ' : ''}
            {profile.city ?? ''}
          </p>
        </div>
      </div>

      <div style={{
        display: 'flex',
        border: '0.5px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        marginBottom: 16,
        background: 'white',
      }}>
        <div style={{ flex: 1, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <div>
            <span style={{ fontWeight: 700, fontSize: 15, fontFamily: 'var(--font)', color: 'var(--text-primary)' }}>{followersCount ?? 0}</span>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'var(--font)', marginLeft: 5 }}>seguidores</span>
          </div>
        </div>
        <div style={{ width: '0.5px', background: 'var(--border)' }} />
        <div style={{ flex: 1, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <div>
            <span style={{ fontWeight: 700, fontSize: 15, fontFamily: 'var(--font)', color: 'var(--text-primary)' }}>{connectionsCount ?? 0}</span>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'var(--font)', marginLeft: 5 }}>conexiones</span>
          </div>
        </div>
      </div>

      {profile.city && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', fontFamily: 'var(--font)' }}>
            {profile.city}{profile.country && profile.country !== 'ES' ? `, ${profile.country}` : ', España'}
          </p>
        </div>
      )}

      {profile.bio && (
        <p style={{ fontSize: 15, color: 'var(--text-primary)', fontFamily: 'var(--font)', lineHeight: 1.6, marginBottom: 16 }}>
          {profile.bio}
        </p>
      )}

      {artistProfile?.disciplines?.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          {[
            ...(artistProfile.disciplines ?? []).map((d: string) => DISCIPLINE_LABELS[d] ?? d),
            ...(artistProfile.dance_styles ?? []),
          ].map((tag: string) => (
            <span key={tag} style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: 13,
              fontFamily: 'var(--font)',
              background: 'white',
              color: 'var(--text-primary)',
              border: '0.5px solid var(--border)',
            }}>
              {tag}
            </span>
          ))}
        </div>
      )}

      {!isOwnProfile && (
        <div style={{ marginBottom: 20 }}>
          <SocialButtons
            targetUserId={profile.id}
            isFollowing={!!followRecord}
            connection={connectionRecord}
            currentUserId={currentUser.id}
          />
        </div>
      )}

      {artistProfile?.portfolio_video_url && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: '#111' }}>
            <video
              src={artistProfile.portfolio_video_url}
              controls
              style={{ width: '100%', display: 'block', maxHeight: 300, objectFit: 'cover' }}
            />
            <div style={{
              position: 'absolute',
              bottom: 10,
              left: 12,
              background: 'rgba(0,0,0,0.6)',
              color: 'white',
              fontSize: 12,
              fontFamily: 'var(--font)',
              padding: '3px 8px',
              borderRadius: 6,
            }}>
              Reel 2024
            </div>
          </div>
        </div>
      )}

      {artistProfile?.portfolio_photo_urls?.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 20 }}>
          {artistProfile.portfolio_photo_urls.map((url: string, i: number) => (
            <div key={i} style={{
              aspectRatio: '1',
              borderRadius: 'var(--radius-md)',
              background: `url(${url}) center/cover`,
              border: '0.5px solid var(--border)',
            }} />
          ))}
        </div>
      )}

      {employerProfile && (
        <div style={{ marginBottom: 20, padding: 16, background: 'white', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
          <p style={{ fontWeight: 600, fontSize: 15, fontFamily: 'var(--font)', color: 'var(--text-primary)', marginBottom: 3 }}>
            {employerProfile.company_name}
          </p>
          {employerProfile.website && (
            <a href={employerProfile.website} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: 'var(--red)', fontFamily: 'var(--font)' }}>
              {employerProfile.website}
            </a>
          )}
        </div>
      )}

      {experiences && experiences.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--font)', marginBottom: 12, color: 'var(--text-primary)' }}>
            Experiencia
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {experiences.map((exp: any) => (
              <div key={exp.id} style={{ padding: '12px 16px', background: 'white', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                <p style={{ fontWeight: 600, fontSize: 14, fontFamily: 'var(--font)', color: 'var(--text-primary)' }}>{exp.title}</p>
                <p style={{ fontSize: 13, color: 'var(--red)', fontFamily: 'var(--font)', marginTop: 2 }}>{exp.company}</p>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font)', marginTop: 3 }}>
                  {exp.start_date} — {exp.end_date ?? 'Actual'}
                </p>
                {exp.description && (
                  <p style={{ fontSize: 13, color: 'var(--text-primary)', fontFamily: 'var(--font)', marginTop: 6, lineHeight: 1.5 }}>{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {education && education.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--font)', marginBottom: 12, color: 'var(--text-primary)' }}>
            Educación
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {education.map((edu: any) => (
              <div key={edu.id} style={{ padding: '12px 16px', background: 'white', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                <p style={{ fontWeight: 600, fontSize: 14, fontFamily: 'var(--font)', color: 'var(--text-primary)' }}>{edu.title}</p>
                <p style={{ fontSize: 13, color: 'var(--red)', fontFamily: 'var(--font)', marginTop: 2 }}>{edu.institution}</p>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font)', marginTop: 3 }}>
                  {edu.start_date} — {edu.end_date ?? 'Actual'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {isOwnProfile && (
        <ShareProfileButton username={username} />
      )}
    </div>
  )
}
