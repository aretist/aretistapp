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
  { value: 'music', label: 'Música' },
]

const ROLE_LABELS: Record<string, string> = {
  artist: 'Artista',
  teacher: 'Profesor',
  employer: 'Empleador',
}

// Escapa caracteres especiales de PostgREST para evitar manipulación del filtro
function escapePostgREST(str: string): string {
  return str
    .replace(/[%_]/g, '\\$&')   // escapa wildcards SQL
    .replace(/[(),]/g, '')        // elimina caracteres de sintaxis PostgREST
    .trim()
    .slice(0, 100)                // limita longitud máxima
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

  // Validar y limpiar roles permitidos
  const allowedRoles = ['artist', 'teacher', 'employer']
  const safeRole = params.role && allowedRoles.includes(params.role) ? params.role : undefined

  // Validar disciplinas permitidas
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

    // Búsqueda por texto — columna por columna en vez de .or() interpolado
    if (params.q) {
      const safeQ = escapePostgREST(params.q)
      if (safeQ) {
        query = query.or(
          `full_name.ilike.%${safeQ}%,username.ilike.%${safeQ}%,city.ilike.%${safeQ}%`
        )
      }
    }

    if (safeRole) {
      query = query.contains('roles', [safeRole])
    }

    if (params.city && !params.q) {
      const safeCity = escapePostgREST(params.city)
      if (safeCity) {
        query = query.ilike('city', `%${safeCity}%`)
      }
    }

    const { data } = await query
    let filtered = data ?? []

    // Filtro por disciplina validada
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
            {results.length === 0
              ? 'No se encontraron resultados'
              : `${results.length} resultado${results.length !== 1 ? 's' : ''}`}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {results.map((profile) => (
              <Link key={profile.id} href={`/u/${profile.username}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, border: '0.5px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'white' }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%', overflow: 'hidden',
                    backgroundColor: 'var(--pink)', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, fontWeight: 600, color: 'var(--red)',
                  }}>
                    {profile.avatar_url
                      ? <img src={profile.avatar_url} alt={profile.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : profile.full_name.charAt(0).toUpperCase()}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 500, fontSize: 14, fontFamily: 'var(--font)', color: 'var(--text-primary)' }}>{profile.full_name}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font)' }}>@{profile.username}</p>
                    {profile.city && (
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 1, fontFamily: 'var(--font)' }}>📍 {profile.city}</p>
                    )}
                    {profile.bio && (
                      <p style={{ fontSize: 12, color: 'var(--text-primary)', marginTop: 4, lineHeight: 1.4, fontFamily: 'var(--font)' }}>
                        {profile.bio.length > 80 ? profile.bio.slice(0, 80) + '...' : profile.bio}
                      </p>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end', flexShrink: 0 }}>
                    {profile.roles?.map((role: string) => (
                      <span key={role} style={{ fontSize: 10, fontWeight: 500, padding: '2px 8px', borderRadius: 10, background: 'var(--bg-highlight)', color: 'var(--red)', whiteSpace: 'nowrap', fontFamily: 'var(--font)' }}>
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
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
          <p style={{ fontSize: 32, marginBottom: 12 }}>🎭</p>
          <p style={{ fontSize: 15, fontWeight: 500, marginBottom: 6, fontFamily: 'var(--font)', color: 'var(--text-primary)' }}>Encuentra artistas, profesores y compañías</p>
          <p style={{ fontSize: 13, fontFamily: 'var(--font)' }}>Busca por nombre, ciudad o disciplina</p>
        </div>
      )}
    </div>
  )
}
