import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { redirect } from 'next/navigation'
import AdminJobActions from './AdminJobActions'

export default async function AdminJobsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) redirect('/feed')

  const service = createServiceClient()

  // Traemos los jobs sin joins
  const { data: pendingJobs } = await service
    .from('jobs')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  const { data: publishedJobs } = await service
    .from('jobs')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(20)

  // Traemos los usuarios de los employer_ids únicos
  const allJobs = [...(pendingJobs ?? []), ...(publishedJobs ?? [])]
  const employerIds = [...new Set(allJobs.map((j) => j.employer_id))]

  const { data: employers } = employerIds.length
    ? await service.from('users').select('id, full_name, username').in('id', employerIds)
    : { data: [] }

  const { data: employerProfiles } = employerIds.length
    ? await service.from('employer_profiles').select('user_id, company_name').in('user_id', employerIds)
    : { data: [] }

  const employerMap = new Map(employers?.map((e) => [e.id, e]))
  const profileMap = new Map(employerProfiles?.map((p) => [p.user_id, p]))

  function getCompanyName(employerId: string) {
    return profileMap.get(employerId)?.company_name ?? employerMap.get(employerId)?.full_name ?? 'Empresa'
  }

  return (
    <div style={{ maxWidth: 720, margin: '40px auto', padding: '0 20px 80px' }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 4 }}>🛡️ Admin — Empleos</h1>
      <p style={{ fontSize: 13, color: '#666', marginBottom: 28 }}>
        Revisa y modera las ofertas de trabajo antes de publicarlas.
      </p>

      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
          Pendientes de revisión {pendingJobs?.length ? `(${pendingJobs.length})` : ''}
        </h2>

        {!pendingJobs?.length && (
          <p style={{ fontSize: 13, color: '#999' }}>No hay ofertas pendientes</p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {pendingJobs?.map((job: any) => (
            <div key={job.id} style={{ border: '1px solid #FAEEDA', borderRadius: 10, padding: 16, background: '#FFFDF7' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: 15 }}>{job.title}</p>
                  <p style={{ fontSize: 13, color: '#666', marginTop: 2 }}>
                    {getCompanyName(job.employer_id)}
                  </p>
                  {job.city && <p style={{ fontSize: 12, color: '#999', marginTop: 2 }}>📍 {job.city}</p>}
                  <p style={{ fontSize: 13, color: '#444', marginTop: 8, lineHeight: 1.5 }}>
                    {job.description.length > 200 ? job.description.slice(0, 200) + '...' : job.description}
                  </p>
                </div>
                <AdminJobActions jobId={job.id} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
          Publicadas recientemente {publishedJobs?.length ? `(${publishedJobs.length})` : ''}
        </h2>

        {!publishedJobs?.length && (
          <p style={{ fontSize: 13, color: '#999' }}>No hay ofertas publicadas</p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {publishedJobs?.map((job: any) => (
            <div key={job.id} style={{ border: '1px solid #E1F5EE', borderRadius: 10, padding: 14, background: '#F8FFFC' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <div>
                  <p style={{ fontWeight: 500, fontSize: 14 }}>{job.title}</p>
                  <p style={{ fontSize: 12, color: '#666' }}>{getCompanyName(job.employer_id)}</p>
                </div>
                <AdminJobActions jobId={job.id} currentStatus="published" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
