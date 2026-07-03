import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import SearchBar from './SearchBar'

const DISCIPLINES = [
  { value: '', label: 'Todas las disciplinas' },
  { value: 'dance', label: 'Danza' },
  { value: 'theater', label: 'Teatro' },
  { value: 'singing', label: 'Canto' },
  { value: 'circus', label: 'Circo' },
  { value: 'opera', label: 'Ópera' },
  { value: 'music', label: 'Música' },
]

const ROLE_LABELS: Record<string, string> = {
  artist: 'Artista',
  teacher: 'Profesor',
  employer: 'Empleador',
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

  let results: any[] = []
  const hasQuery = params.q || params.role || params.discipline || params.city

  if (hasQuery) {
    let query = supabase
      .from('users')
      .select('id, full_name, username, avatar_url, city, roles, bio')
      .neq('id', user.id)
      .order('full_name', { ascending: true })
      .limit(30)

    // Búsqueda por texto usando full-text search
    if (params.q) {
      query = query.or(
        `full_name.ilike.%${params.q}%,username.ilike.%${params.q}%,city.ilike.%${params.q}%`
      )
    }

    if (params.role) {
      query = query.contains('roles', [params.role])
    }

    if (params.city && !params.q) {
      query = query.ilike('city', `%${params.city}%`)
    }

    const { data } = await query
    let filtered = data ?? []

    // Filtro por disciplina: necesita join con artist_profiles
    if (params.discipline && filtered.length > 0) {
      const userIds = filtered.map((u) => u.id)
      const { data: artistProfiles } = await supabase
        .from('artist_profiles')
        .select('user_id, disciplines')
        .in('user_id', userIds)
        .contains('disciplines', [params.discipline])

      const matchingIds = new Set(artistProfiles?.map((p) => p.user_id))
      filtered = filtered.filter((u) => matchingIds.has(u.id))
    }

    results = filtered
  }

  return (
    <div style={{ maxWidth: 640, margin: '40px auto', padding: '0 20px 80px' }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 20 }}>🔍 Buscar</h1>

      <SearchBar
        initialQuery={params.q ?? ''}
        initialRole={params.role ?? ''}
        initialDiscipline={params.discipline ?? ''}
        initialCity={params.city ?? ''}
        disciplines={DISCIPLINES}
      />

      {hasQuery && (
        <div style={{ marginTop: 20 }}>
          <p style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
            {results.length === 0
              ? 'No se encontraron resultados'
              : `${results.length} resultado${results.length !== 1 ? 's' : ''}`}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {results.map((profile) => (
              <Link
                key={profile.id}
                href={`/u/${profile.username}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: 14,
                  border: '1px solid #eee',
                  borderRadius: 10,
                }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: profile.avatar_url
                      ? `url(${profile.avatar_url}) center/cover`
                      : '#FFF0F2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18,
                    fontWeight: 600,
                    color: '#B00020',
                    flexShrink: 0,
                  }}>
                    {!profile.avatar_url && profile.full_name.charAt(0).toUpperCase()}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 500, fontSize: 14 }}>{profile.full_name}</p>
                    <p style={{ fontSize: 12, color: '#666' }}>@{profile.username}</p>
                    {profile.city && (
                      <p style={{ fontSize: 12, color: '#999', marginTop: 1 }}>📍 {profile.city}</p>
                    )}
                    {profile.bio && (
                      <p style={{ fontSize: 12, color: '#444', marginTop: 4, lineHeight: 1.4 }}>
                        {profile.bio.length > 80 ? profile.bio.slice(0, 80) + '...' : profile.bio}
                      </p>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end', flexShrink: 0 }}>
                    {profile.roles?.map((role: string) => (
                      <span key={role} style={{
                        fontSize: 10,
                        fontWeight: 500,
                        padding: '2px 8px',
                        borderRadius: 10,
                        background: '#FFF0F2',
                        color: '#B00020',
                        whiteSpace: 'nowrap',
                      }}>
                        {ROLE_LABELS[role] ?? role}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {!hasQuery && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
          <p style={{ fontSize: 32, marginBottom: 12 }}>🎭</p>
          <p style={{ fontSize: 15, fontWeight: 500, marginBottom: 6 }}>Encuentra artistas, profesores y compañías</p>
          <p style={{ fontSize: 13 }}>Busca por nombre, ciudad o disciplina</p>
        </div>
      )}
    </div>
  )
}
