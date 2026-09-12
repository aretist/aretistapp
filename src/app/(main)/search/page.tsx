import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import SearchBar from './SearchBar'
import DiscoverFollowButton from '../discover/DiscoverFollowButton'

const DISCIPLINES = [
  { value: '', label: 'Todas las disciplinas' },
  { value: 'dance', label: 'Danza' },
  { value: 'theater', label: 'Teatro' },
  { value: 'singing', label: 'Canto' },
  { value: 'circus', label: 'Circo' },
  { value: 'music', label: 'Música' },
]

const DISCIPLINE_LABELS: Record<string, string> = {
  dance: 'Danza', theater: 'Teatro', singing: 'Canto',
  circus: 'Circo', music: 'Música',
}

const ROLE_LABELS: Record<string, string> = {
  artist: 'Artista',
  teacher: 'Profesor',
  employer: 'Empleador',
}

function escapePostgREST(str: string): string {
  return str
    .replace(/[%_]/g, '\\$&')
    .replace(/[(),]/g, '')
    .trim()
    .slice(0, 100)
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string; discipline?: string; city?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const allowedRoles = ['artist', 'teacher', 'employer']
  const safeRole = params.role && allowedRoles.includes(params.role) ? params.role : undefined
  const allowedDisciplines = ['dance', 'theater', 'singing', 'circus', 'music']
  const safeDiscipline = params.discipline && allowedDisciplines.includes(params.discipline) ? params.discipline : undefined

  let results: any[] = []
  const hasQuery = params.q || safeRole || safeDiscipline || params.city

  if (hasQuery) {
    let query = supabase
      .from('users')
      .select('id, full_name, username, avatar_url, city, roles, bio')
      .neq('id', user.id)
      .order('full_name', { ascending: true })
      .limit(30)

    if (params.q) {
      const safeQ = escapePostgREST(params.q)
      if (safeQ) {
        query = query.or(`full_name.ilike.%${safeQ}%,username.ilike.%${safeQ}%,city.ilike.%${safeQ}%`)
      }
    }

    if (safeRole) query = query.contains('roles', [safeRole])

    if (params.city && !params.q) {
      const safeCity = escapePostgREST(params.city)
      if (safeCity) query = query.ilike('city', `%${safeCity}%`)
    }

    const { data } = await query
    let filtered = data ?? []

    if (safeDiscipline && filtered.length > 0) {
      const userIds = filtered.map((u) => u.id)
      const { data: artistProfiles } = await supabase
        .from('artist_profiles')
        .select('user_id, disciplines')
        .in('user_id', userIds)
        .contains('disciplines', [safeDiscipline])

      const matchingIds = new Set(artistProfiles?.map((p) => p.user_id))
      filtered = filtered.filter((u) => matchingIds.has(u.id))
    }

    results = filtered
  }

  // Cargar sugerencias cuando no hay búsqueda
  let suggestedByDiscipline: any[] = []
  let suggestedByCity: any[] = []
  let followingIds: string[] = []

  if (!hasQuery) {
    const [{ data: artistProfile }, { data: following }, { data: profile }] = await Promise.all([
      supabase.from('artist_profiles').select('disciplines').eq('user_id', user.id).maybeSingle(),
      supabase.from('follows').select('following_id').eq('follower_id', user.id),
      supabase.from('users').select('city').eq('id', user.id).single(),
    ])

    followingIds = following?.map(f => f.following_id) ?? []
    const myDisciplines = artistProfile?.disciplines ?? []
    const myCity = profile?.city ?? null
    const excludeIds = [user.id, ...followingIds]

    if (myDisciplines.length > 0) {
      const { data: artistProfiles } = await supabase
        .from('artist_profiles')
        .select('user_id, disciplines')
        .overlaps('disciplines', myDisciplines)
        .not('user_id', 'in', `(${excludeIds.join(',')})`)
        .limit(20)

      if (artistProfiles?.length) {
        const userIds = artistProfiles.map(p => p.user_id)
        const { data: users } = await supabase
          .from('users')
          .select('id, full_name, username, avatar_url, city, bio')
          .in('id', userIds)
          .limit(8)

        const disciplineMap = new Map(artistProfiles.map(p => [p.user_id, p.disciplines]))
        suggestedByDiscipline = (users ?? []).map(u => ({
          ...u,
          disciplines: disciplineMap.get(u.id) ?? [],
        }))
      }
    }

    if (myCity) {
      const alreadySuggestedIds = suggestedByDiscipline.map(u => u.id)
      const excludeForCity = [...excludeIds, ...alreadySuggestedIds]
      const { data: cityUsers } = await supabase
        .from('users')
        .select('id, full_name, username, avatar_url, city, bio')
        .ilike('city', `%${myCity}%`)
        .not('id', 'in', `(${excludeForCity.join(',')})`)
        .limit(5)
      suggestedByCity = cityUsers ?? []
    }

    // Si no hay sugerencias personalizadas, mostrar usuarios recientes
    if (suggestedByDiscipline.length === 0 && suggestedByCity.length === 0) {
      const { data: recent } = await supabase
        .from('users')
        .select('id, full_name, username, avatar_url, city, bio')
        .not('id', 'in', `(${excludeIds.join(',')})`)
        .order('created_at', { ascending: false })
        .limit(8)
      suggestedByDiscipline = recent ?? []
    }
  }

  const UserCard = ({ profile, showFollow = false }: { profile: any; showFollow?: boolean }) => (
    <Link key={profile.id} href={`/u/${profile.username}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, border: '0.5px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'white' }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', overflow: 'hidden', backgroundColor: 'var(--pink)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 600, color: 'var(--red)' }}>
          {profile.avatar_url
            ? <img src={profile.avatar_url} alt={profile.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : profile.full_name.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 500, fontSize: 14, fontFamily: 'var(--font)', color: 'var(--text-primary)' }}>{profile.full_name}</p>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font)' }}>@{profile.username}</p>
          {profile.city && <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 1, fontFamily: 'var(--font)' }}>📍 {profile.city}</p>}
          {profile.disciplines?.length > 0 && (
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
              {profile.disciplines.slice(0, 3).map((d: string) => (
                <span key={d} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: 'var(--bg-highlight)', color: 'var(--red)', fontFamily: 'var(--font)' }}>
                  {DISCIPLINE_LABELS[d] ?? d}
                </span>
              ))}
            </div>
          )}
          {profile.bio && !profile.disciplines?.length && (
            <p style={{ fontSize: 12, color: 'var(--text-primary)', marginTop: 4, lineHeight: 1.4, fontFamily: 'var(--font)' }}>
              {profile.bio.length > 80 ? profile.bio.slice(0, 80) + '...' : profile.bio}
            </p>
          )}
        </div>
        {showFollow ? (
          <DiscoverFollowButton targetUserId={profile.id} isFollowing={followingIds.includes(profile.id)} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end', flexShrink: 0 }}>
            {profile.roles?.map((role: string) => (
              <span key={role} style={{ fontSize: 10, fontWeight: 500, padding: '2px 8px', borderRadius: 10, background: 'var(--bg-highlight)', color: 'var(--red)', whiteSpace: 'nowrap', fontFamily: 'var(--font)' }}>
                {ROLE_LABELS[role] ?? role}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )

  return (
    <div style={{ maxWidth: 640, margin: '40px auto', padding: '0 20px 80px' }}>
      <SearchBar
        initialQuery={params.q ?? ''}
        initialRole={safeRole ?? ''}
        initialDiscipline={safeDiscipline ?? ''}
        initialCity={params.city ?? ''}
        disciplines={DISCIPLINES}
      />

      {hasQuery && (
        <div style={{ marginTop: 20 }}>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12, fontFamily: 'var(--font)' }}>
            {results.length === 0 ? 'No se encontraron resultados' : `${results.length} resultado${results.length !== 1 ? 's' : ''}`}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {results.map((profile) => <UserCard key={profile.id} profile={profile} />)}
          </div>
        </div>
      )}

      {!hasQuery && (
        <div style={{ marginTop: 20 }}>
          {suggestedByDiscipline.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', fontFamily: 'var(--font)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Tu disciplina
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {suggestedByDiscipline.map(u => <UserCard key={u.id} profile={u} showFollow />)}
              </div>
            </div>
          )}

          {suggestedByCity.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', fontFamily: 'var(--font)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                En tu ciudad
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {suggestedByCity.map(u => <UserCard key={u.id} profile={u} showFollow />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
