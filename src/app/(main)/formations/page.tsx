import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import FormationFilters from './FormationFilters'
import FormationCard from './FormationCard'

export default async function FormationsPage({
  searchParams,
}: {
  searchParams: Promise<{ discipline?: string; subdiscipline?: string; city?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  let query = supabase
    .from('formations')
    .select('*')
    .in('status', ['published', 'full'])
    .gte('end_date', new Date().toISOString())
    .order('start_date', { ascending: true })

  if (params.discipline) {
    query = query.eq('discipline', params.discipline)
  }
  if (params.subdiscipline) {
    query = query.eq('subdiscipline', params.subdiscipline)
  }
  if (params.city) {
    query = query.ilike('city', `%${params.city}%`)
  }

  const { data: formations } = await query

  // Traer profesores por separado
  const teacherIds = [...new Set(formations?.map((f) => f.teacher_id) ?? [])]

  const { data: teachers } = teacherIds.length
    ? await supabase.from('users').select('id, full_name, username, avatar_url').in('id', teacherIds)
    : { data: [] }

  const teacherMap = new Map(teachers?.map((t) => [t.id, t]))

  const formationsWithTeacher = formations?.map((f) => ({
    ...f,
    teacher: teacherMap.get(f.teacher_id) ?? null,
  })) ?? []

  const { data: profile } = await supabase
    .from('users')
    .select('roles')
    .eq('id', user.id)
    .single()

  const isTeacher = profile?.roles?.includes('teacher') || profile?.roles?.includes('artist')

  return (
    <div style={{ maxWidth: 640, margin: '40px auto', padding: '0 20px 80px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600 }}> Formaciones</h1>
        {isTeacher && (
          <Link
            href="/formations/new"
            style={{
              padding: '8px 16px',
              background: 'var(--red)',
              color: 'white',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            + Publicar formación
          </Link>
        )}
      </div>

      <FormationFilters currentFilters={params} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 20 }}>
        {!formationsWithTeacher.length && (
          <p style={{ fontSize: 14, color: '#999', textAlign: 'center', padding: '40px 0' }}>
            No hay formaciones próximas con estos filtros.
          </p>
        )}
        {formationsWithTeacher.map((formation: any) => (
          <FormationCard key={formation.id} formation={formation} />
        ))}
      </div>
    </div>
  )
}
