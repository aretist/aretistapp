import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import DiscoverFollowButton from './DiscoverFollowButton'

const DISCIPLINE_LABELS: Record<string, string> = {
  dance: 'Danza', theater: 'Teatro', singing: 'Canto',
  circus: 'Circo', music: 'Música',
}

function Avatar({ url, name, size = 48 }: { url: string | null; name: string; size?: number }) {
  const initials = name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', overflow: 'hidden',
      backgroundColor: 'var(--pink)', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.32, fontWeight: 700, color: 'var(--red)', fontFamily: 'var(--font)',
    }}>
      {url
        ? <img src={url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : initials}
    </div>
  )
}

export default async function DiscoverPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Obtener perfil y disciplinas del usuario actual
  const [{ data: profile }, { data: artistProfile }, { data: following }] = await Promise.all([
    supabase.from('users').select('city, roles').eq('id', user.id).single(),
    supabase.from('artist_profiles').select('disciplines').eq('user_id', user.id).maybeSingle(),
    supabase.from('follows').select('following_id').eq('follower_id', user.id),
  ])

  const followingIds = following?.map(f => f.following_id) ?? []
  const myDisciplines = artistProfile?.disciplines ?? []
  const myCity = profile?.city ?? null

  // Excluir al propio usuario y a los que ya sigue
  const excludeIds = [user.id, ...followingIds]

  // Buscar usuarios con mismas disciplinas
  let suggestedByDiscipline: any[] = []
  if (myDisciplines.length > 0) {
    const { data: artistProfiles } = await supabase
      .from('artist_profiles')
      .select('user_id, disciplines')
      .overlaps('disciplines', myDisciplines)
      .not('user_id', 'in', `(${excludeIds.join(',')})`)
      .limit(20)

    if (artistProfiles && artistProfiles.length > 0) {
      const userIds = artistProfiles.map(p => p.user_id)
      const { data: users } = await supabase
        .from('users')
        .select('id, full_name, username, avatar_url, city, bio')
        .in('id', userIds)
        .limit(10)

      const disciplineMap = new Map(artistProfiles.map(p => [p.user_id, p.disciplines]))
      suggestedByDiscipline = (users ?? []).map(u => ({
        ...u,
        disciplines: disciplineMap.get(u.id) ?? [],
      }))
    }
  }

  // Buscar usuarios de la misma ciudad que no aparecen ya
  let suggestedByCity: any[] = []
  if (myCity) {
    const alreadySuggestedIds = suggestedByDiscipline.map(u => u.id)
    const excludeForCity = [...excludeIds, ...alreadySuggestedIds]

    const { data: cityUsers } = await supabase
      .from('users')
      .select('id, full_name, username, avatar_url, city, bio')
      .ilike('city', `%${myCity}%`)
      .not('id', 'in', `(${excludeForCity.join(',')})`)
      .limit(6)

    suggestedByCity = cityUsers ?? []
  }

  // Si no hay sugerencias por disciplina ni ciudad, mostrar usuarios recientes
  let recentUsers: any[] = []
  if (suggestedByDiscipline.length === 0 && suggestedByCity.length === 0) {
    const { data: recent } = await supabase
      .from('users')
      .select('id, full_name, username, avatar_url, city, bio')
      .not('id', 'in', `(${excludeIds.join(',')})`)
      .order('created_at', { ascending: false })
      .limit(10)
    recentUsers = recent ?? []
  }

  const UserCard = ({ u, followingIds }: { u: any; followingIds: string[] }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'white', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
      <Link href={`/u/${u.username}`} style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, textDecoration: 'none' }}>
        <Avatar url={u.avatar_url} name={u.full_name} />
        <div style={{ minWidth: 0 }}>
          <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', fontFamily: 'var(--font)' }}>{u.full_name}</p>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font)' }}>@{u.username}</p>
          {u.city && (
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font)', marginTop: 2 }}>📍 {u.city}</p>
          )}
          {u.disciplines?.length > 0 && (
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
              {u.disciplines.slice(0, 3).map((d: string) => (
                <span key={d} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: 'var(--bg-highlight)', color: 'var(--red)', fontFamily: 'var(--font)' }}>
                  {DISCIPLINE_LABELS[d] ?? d}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
      <DiscoverFollowButton
        targetUserId={u.id}
        isFollowing={followingIds.includes(u.id)}
      />
    </div>
  )

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 20px 80px' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--font)', color: 'var(--text-primary)', marginBottom: 4 }}>
        Descubrir
      </h1>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', fontFamily: 'var(--font)', marginBottom: 24 }}>
        Artistas y profesionales que quizás conozcas
      </p>

      {suggestedByDiscipline.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', fontFamily: 'var(--font)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Tu disciplina
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {suggestedByDiscipline.map(u => (
              <UserCard key={u.id} u={u} followingIds={followingIds} />
            ))}
          </div>
        </div>
      )}

      {suggestedByCity.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', fontFamily: 'var(--font)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            En tu ciudad
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {suggestedByCity.map(u => (
              <UserCard key={u.id} u={u} followingIds={followingIds} />
            ))}
          </div>
        </div>
      )}

      {recentUsers.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', fontFamily: 'var(--font)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Nuevos en Aretist
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentUsers.map(u => (
              <UserCard key={u.id} u={u} followingIds={followingIds} />
            ))}
          </div>
        </div>
      )}

      {suggestedByDiscipline.length === 0 && suggestedByCity.length === 0 && recentUsers.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <p style={{ fontSize: 32, marginBottom: 12 }}>🎭</p>
          <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-primary)', fontFamily: 'var(--font)' }}>
            Aún no hay más artistas en Aretist
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'var(--font)', marginTop: 6 }}>
            Invita a tus compañeros para crecer la comunidad
          </p>
        </div>
      )}
    </div>
  )
}
