import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import JobFilters from './JobFilters'
import JobCard from './JobCard'

const DISCIPLINES = [
  { value: '', label: 'Todas las disciplinas' },
  { value: 'dance', label: 'Danza' },
  { value: 'theater', label: 'Teatro' },
  { value: 'singing', label: 'Canto' },
  { value: 'circus', label: 'Circo' },
  { value: 'music', label: 'Música' },
]

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ discipline?: string; city?: string; duration?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  let query = supabase
    .from('jobs')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  if (params.discipline) {
    query = query.contains('disciplines', [params.discipline])
  }
  if (params.city) {
    query = query.ilike('city', `%${params.city}%`)
  }
  if (params.duration) {
    query = query.eq('duration_type', params.duration)
  }

  const { data: jobs } = await query

  // Traer employers por separado
  const employerIds = [...new Set(jobs?.map((j) => j.employer_id) ?? [])]

  const { data: employers } = employerIds.length
    ? await supabase.from('users').select('id, full_name, username, avatar_url').in('id', employerIds)
    : { data: [] }

  const { data: employerProfiles } = employerIds.length
    ? await supabase.from('employer_profiles').select('user_id, company_name, logo_url, verified').in('user_id', employerIds)
    : { data: [] }

  const employerMap = new Map(employers?.map((e) => [e.id, e]))
  const profileMap = new Map(employerProfiles?.map((p) => [p.user_id, p]))

  // Combinar datos
  const jobsWithEmployer = jobs?.map((job) => ({
    ...job,
    users: employerMap.get(job.employer_id) ?? null,
    employer_profiles: profileMap.get(job.employer_id) ?? null,
  })) ?? []

  // Candidaturas del usuario actual
  const { data: applications } = await supabase
    .from('job_applications')
    .select('job_id, status, saved')
    .eq('applicant_id', user.id)

  const applicationMap = new Map(applications?.map((a) => [a.job_id, a]))

  const { data: profile } = await supabase
    .from('users')
    .select('roles')
    .eq('id', user.id)
    .single()

  const isEmployer = profile?.roles?.includes('employer')

  return (
    <div style={{ maxWidth: 640, margin: '40px auto', padding: '0 20px 80px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600 }}> Empleos</h1>
        {isEmployer && (
          <Link
            href="/jobs/new"
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
            + Publicar oferta
          </Link>
        )}
      </div>

      <JobFilters disciplines={DISCIPLINES} currentFilters={params} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 20 }}>
        {!jobsWithEmployer.length && (
          <p style={{ fontSize: 14, color: '#999', textAlign: 'center', padding: '40px 0' }}>
            No hay ofertas publicadas con estos filtros.
          </p>
        )}
        {jobsWithEmployer.map((job: any) => (
          <JobCard
            key={job.id}
            job={job}
            application={applicationMap.get(job.id) ?? null}
          />
        ))}
      </div>
    </div>
  )
}
